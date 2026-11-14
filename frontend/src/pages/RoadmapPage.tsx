import React, { useState, useEffect } from 'react';
import {
  MapPin,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  History,
  FolderGit2,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import { RoadmapResponse, RoadmapVersionSummary, RoadmapTaskItem } from '../types';

interface RoadmapPageProps {
  onTaskCompleted?: () => void;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({ onTaskCompleted }) => {
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [versions, setVersions] = useState<RoadmapVersionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [expandedWhy, setExpandedWhy] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    setLoading(true);
    try {
      const [rData, vData] = await Promise.all([
        api.getRoadmap(),
        api.getRoadmapVersions()
      ]);
      setRoadmap(rData);
      setVersions(vData);
    } catch (err) {
      console.error("Failed to load roadmap", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (task: RoadmapTaskItem) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    setUpdatingTaskId(task.id);
    try {
      await api.updateTaskStatus(task.id, newStatus);
      if (roadmap) {
        const updatedTasks = roadmap.tasks.map(t =>
          t.id === task.id ? { ...t, status: newStatus as any } : t
        );
        const completedCount = updatedTasks.filter(t => t.status === 'completed').length;
        const totalCount = updatedTasks.length;
        const pct = Math.round((completedCount / totalCount) * 100);

        const updatedPhases = roadmap.phases.map(phase => ({
          ...phase,
          tasks: phase.tasks.map(t =>
            t.id === task.id ? { ...t, status: newStatus as any } : t
          )
        }));

        setRoadmap({
          ...roadmap,
          tasks: updatedTasks,
          phases: updatedPhases,
          completed_tasks: completedCount,
          completion_percent: pct
        });
      }
      if (onTaskCompleted) onTaskCompleted();
    } catch (err: any) {
      alert(`Failed to update task: ${err.message}`);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const toggleWhy = (taskId: string) => {
    setExpandedWhy(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">No active learning roadmap found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6">
      {/* Top Banner & Version Status */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-violet-700 via-purple-700 to-violet-800 text-white shadow-xl shadow-violet-500/20 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-violet-200 uppercase tracking-wider">
                Learning Roadmap
              </span>
              <span className="text-[11px] sm:text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-white">
                Version {roadmap.version}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {roadmap.role_title} Master Path
            </h1>
            <p className="text-xs text-violet-100 mt-1 max-w-2xl leading-relaxed">
              {roadmap.change_reason || 'Synthesized by Roadmap Planner Agent based on prerequisite ordering and verified resources.'}
            </p>
          </div>

          {/* Progress summary */}
          <div className="self-start sm:self-auto sm:text-right bg-white/10 backdrop-blur-md px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-white/20">
            <span className="text-[10px] sm:text-[11px] text-violet-200 block">Overall Completion</span>
            <span className="text-xl sm:text-2xl font-mono font-extrabold text-white">
              {roadmap.completion_percent}%
            </span>
            <span className="text-[10px] text-violet-200 block">
              {roadmap.completed_tasks} of {roadmap.total_tasks} tasks done
            </span>
          </div>
        </div>

        {/* Roadmap Version History Bar */}
        {versions.length > 1 && (
          <div className="pt-3 border-t border-white/20 flex items-center gap-3 text-xs overflow-x-auto">
            <span className="text-violet-200 flex items-center gap-1 font-semibold whitespace-nowrap">
              <History className="w-3.5 h-3.5 text-white" /> Version History:
            </span>
            {versions.map((v) => (
              <span
                key={v.id}
                className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap border ${
                  v.version === roadmap.version
                    ? 'bg-white text-violet-800 font-bold border-white'
                    : 'bg-white/10 border-white/20 text-violet-100'
                }`}
                title={v.change_reason || ''}
              >
                v{v.version} {v.status === 'active' ? '(Current)' : '(Archived)'}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Phases and Tasks */}
      <div className="space-y-6">
        {roadmap.phases.map((phase, pIdx) => (
          <div key={pIdx} className="space-y-3">
            {/* Phase Header */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white font-mono text-xs font-bold shadow-sm">
                0{pIdx + 1}
              </div>
              <h2 className="text-base font-bold text-gray-900">{phase.phase_name}</h2>
              <span className="text-xs text-gray-400">({phase.tasks.length} tasks)</span>
            </div>

            {/* Task Cards in this Phase */}
            <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-violet-200 ml-3.5">
              {phase.tasks.map((task) => {
                const isCompleted = task.status === 'completed';
                const isUpdating = updatingTaskId === task.id;
                const isWhyOpen = expandedWhy[task.id] || false;

                return (
                  <div
                    key={task.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isCompleted
                        ? 'bg-gray-50/80 border-gray-200 opacity-70'
                        : task.is_remedial
                        ? 'bg-red-50/60 border-red-200 shadow-sm'
                        : 'bg-white border-violet-100 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleTaskCompletion(task)}
                        disabled={isUpdating}
                        className="mt-0.5 text-gray-400 hover:text-emerald-500 transition-colors focus:outline-none"
                        title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 hover:text-gray-500" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[11px] font-mono text-gray-500 font-semibold">
                            Week {task.week_number}
                          </span>
                          {task.skill_name && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200 font-medium">
                              {task.skill_name}
                            </span>
                          )}
                          {task.is_remedial && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Remedial Task</span>
                            </span>
                          )}
                          <span className="text-[11px] text-gray-400 flex items-center gap-1 ml-auto">
                            <Clock className="w-3 h-3" />
                            <span>{task.estimated_minutes} mins</span>
                          </span>
                        </div>

                        <h3 className={`text-sm font-bold text-gray-900 ${isCompleted ? 'line-through text-gray-400' : ''}`}>
                          {task.title}
                        </h3>

                        {task.description && (
                          <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                        )}

                        {/* Verified Learning Resource Link */}
                        {task.resource && (
                          <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-violet-50/70 border border-violet-100">
                            <div className="flex items-center gap-2.5 text-xs text-gray-700 truncate">
                              <BookOpen className="w-4 h-4 text-violet-600 flex-shrink-0" />
                              <span className="font-medium truncate">{task.resource.title}</span>
                              <span className="text-[10px] text-gray-400 hidden sm:inline">
                                ({task.resource.provider})
                              </span>
                            </div>

                            <a
                              href={task.resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-semibold transition-colors flex-shrink-0 ml-3 shadow-sm"
                            >
                              <span>Open Free Resource</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {/* 'Why this task' Accordion */}
                        {task.why_recommended && (
                          <div className="mt-2.5">
                            <button
                              onClick={() => toggleWhy(task.id)}
                              className="text-[11px] text-violet-600 hover:text-violet-800 flex items-center gap-1 font-semibold"
                            >
                              {isWhyOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                              <span>Why this task was scheduled</span>
                            </button>
                            {isWhyOpen && (
                              <p className="mt-1.5 p-2.5 rounded-lg bg-gray-50 text-[11px] text-gray-600 border border-gray-200 leading-relaxed">
                                {task.why_recommended}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Capstone Mini-Project Card */}
        {roadmap.final_mini_project && (
          <div className="p-6 rounded-2xl bg-white border-2 border-violet-300 shadow-md space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-violet-700 uppercase tracking-wider">
              <FolderGit2 className="w-4 h-4" />
              <span>Capstone Portfolio Project</span>
            </div>
            <h3 className="text-base font-bold text-gray-900">
              {roadmap.final_mini_project.title}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {roadmap.final_mini_project.description}
            </p>
            <div className="pt-2">
              <span className="text-xs font-semibold text-gray-700 block mb-1">Key Acceptance Criteria:</span>
              <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                {roadmap.final_mini_project.acceptance_criteria.map((crit, idx) => (
                  <li key={idx}>{crit}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
