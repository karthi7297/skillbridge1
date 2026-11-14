import React, { useState, useEffect } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import {
  LineChart,
  Target,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Award,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { SkillGapAnalysis, SkillGapItem } from '../types';

export const SkillGapPage: React.FC = () => {
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'major' | 'partial' | 'strength'>('all');

  useEffect(() => {
    loadGaps();
  }, []);

  const loadGaps = async () => {
    setLoading(true);
    try {
      const data = await api.analyzeSkillGaps();
      setAnalysis(data);
    } catch (err) {
      console.error("Failed to load skill gaps", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">No skill gap data available.</p>
      </div>
    );
  }

  const radarData = analysis.all_gaps.map((item) => ({
    skill: item.skill_name.length > 14 ? item.skill_name.slice(0, 12) + '...' : item.skill_name,
    fullName: item.skill_name,
    Current: item.current_level,
    Required: item.required_level,
    fullMark: 5,
  }));

  const filteredGaps = analysis.all_gaps.filter((g) => {
    if (filter === 'major') return g.status === 'major_gap';
    if (filter === 'partial') return g.status === 'partial_gap';
    if (filter === 'strength') return g.status === 'strength';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Title & Readiness Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <LineChart className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600 shrink-0" />
            <span>Skill Gap & Readiness Analysis</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic gap engine powered by the <strong>Skill Analyst Agent</strong> for <em>{analysis.role_title}</em>.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-purple-700 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-md shadow-violet-500/30 self-start sm:self-auto">
          <Target className="w-5 h-5 text-white shrink-0" />
          <div>
            <span className="text-[10px] text-violet-200 uppercase font-semibold block leading-tight">Target Readiness</span>
            <span className="text-base sm:text-lg font-mono font-extrabold text-white">{analysis.readiness_percent}%</span>
          </div>
        </div>
      </div>

      {/* Top Grid: Radar Chart + Formula Explanation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Radar Chart Visual */}
        <div className="lg:col-span-7 p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                Competency Radar
              </h2>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-cyan-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Current
                </span>
                <span className="flex items-center gap-1.5 text-violet-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-500" /> Required
                </span>
              </div>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mb-3">
              Polygon comparison across required competencies (scale 0 to 5).
            </p>

            <div className="h-60 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#e9d5ff" />
                  <PolarAngleAxis dataKey="skill" stroke="#9ca3af" tick={{ fill: '#374151', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#d1d5db" tick={{ fill: '#6b7280', fontSize: 9 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e9d5ff', borderRadius: '0.75rem', fontSize: '12px' }}
                    itemStyle={{ color: '#1f2937' }}
                  />
                  <Radar name="Current Level" dataKey="Current" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.35} />
                  <Radar name="Required Level" dataKey="Required" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 text-center">
            <span className="text-[11px] text-gray-400">
              Generated dynamically from real learner profile & role-skill matrix
            </span>
          </div>
        </div>

        {/* Explainability & Mathematical Formula Card */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-violet-100 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">
              <Info className="w-4 h-4" />
              <span>Mathematical Explainability</span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">How Readiness is Calculated</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              SkillBridge AI avoids generative estimation. The Skill Analyst calculates exact coverage per skill weighted by industry criticality:
            </p>

            <div className="p-3.5 rounded-xl bg-violet-50 border border-violet-200 font-mono text-[11px] text-violet-700 space-y-1.5 mb-4">
              <div>gap(s) = max(0, required - current)</div>
              <div>coverage(s) = min(current / required, 1.0)</div>
              <div className="text-violet-900 font-bold">readiness = 100 * Σ(w_i * coverage_i) / Σ(w_i)</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Strengths (gap = 0):
                </span>
                <span className="font-mono font-bold">{analysis.strengths.length} skills</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Partial Gaps (gap = 1):
                </span>
                <span className="font-mono font-bold">{analysis.partial_gaps.length} skills</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 text-red-700 border border-red-200">
                <span className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Major Gaps (gap ≥ 2):
                </span>
                <span className="font-mono font-bold">{analysis.major_gaps.length} skills</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 text-center">
            * Estimated readiness indicates curriculum progress, not a guaranteed employment offer.
          </p>
        </div>
      </div>

      {/* Skill Gaps Breakdown & Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-gray-900">Competency Gaps Breakdown</h2>
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: `All (${analysis.all_gaps.length})` },
              { id: 'major', label: `Major Gaps (${analysis.major_gaps.length})` },
              { id: 'partial', label: `Partial Gaps (${analysis.partial_gaps.length})` },
              { id: 'strength', label: `Strengths (${analysis.strengths.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === tab.id
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-white text-gray-500 hover:text-violet-700 border border-gray-200 hover:border-violet-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gap Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGaps.map((item, idx) => {
            const isStrength = item.status === 'strength';
            const isPartial = item.status === 'partial_gap';

            return (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">{item.skill_name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isStrength
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                      : isPartial
                      ? 'bg-amber-100 text-amber-700 border-amber-300'
                      : 'bg-red-100 text-red-700 border-red-300'
                  }`}>
                    {isStrength ? 'Strength' : isPartial ? 'Partial Gap' : 'Major Gap'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-gray-600 bg-violet-50 p-2.5 rounded-xl border border-violet-100">
                  <span>Current: <strong className="text-cyan-600">Lvl {item.current_level}</strong></span>
                  <span>Required: <strong className="text-violet-600">Lvl {item.required_level}</strong></span>
                  <span>Gap: <strong className={item.gap > 0 ? 'text-amber-600' : 'text-emerald-600'}>-{item.gap}</strong></span>
                </div>

                <div className="text-xs space-y-1.5">
                  <p className="text-gray-500 leading-normal">
                    <strong className="text-gray-700">Why it matters: </strong>
                    {item.why_it_matters}
                  </p>
                  <p className="text-gray-500 leading-normal">
                    <strong className="text-gray-700">Action: </strong>
                    {item.recommended_action}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
