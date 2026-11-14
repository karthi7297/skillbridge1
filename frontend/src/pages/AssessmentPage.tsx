import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Award,
  Zap,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import { AssessmentStartResponse, AssessmentResultResponse } from '../types';

interface AssessmentPageProps {
  onAssessmentCompleted?: () => void;
  onNavigateToRoadmap?: () => void;
}

export const AssessmentPage: React.FC<AssessmentPageProps> = ({
  onAssessmentCompleted,
  onNavigateToRoadmap
}) => {
  const [selectedSkill, setSelectedSkill] = useState('JavaScript');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [quiz, setQuiz] = useState<AssessmentStartResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResultResponse | null>(null);

  useEffect(() => {
    loadNewQuiz();
  }, [selectedSkill, difficulty]);

  const loadNewQuiz = async () => {
    setLoadingQuiz(true);
    setResult(null);
    setAnswers({});
    try {
      const data = await api.startAssessment(selectedSkill, difficulty);
      setQuiz(data);
    } catch (err) {
      console.error("Failed to start assessment", err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const res = await api.submitAssessment(quiz.assessment_id, answers);
      setResult(res);
      if (onAssessmentCompleted) onAssessmentCompleted();
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Demo Helper: Fill wrong answers to trigger poor score adaptation
  const handleDeliberatelyFail = async () => {
    if (!quiz) return;
    const wrongAnswers: Record<string, number> = {};
    quiz.questions.forEach(q => {
      wrongAnswers[q.id] = 3;
    });
    setAnswers(wrongAnswers);
    setSubmitting(true);
    try {
      const res = await api.submitAssessment(quiz.assessment_id, wrongAnswers);
      setResult(res);
      if (onAssessmentCompleted) onAssessmentCompleted();
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
      {/* Title & Skills Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600 shrink-0" />
            <span>Adaptive Skill Assessment</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Graded by the <strong>Progress Evaluator Agent</strong>. Scores below 60% automatically trigger remediation replanning.
          </p>
        </div>

        {/* Skill & Difficulty Pickers */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-violet-400 font-semibold shadow-xs"
          >
            <option value="JavaScript">JavaScript</option>
            <option value="React">React</option>
            <option value="Python">Python</option>
            <option value="SQL & Relational Databases">SQL & Relational</option>
            <option value="HTML & CSS">HTML & CSS</option>
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-violet-400 font-semibold shadow-xs"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
          </select>
        </div>
      </div>

      {/* Adaptive Remediation Alert Banner (Trigger B in Hackathon Spec) */}
      {result && result.adaptation_triggered && (
        <div className="p-4 sm:p-5 rounded-2xl bg-red-50 border-2 border-red-200 space-y-3 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2 text-red-700 text-sm font-bold">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <span>Adaptive Trigger Activated: Assessment Score Below 60%</span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            {result.adaptation_message}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2">
            <span className="text-[11px] sm:text-xs text-slate-500">
              Evaluator Agent requested Roadmap Planner to insert remedial practice task and postpone milestones.
            </span>
            {onNavigateToRoadmap && (
              <button
                onClick={onNavigateToRoadmap}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>View Adapted Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Passed Success Banner */}
      {result && !result.adaptation_triggered && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 space-y-2 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>Assessment Passed with {result.score_percent}%!</span>
          </div>
          <p className="text-xs text-slate-600">
            Great mastery demonstrated. Your proficiency for <strong>{result.skill_name}</strong> has been updated to Level {result.new_mastery_level} in your learner profile.
          </p>
        </div>
      )}

      {/* Quiz Loading State */}
      {loadingQuiz ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : quiz ? (
        <div className="space-y-5 sm:space-y-6">
          {/* Quick Demo Assist Banner */}
          {!result && (
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 p-3 sm:p-3.5 rounded-xl bg-violet-50 border border-violet-200 text-xs shadow-xs">
              <span className="text-gray-600 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-violet-600" />
                <span>Hackathon Demo Helper: Test the &lt;60% remediation flow in 1-click!</span>
              </span>
              <button
                onClick={handleDeliberatelyFail}
                disabled={submitting}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                Simulate Poor Score (&lt;60%)
              </button>
            </div>
          )}

          {/* Question List */}
          <div className="space-y-5">
            {quiz.questions.map((q, qIdx) => {
              const reviewItem = result?.review.find(r => r.question_id === q.id);

              return (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-white border border-violet-100 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-violet-600 font-bold">Question 0{qIdx + 1}</span>
                    {q.concept && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium border border-violet-200">
                        Concept: {q.concept}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900">{q.question}</h3>

                  {/* Options */}
                  <div className="space-y-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[q.id] === optIdx;
                      let optionClasses = 'border-gray-200 bg-white text-gray-700 hover:border-violet-300 hover:bg-violet-50/50';

                      if (result && reviewItem) {
                        if (optIdx === reviewItem.correct_answer) {
                          optionClasses = 'border-emerald-300 bg-emerald-50 text-emerald-800 font-medium';
                        } else if (isSelected && !reviewItem.is_correct) {
                          optionClasses = 'border-red-300 bg-red-50 text-red-800 font-medium';
                        }
                      } else if (isSelected) {
                        optionClasses = 'border-violet-500 bg-violet-50 text-violet-900 font-semibold ring-2 ring-violet-200';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={!!result}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${optionClasses}`}
                        >
                          <span>{opt}</span>
                          {result && reviewItem && optIdx === reviewItem.correct_answer && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 ml-2" />
                          )}
                          {result && reviewItem && isSelected && !reviewItem.is_correct && (
                            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after submission */}
                  {result && reviewItem?.explanation && (
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 mt-2">
                      <strong className="text-gray-900">Explanation: </strong>
                      {reviewItem.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit / Retry Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            {result ? (
              <button
                onClick={loadNewQuiz}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold border border-gray-300 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Take Another Quiz</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length === 0}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition-all disabled:opacity-50"
              >
                <span>{submitting ? 'Grading Assessment...' : 'Submit Assessment'}</span>
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
