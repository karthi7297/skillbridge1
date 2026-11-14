import React, { useState, useEffect } from 'react';
import {
  Compass,
  Target,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  BookOpen,
  Activity,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Play,
  FileText,
  Filter,
  MoreVertical
} from 'lucide-react';
import { api } from '../services/api';
import { LearnerProfile, RoadmapResponse, SkillGapAnalysis, AgentLogItem } from '../types';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [gaps, setGaps] = useState<SkillGapAnalysis | null>(null);
  const [recentLogs, setRecentLogs] = useState<AgentLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [profData, roadData, logData] = await Promise.all([
        api.getProfile(),
        api.getRoadmap(),
        api.getAgentLogs(5)
      ]);
      setProfile(profData);
      setRoadmap(roadData);
      setRecentLogs(logData);

      if (roadData?.role_id) {
        const gapData = await api.analyzeSkillGaps(roadData.role_id);
        setGaps(gapData);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading student dashboard & agent state...</p>
      </div>
    );
  }

  const nextTask = roadmap?.tasks.find(t => t.status === 'pending');
  const completedTasksCount = roadmap?.completed_tasks || 0;
  const totalTasksCount = roadmap?.total_tasks || 0;
  const completionPct = roadmap?.completion_percent || 0;
  const readinessScore = gaps?.readiness_percent || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome Banner matching purple gradient style */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-800 p-4 sm:p-7 text-white shadow-xl shadow-violet-500/15">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/25 text-white text-xs font-semibold mb-2.5 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Learner Profile • Alex Chen</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
              Targeting {profile?.goal_role_title || 'Full Stack Developer'}
            </h1>
            <p className="text-xs sm:text-sm text-violet-100 mt-1 max-w-xl leading-relaxed">
              Pacing: <strong className="text-white">{profile?.weekly_hours || 6} hrs/week</strong> • Preferences: <span className="capitalize">{profile?.learning_preference}</span> • Roadmap Active: <span className="underline decoration-white/40">v{roadmap?.version || 1}</span>
            </p>
          </div>

          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => onNavigate('assessment')}
              className="px-4 py-2.5 rounded-xl bg-white text-violet-700 hover:bg-violet-50 text-xs font-extrabold shadow-md shadow-black/10 transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
            >
              <span>Take Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('mentor')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 text-xs font-semibold transition-all backdrop-blur-sm flex items-center justify-center gap-2"
            >
              <span>Ask AI Mentor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row matching SaaS card layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Estimated Readiness Score */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 sm:mb-2">
            <span className="font-semibold text-[11px] sm:text-xs">Career Readiness</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-violet-100 flex items-center justify-center">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{readinessScore}%</span>
            <span className="text-[10px] sm:text-xs text-slate-400">weighted</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 sm:h-2 rounded-full mt-2.5 sm:mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-violet-600 to-purple-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, readinessScore))}%` }}
            />
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1.5 sm:mt-2 font-mono truncate">Σ(w_i * coverage_i) / Σ(w_i)</p>
        </div>

        {/* Roadmap Progress */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 sm:mb-2">
            <span className="font-semibold text-[11px] sm:text-xs">Roadmap Progress</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{completionPct}%</span>
            <span className="text-[10px] sm:text-xs text-slate-400">{completedTasksCount}/{totalTasksCount}</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 sm:h-2 rounded-full mt-2.5 sm:mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, completionPct)}%` }}
            />
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1.5 sm:mt-2 truncate">Milestone v{roadmap?.version || 1}</p>
        </div>

        {/* Major Skill Gaps */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 sm:mb-2">
            <span className="font-semibold text-[11px] sm:text-xs">Priority Gaps</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{gaps?.major_gaps.length || 0}</span>
            <span className="text-[10px] sm:text-xs text-slate-400">critical</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2.5 sm:mt-3">
            {gaps?.major_gaps.slice(0, 2).map((g, idx) => (
              <span key={idx} className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-semibold truncate max-w-[80px] sm:max-w-none">
                {g.skill_name}
              </span>
            ))}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1.5 sm:mt-2 truncate">By Skill Analyst</p>
        </div>

        {/* Verified Strengths */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 sm:mb-2">
            <span className="font-semibold text-[11px] sm:text-xs">Strengths</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-cyan-100 flex items-center justify-center">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{gaps?.strengths.length || 0}</span>
            <span className="text-[10px] sm:text-xs text-slate-400">mastered</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2.5 sm:mt-3">
            {gaps?.strengths.slice(0, 2).map((s, idx) => (
              <span key={idx} className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200 font-semibold truncate max-w-[80px] sm:max-w-none">
                {s.skill_name}
              </span>
            ))}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1.5 sm:mt-2 truncate">Preserved on goal change</p>
        </div>
      </div>

      {/* Main SaaS Content Table directly modeled after Invoice table in screenshot */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Roadmap Curriculum Tasks</h2>
            <p className="text-xs text-slate-400 mt-0.5">Structured prerequisite sequence generated by Roadmap Planner</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('roadmap')}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Full Roadmap</span>
            </button>
            <button
              onClick={() => onNavigate('assessment')}
              className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Verify Skills</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[580px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-5">Curriculum Milestone</th>
                <th className="py-3 px-4">Pacing</th>
                <th className="py-3 px-4">Skill Category</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {roadmap?.tasks.slice(0, 5).map((task) => {
                const isCompleted = task.status === 'completed';
                const isRemedial = task.is_remedial;

                return (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Title */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-700'
                            : isRemedial
                            ? 'bg-red-100 text-red-700'
                            : 'bg-violet-100 text-violet-700'
                        }`}>
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <span className={`font-bold block ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {task.title}
                          </span>
                          <span className="text-[11px] text-slate-400 line-clamp-1">
                            {task.resource?.provider || 'Curated Resource'} • {task.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Week */}
                    <td className="py-3.5 px-4 font-mono text-slate-600 font-semibold">
                      Week {task.week_number}
                    </td>

                    {/* Skill Tag */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium text-[11px]">
                        {task.skill_name || 'General'}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      ~{task.estimated_minutes}m
                    </td>

                    {/* Status Pill matching screenshot */}
                    <td className="py-3.5 px-4">
                      {isCompleted ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                          Completed
                        </span>
                      ) : isRemedial ? (
                        <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold text-[10px]">
                          Remedial
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-5 text-right">
                      {task.resource ? (
                        <a
                          href={task.resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold text-xs border border-violet-200 transition-colors"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <button
                          onClick={() => onNavigate('roadmap')}
                          className="text-slate-400 hover:text-slate-600 p-1"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Grid: Next Recommended Action & Live Agent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Task Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">Next Recommended Step</span>
              <span className="text-xs font-mono text-slate-400">Week {nextTask?.week_number || 1}</span>
            </div>

            {nextTask ? (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900">{nextTask.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{nextTask.description}</p>

                {nextTask.why_recommended && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    <strong className="text-slate-800">Why this was scheduled: </strong>
                    {nextTask.why_recommended}
                  </div>
                )}

                {nextTask.resource && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-violet-50 border border-violet-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-900 block">{nextTask.resource.title}</span>
                        <span className="text-[11px] text-slate-500">
                          {nextTask.resource.provider} • {nextTask.resource.duration_minutes} mins
                        </span>
                      </div>
                    </div>

                    <a
                      href={nextTask.resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors"
                    >
                      Open Link
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">All tasks completed!</p>
            )}
          </div>

          <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Estimated ~{nextTask?.estimated_minutes || 120} mins</span>
            <button
              onClick={() => onNavigate('roadmap')}
              className="text-xs text-violet-600 hover:text-violet-800 font-semibold flex items-center gap-1"
            >
              <span>View Full Roadmap</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Agent Activity Feed */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-violet-600" />
                <span>Live Agent Activity</span>
              </span>
              <button
                onClick={() => onNavigate('activity')}
                className="text-xs text-violet-600 hover:text-violet-800 font-semibold"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {recentLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-violet-700">{log.agent_name}</span>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">{log.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">Emitted by backend AgentRouter</span>
          </div>
        </div>
      </div>
    </div>
  );
};
