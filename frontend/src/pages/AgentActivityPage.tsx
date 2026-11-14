import React, { useState, useEffect } from 'react';
import {
  Activity,
  RefreshCw,
  Filter,
  User,
  LineChart,
  MapPin,
  HelpCircle,
  Bot,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { AgentLogItem } from '../types';

export const AgentActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<AgentLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentFilter, setAgentFilter] = useState('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAgentLogs(50);
      setLogs(data);
    } catch (err) {
      console.error("Failed to load agent logs", err);
    } finally {
      setLoading(false);
    }
  };

  const agentBadges: Record<string, { color: string; icon: any }> = {
    'Profile Agent': {
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: User
    },
    'Skill Analyst': {
      color: 'bg-violet-100 text-violet-700 border-violet-200',
      icon: LineChart
    },
    'Roadmap Planner': {
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      icon: MapPin
    },
    'Progress Evaluator': {
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: HelpCircle
    },
    'Mentor Agent': {
      color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      icon: Bot
    }
  };

  const filteredLogs = logs.filter(l => {
    if (agentFilter === 'all') return true;
    return l.agent_name.toLowerCase().includes(agentFilter.toLowerCase());
  });

  return (
    <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6">
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600 shrink-0" />
            <span>Agent Activity Telemetry Feed</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real multi-agent execution events emitted across onboarding, gap analysis, roadmap planning, and assessments.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-violet-400 font-semibold shadow-xs"
          >
            <option value="all">All Agents</option>
            <option value="Profile">Profile Agent</option>
            <option value="Skill Analyst">Skill Analyst</option>
            <option value="Roadmap Planner">Roadmap Planner</option>
            <option value="Progress Evaluator">Progress Evaluator</option>
            <option value="Mentor">Mentor Agent</option>
          </select>

          <button
            onClick={loadLogs}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-xs disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Log Feed */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const badge = agentBadges[log.agent_name] || {
              color: 'bg-violet-100 text-violet-700 border-violet-200',
              icon: Sparkles
            };
            const Icon = badge.icon;

            return (
              <div
                key={log.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-violet-100 shadow-sm flex items-start gap-4 hover:border-violet-300 hover:shadow-md transition-all"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border flex-shrink-0 ${badge.color}`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">{log.agent_name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                        {log.event_type}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-gray-400">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">{log.message}</p>

                  {/* Metadata preview if any */}
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-2.5 p-2 rounded-lg bg-gray-50 font-mono text-[10px] text-gray-500 border border-gray-200 overflow-x-auto">
                      <span className="text-gray-400">telemetry: </span>
                      {JSON.stringify(log.metadata)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">No agent activity logged for the selected filter.</p>
        </div>
      )}
    </div>
  );
};
