export interface LearnerSkillItem {
  skill_id: string;
  skill_name: string;
  category: string;
  level: number;
  evidence_type: string;
  evidence_notes?: string;
}

export interface CertificationItem {
  id?: string;
  title: string;
  issuer?: string;
  issue_date?: string;
  credential_url?: string;
}

export interface ProjectItem {
  id?: string;
  title: string;
  description?: string;
  project_url?: string;
}

export interface LearnerProfile {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  current_role: string;
  goal_role_id?: string;
  goal_role_title?: string;
  weekly_hours: number;
  learning_preference: string;
  bio?: string;
  skills: LearnerSkillItem[];
  certifications: CertificationItem[];
  projects: ProjectItem[];
}

export interface RoleSkillItem {
  skill_id: string;
  skill_name: string;
  required_level: number;
  importance_weight: number;
  is_core: boolean;
}

export interface CareerRole {
  id: string;
  title: string;
  category: string;
  description?: string;
  required_skills: RoleSkillItem[];
}

export interface CareerMatchItem {
  role_id: string;
  title: string;
  category: string;
  readiness_percent: number;
  total_skills: number;
  matched_skills: number;
  missing_skills: number;
  strengths: string[];
  priority_gaps: string[];
  description?: string;
}

export interface CareerMatchResponse {
  matches: CareerMatchItem[];
  current_target_id?: string;
}

export interface SkillGapItem {
  skill_id: string;
  skill_name: string;
  current_level: number;
  required_level: number;
  gap: number;
  status: 'strength' | 'partial_gap' | 'major_gap';
  importance_weight: number;
  is_core: boolean;
  why_it_matters: string;
  recommended_action: string;
}

export interface SkillGapAnalysis {
  role_id: string;
  role_title: string;
  readiness_percent: number;
  strengths: SkillGapItem[];
  partial_gaps: SkillGapItem[];
  major_gaps: SkillGapItem[];
  all_gaps: SkillGapItem[];
  formula_explanation: string;
}

export interface ResourceItem {
  id: string;
  skill_id: string;
  skill_name?: string;
  title: string;
  url: string;
  provider: string;
  type: string;
  duration_minutes: number;
  difficulty: string;
  language: string;
  verified: boolean;
  description?: string;
}

export interface RoadmapTaskItem {
  id: string;
  phase: string;
  week_number: number;
  title: string;
  description?: string;
  skill_id?: string;
  skill_name?: string;
  resource?: ResourceItem;
  status: 'pending' | 'in_progress' | 'completed' | 'archived';
  estimated_minutes: number;
  completion_criteria?: string;
  why_recommended?: string;
  is_remedial: boolean;
}

export interface RoadmapPhaseItem {
  phase_name: string;
  weeks: number[];
  tasks: RoadmapTaskItem[];
  milestone_assessment?: string;
}

export interface RoadmapResponse {
  id: string;
  role_id: string;
  role_title: string;
  version: number;
  status: string;
  change_reason?: string;
  generated_at: string;
  phases: RoadmapPhaseItem[];
  tasks: RoadmapTaskItem[];
  total_tasks: number;
  completed_tasks: number;
  completion_percent: number;
  final_mini_project?: {
    title: string;
    description: string;
    acceptance_criteria: string[];
  };
}

export interface RoadmapVersionSummary {
  id: string;
  version: number;
  status: string;
  change_reason?: string;
  generated_at: string;
  task_count: number;
}

export interface QuestionItem {
  id: string;
  question: string;
  options: string[];
  concept?: string;
}

export interface AssessmentStartResponse {
  assessment_id: string;
  skill_id: string;
  skill_name: string;
  title: string;
  difficulty: string;
  total_questions: number;
  questions: QuestionItem[];
}

export interface AssessmentQuestionReview {
  question_id: string;
  question: string;
  options: string[];
  selected_answer: number;
  correct_answer: number;
  is_correct: boolean;
  explanation?: string;
  concept?: string;
}

export interface AssessmentResultResponse {
  attempt_id: string;
  assessment_id: string;
  skill_id: string;
  skill_name: string;
  score_percent: number;
  passed: boolean;
  new_mastery_level: number;
  previous_mastery_level: number;
  review: AssessmentQuestionReview[];
  adaptation_triggered: boolean;
  adaptation_message?: string;
}

export interface ChangeGoalResponse {
  success: boolean;
  old_role_title: string;
  new_role_title: string;
  transferable_skills: string[];
  new_gaps: string[];
  archived_tasks_count: number;
  new_roadmap_version: number;
  explanation: string;
}

export interface MentorChatResponse {
  reply: string;
  suggested_actions: string[];
  agent_name: string;
  timestamp: string;
}

export interface AgentLogItem {
  id: string;
  workflow_id?: string;
  agent_name: string;
  event_type: string;
  message: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface HealthResponse {
  status: string;
  database: string;
  openrouter_configured: boolean;
  openrouter_model: string;
  time: string;
}

export interface DemoUser {
  user_id: string;
  name: string;
  email: string;
  current_role?: string;
  goal_role_title?: string;
  skill_count: number;
  weekly_hours?: number;
}
