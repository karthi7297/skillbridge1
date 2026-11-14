from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.models.models import (
    User, Skill, LearnerSkill, Assessment, AssessmentQuestion,
    AssessmentAttempt, SkillMasteryHistory, AgentLog
)
from backend.app.data.quiz_data import get_fallback_quiz
from backend.app.ai.openrouter_client import openrouter_client


class ProgressEvaluatorAgent:
    """
    Progress Evaluator Agent: Manages adaptive assessments, grades submissions,
    updates skill mastery history, and triggers adaptive remediation when score < 60%.
    """

    def __init__(self, db: Session):
        self.db = db
        self.agent_name = "Progress Evaluator"

    def log_event(self, user_id: str, message: str, event_type: str = "assessment_graded", metadata: Optional[Dict] = None):
        log = AgentLog(
            user_id=user_id,
            workflow_id="progress_evaluation",
            agent_name=self.agent_name,
            event_type=event_type,
            message=message,
            metadata_json=metadata or {},
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(log)
        self.db.commit()

    def generate_quiz(self, user_id: str, skill_id: str, difficulty: str = "Beginner") -> Assessment:
        """
        Creates an assessment with questions for the requested skill.
        Uses deterministic question bank (with optional AI enhancement).
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User {user_id} not found")

        skill = self.db.query(Skill).filter(Skill.id == skill_id).first()
        if not skill:
            raise ValueError(f"Skill {skill_id} not found")

        # Get questions from verified question bank
        raw_questions = get_fallback_quiz(skill.name, difficulty)
        if not raw_questions:
            raw_questions = get_fallback_quiz("JavaScript", "Beginner")

        assessment = Assessment(
            user_id=user.id,
            skill_id=skill.id,
            title=f"{skill.name} Mastery Assessment ({difficulty})",
            difficulty=difficulty,
            total_questions=len(raw_questions),
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(assessment)
        self.db.flush()

        for q_data in raw_questions:
            q = AssessmentQuestion(
                assessment_id=assessment.id,
                question=q_data["question"],
                options_json=q_data["options"],
                correct_answer=q_data["correct_answer"],
                explanation=q_data.get("explanation"),
                concept=q_data.get("concept", "General")
            )
            self.db.add(q)

        self.db.commit()

        self.log_event(
            user.id,
            f"Generated {difficulty} quiz for '{skill.name}' with {len(raw_questions)} questions.",
            event_type="assessment_created",
            metadata={"skill": skill.name, "difficulty": difficulty, "questions_count": len(raw_questions)}
        )

        return assessment

    def grade_assessment(self, user_id: str, assessment_id: str, answers: Dict[str, int]) -> Dict[str, Any]:
        """
        Grades an assessment attempt, records mastery, and triggers remediation if score < 60%.
        """
        assessment = self.db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise ValueError(f"Assessment {assessment_id} not found")

        questions = assessment.questions
        total_questions = len(questions)
        if total_questions == 0:
            raise ValueError("No questions found for this assessment")

        correct_count = 0
        review = []
        weak_concepts = []

        for q in questions:
            selected_idx = answers.get(q.id, -1)
            is_correct = (selected_idx == q.correct_answer)
            if is_correct:
                correct_count += 1
            else:
                if q.concept and q.concept not in weak_concepts:
                    weak_concepts.append(q.concept)

            review.append({
                "question_id": q.id,
                "question": q.question,
                "options": q.options_json,
                "selected_answer": selected_idx,
                "correct_answer": q.correct_answer,
                "is_correct": is_correct,
                "explanation": q.explanation,
                "concept": q.concept
            })

        score_percent = round((correct_count / total_questions) * 100.0, 1)
        passed = (score_percent >= 60.0)

        # Record attempt
        attempt = AssessmentAttempt(
            assessment_id=assessment.id,
            user_id=user_id,
            score=score_percent,
            answers_json=answers,
            submitted_at=datetime.now(timezone.utc)
        )
        self.db.add(attempt)
        self.db.flush()

        # Update LearnerSkill level
        learner_skill = self.db.query(LearnerSkill).filter(
            LearnerSkill.user_id == user_id,
            LearnerSkill.skill_id == assessment.skill_id
        ).first()

        prev_level = learner_skill.level if learner_skill else 0
        new_level = prev_level

        if passed:
            if score_percent >= 80.0:
                new_level = min(5, prev_level + 1)
            else:
                new_level = max(prev_level, 2)
            evidence_type = "assessment-verified"
        else:
            # Below 60% - hold level or mark needed remediation
            new_level = max(0, prev_level)
            evidence_type = "needs-remediation"

        if not learner_skill:
            learner_skill = LearnerSkill(
                user_id=user_id,
                skill_id=assessment.skill_id,
                level=new_level,
                evidence_type=evidence_type,
                evidence_notes=f"Scored {score_percent}% on {assessment.title}"
            )
            self.db.add(learner_skill)
        else:
            learner_skill.level = new_level
            learner_skill.evidence_type = evidence_type
            learner_skill.evidence_notes = f"Scored {score_percent}% on {assessment.title}"

        # Record mastery history
        history = SkillMasteryHistory(
            user_id=user_id,
            skill_id=assessment.skill_id,
            mastery_level=new_level,
            source="assessment",
            assessment_attempt_id=attempt.id,
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(history)
        self.db.commit()

        # Evaluation & adaptation trigger
        adaptation_triggered = not passed
        adaptation_message = None

        skill_name = assessment.skill.name if assessment.skill else "Skill"

        if adaptation_triggered:
            weak_text = f" Identified weak concepts: {', '.join(weak_concepts)}." if weak_concepts else ""
            adaptation_message = (
                f"Assessment score is {score_percent}%; mastery is below the 60% threshold. "
                f"Triggered automatic remediation workflow.{weak_text}"
            )
            self.log_event(
                user_id,
                adaptation_message,
                event_type="adaptation_triggered",
                metadata={
                    "skill": skill_name,
                    "score": score_percent,
                    "weak_concepts": weak_concepts,
                    "status": "remediation_required"
                }
            )
        else:
            log_msg = f"Passed {assessment.title} with {score_percent}%. Skill mastery updated to Level {new_level}."
            self.log_event(
                user_id,
                log_msg,
                event_type="assessment_passed",
                metadata={"skill": skill_name, "score": score_percent, "new_level": new_level}
            )

        return {
            "attempt_id": attempt.id,
            "assessment_id": assessment.id,
            "skill_id": assessment.skill_id,
            "skill_name": skill_name,
            "score_percent": score_percent,
            "passed": passed,
            "previous_mastery_level": prev_level,
            "new_mastery_level": new_level,
            "review": review,
            "adaptation_triggered": adaptation_triggered,
            "adaptation_message": adaptation_message,
            "weak_concepts": weak_concepts
        }

