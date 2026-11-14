import {
  LearnerProfile,
  CareerRole,
  CareerMatchResponse,
  SkillGapAnalysis,
  RoadmapResponse,
  RoadmapVersionSummary,
  AssessmentStartResponse,
  AssessmentResultResponse,
  ChangeGoalResponse,
  MentorChatResponse,
  AgentLogItem,
  ResourceItem,
  HealthResponse,
  DemoUser
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const DEFAULT_USER_ID = 'demo-user-alex';
const USER_STORAGE_KEY = 'skillbridge.user_id';

let currentUserId: string = DEFAULT_USER_ID;

// Restore a previously signed-in learner across reloads.
try {
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  if (stored) currentUserId = stored;
} catch {
  // localStorage unavailable (SSR / private mode) - fall back to default
}

export function setActiveUserId(userId: string) {
  currentUserId = userId;
  try {
    localStorage.setItem(USER_STORAGE_KEY, userId);
  } catch {
    // ignore persistence failures
  }
}

export function getActiveUserId(): string {
  return currentUserId || DEFAULT_USER_ID;
}

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Try direct configured URL first
  const primaryUrl = `${API_BASE}${endpoint}`;
  try {
    const response = await fetch(primaryUrl, { ...options, headers });
    if (response.ok) {
      return await response.json();
    }
    // If 404 or server error, and API_BASE was non-empty, try relative fallback (via Vite proxy)
    if (API_BASE && endpoint.startsWith('/api')) {
      const fallbackResponse = await fetch(endpoint, { ...options, headers });
      if (fallbackResponse.ok) {
        return await fallbackResponse.json();
      }
    }
    let errorDetail = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) errorDetail = errorJson.detail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  } catch (err: any) {
    // If fetch failed due to network (e.g. port mismatch), try fallback proxy
    if (API_BASE && endpoint.startsWith('/api')) {
      try {
        const fallbackResponse = await fetch(endpoint, { ...options, headers });
        if (fallbackResponse.ok) {
          return await fallbackResponse.json();
        }
      } catch {
        // ignore
      }
    }
    throw err;
  }
}

export const api = {
  // Auth
  login: (userId = getActiveUserId()) =>
    fetchJson<{ user_id: string; name: string; email: string; demo: boolean; message: string }>(
      `/api/login?user_id=${encodeURIComponent(userId)}`,
      { method: 'POST' }
    ),

  listDemoUsers: () =>
    fetchJson<DemoUser[]>('/api/demo/users'),

  // Health
  getHealth: () => fetchJson<HealthResponse>('/api/health'),

  // Demo Controls
  loadDemo: () => fetchJson<{ status: string; message: string }>('/api/demo/load', { method: 'POST' }),
  resetDemo: () => fetchJson<{ status: string; message: string }>('/api/demo/reset', { method: 'POST' }),

  // Profile
  getProfile: (userId = getActiveUserId()) =>
    fetchJson<LearnerProfile>(`/api/profile?user_id=${userId}`),

  updateProfile: (profileData: any, userId = getActiveUserId()) =>
    fetchJson<LearnerProfile>(`/api/profile?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(profileData),
    }),

  // Careers & Matching
  getCareers: () => fetchJson<CareerRole[]>('/api/careers'),

  createCareer: (data: {
    title: string;
    category: string;
    description?: string;
    required_skills: Array<{
      skill_name: string;
      required_level: number;
      importance_weight?: number;
      is_core?: boolean;
    }>;
  }) => fetchJson<CareerRole>('/api/careers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  matchCareers: (userId = getActiveUserId()) =>
    fetchJson<CareerMatchResponse>(`/api/careers/match?user_id=${userId}`, { method: 'POST' }),

  // Skill Gap Analysis
  analyzeSkillGaps: (roleId?: string, userId = getActiveUserId()) => {
    const query = roleId ? `?user_id=${userId}&role_id=${roleId}` : `?user_id=${userId}`;
    return fetchJson<SkillGapAnalysis>(`/api/career/analyze${query}`, { method: 'POST' });
  },

  // Roadmap
  getRoadmap: (userId = getActiveUserId()) =>
    fetchJson<RoadmapResponse>(`/api/roadmap?user_id=${userId}`),

  getRoadmapVersions: (userId = getActiveUserId()) =>
    fetchJson<RoadmapVersionSummary[]>(`/api/roadmap/versions?user_id=${userId}`),

  generateRoadmap: (roleId?: string, userId = getActiveUserId()) => {
    const query = roleId ? `?user_id=${userId}&role_id=${roleId}` : `?user_id=${userId}`;
    return fetchJson<RoadmapResponse>(`/api/roadmap/generate${query}`, { method: 'POST' });
  },

  updateTaskStatus: (taskId: string, status: string, userId = getActiveUserId()) =>
    fetchJson<{ status: string; task_id: string; new_status: string }>(
      `/api/roadmap/tasks/${taskId}?user_id=${userId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    ),

  // Assessments
  startAssessment: (skillName: string, difficulty = 'Beginner', userId = getActiveUserId()) =>
    fetchJson<AssessmentStartResponse>(
      `/api/assessment/start?user_id=${userId}&skill_name=${encodeURIComponent(skillName)}&difficulty=${difficulty}`,
      { method: 'POST' }
    ),

  submitAssessment: (assessmentId: string, answers: Record<string, number>, userId = getActiveUserId()) =>
    fetchJson<AssessmentResultResponse>(`/api/assessment/submit?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify({ assessment_id: assessmentId, answers }),
    }),

  // Goal Change
  changeGoal: (newRoleId: string, reason?: string, userId = getActiveUserId()) =>
    fetchJson<ChangeGoalResponse>(`/api/career/change-goal?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify({ new_role_id: newRoleId, reason }),
    }),

  // AI Mentor
  mentorChat: (message: string, userId = getActiveUserId()) =>
    fetchJson<MentorChatResponse>(`/api/mentor/chat?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  // Agent Activity Logs
  getAgentLogs: (limit = 40, userId = getActiveUserId()) =>
    fetchJson<AgentLogItem[]>(`/api/agents/logs?user_id=${userId}&limit=${limit}`),

  // Resources Catalog
  getResources: (skillName?: string) => {
    const query = skillName ? `?skill_name=${encodeURIComponent(skillName)}` : '';
    return fetchJson<ResourceItem[]>(`/api/resources${query}`);
  },

  // OpenRouter Free Models
  getModels: () =>
    fetchJson<{ active_model: string; is_configured: boolean; models: Array<{ id: string; name: string; provider: string; description: string }> }>('/api/models'),

  selectModel: (modelId: string) =>
    fetchJson<{ status: string; active_model: string; message: string }>(`/api/models/select?model_id=${encodeURIComponent(modelId)}`, {
      method: 'POST',
    }),
};

