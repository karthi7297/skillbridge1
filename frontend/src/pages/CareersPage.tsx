import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Award,
  TrendingUp,
  Layers,
  Plus,
  X,
  Trash2,
  Zap,
  Sliders,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { CareerMatchItem, ChangeGoalResponse } from '../types';

interface CareersPageProps {
  onCareerChanged: () => void;
  onNavigateToRoadmap: () => void;
}

interface NewSkillRow {
  skill_name: string;
  required_level: number;
}

export const CareersPage: React.FC<CareersPageProps> = ({ onCareerChanged, onNavigateToRoadmap }) => {
  const [matches, setMatches] = useState<CareerMatchItem[]>([]);
  const [currentTargetId, setCurrentTargetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [switchingRoleId, setSwitchingRoleId] = useState<string | null>(null);
  const [changeResult, setChangeResult] = useState<ChangeGoalResponse | null>(null);

  // Create Career Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('AI & Machine Learning');
  const [newDescription, setNewDescription] = useState('');
  const [newSkills, setNewSkills] = useState<NewSkillRow[]>([
    { skill_name: 'Python', required_level: 4 },
    { skill_name: 'Prompt Engineering', required_level: 4 },
    { skill_name: 'LangChain & Agentic Frameworks', required_level: 3 }
  ]);
  const [creatingCareer, setCreatingCareer] = useState(false);
  const [createSuccessMsg, setCreateSuccessMsg] = useState<string | null>(null);
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);

  useEffect(() => {
    loadCareers();
  }, []);

  const loadCareers = async () => {
    setLoading(true);
    try {
      const data = await api.matchCareers();
      setMatches(data.matches || []);
      setCurrentTargetId(data.current_target_id || null);
    } catch (err) {
      console.error("Failed to load career matches", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCareer = async (roleId: string, roleTitle: string) => {
    if (roleId === currentTargetId) return;
    const confirmMsg = `Switch your target goal to '${roleTitle}'?\n\nSkillBridge AI will preserve your transferable skills (Python, SQL) and adaptively generate a new versioned roadmap.`;
    if (!window.confirm(confirmMsg)) return;
    setSwitchingRoleId(roleId);
    setChangeResult(null);
    try {
      const result = await api.changeGoal(roleId, `Switching career focus to ${roleTitle}`);
      setChangeResult(result);
      setCurrentTargetId(roleId);
      onCareerChanged();
    } catch (err: any) {
      alert(`Failed to switch goal: ${err.message}`);
    } finally {
      setSwitchingRoleId(null);
    }
  };

  // Preset handlers for quick 1-click creation
  const handleApplyPreset = (presetType: string) => {
    if (presetType === 'ai_prompt') {
      setNewTitle('AI Prompt Engineer');
      setNewCategory('AI & Machine Learning');
      setNewDescription('Design, optimize, and chain production prompt systems and multi-agent workflows.');
      setNewSkills([
        { skill_name: 'Python', required_level: 4 },
        { skill_name: 'Prompt Engineering', required_level: 4 },
        { skill_name: 'LangChain & Agentic Frameworks', required_level: 3 },
        { skill_name: 'Vector DBs & Embeddings', required_level: 3 }
      ]);
    } else if (presetType === 'devops') {
      setNewTitle('Cloud & DevOps Engineer');
      setNewCategory('Cloud & Infrastructure');
      setNewDescription('Build automated CI/CD pipelines, container orchestration, and cloud infrastructure.');
      setNewSkills([
        { skill_name: 'Docker & Containers', required_level: 4 },
        { skill_name: 'Kubernetes Orchestration', required_level: 3 },
        { skill_name: 'Linux & Shell Scripting', required_level: 4 },
        { skill_name: 'CI/CD Pipelines', required_level: 3 }
      ]);
    } else if (presetType === 'flutter') {
      setNewTitle('Flutter Mobile Developer');
      setNewCategory('Mobile Engineering');
      setNewDescription('Engineer cross-platform iOS and Android apps with reactive state management.');
      setNewSkills([
        { skill_name: 'Dart Programming', required_level: 4 },
        { skill_name: 'Flutter Framework', required_level: 4 },
        { skill_name: 'REST APIs & State Management', required_level: 3 },
        { skill_name: 'Mobile UI/UX Design', required_level: 2 }
      ]);
    } else if (presetType === 'security') {
      setNewTitle('Cybersecurity Analyst');
      setNewCategory('Security & Compliance');
      setNewDescription('Audit system defenses, inspect vulnerability vectors, and implement defensive architecture.');
      setNewSkills([
        { skill_name: 'Network Security', required_level: 4 },
        { skill_name: 'Python Security Automation', required_level: 3 },
        { skill_name: 'Threat Modeling & SIEM', required_level: 3 },
        { skill_name: 'Ethical Hacking & Penetration Testing', required_level: 3 }
      ]);
    }
  };

  const handleAddSkillRow = () => {
    setNewSkills(prev => [...prev, { skill_name: '', required_level: 3 }]);
  };

  const handleRemoveSkillRow = (index: number) => {
    setNewSkills(prev => prev.filter((_, i) => i !== index));
  };

  const handleSkillChange = (index: number, field: 'skill_name' | 'required_level', value: any) => {
    setNewSkills(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleCreateCareer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert("Please enter a Career Track Title.");
      return;
    }
    const validSkills = newSkills.filter(s => s.skill_name.trim().length > 0);
    if (validSkills.length === 0) {
      alert("Please add at least one required skill for this career track.");
      return;
    }

    setCreatingCareer(true);
    try {
      const created = await api.createCareer({
        title: newTitle.trim(),
        category: newCategory.trim(),
        description: newDescription.trim() || undefined,
        required_skills: validSkills.map(s => ({
          skill_name: s.skill_name.trim(),
          required_level: s.required_level,
          importance_weight: 1.0,
          is_core: true
        }))
      });

      setNewlyCreatedId(created.id);
      setCreateSuccessMsg(`Created '${created.title}'! Match percentages calculated.`);
      setIsModalOpen(false);
      // Reload career matches immediately
      await loadCareers();
      setTimeout(() => setCreateSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(`Creation failed: ${err.message}`);
    } finally {
      setCreatingCareer(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600 shrink-0" />
            <span>Career Explorer & Matching Engine</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time readiness percentages calculated across industry tracks and your custom created pathways.
          </p>
        </div>

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3 w-full md:w-auto">
          {/* Refresh Matches Button */}
          <button
            onClick={loadCareers}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          {/* + Create New Career Track Button */}
          <button
            onClick={() => {
              handleApplyPreset('ai_prompt');
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-violet-500/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Career Track</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {createSuccessMsg && (
        <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 text-violet-900 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-violet-600" />
            <span>{createSuccessMsg}</span>
          </div>
          <button
            onClick={() => setCreateSuccessMsg(null)}
            className="text-violet-500 hover:text-violet-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Goal Switch Outcome Alert (Trigger A in Hackathon Spec) */}
      {changeResult && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-800 text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Career Goal Successfully Changed: {changeResult.old_role_title} → {changeResult.new_role_title}!</span>
          </div>

          <p className="text-xs text-slate-700">{changeResult.explanation}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
            <div>
              <span className="text-slate-500">Transferable skills preserved: </span>
              <strong className="text-emerald-700">{changeResult.transferable_skills.join(', ') || 'None'}</strong>
            </div>

            <div>
              <span className="text-slate-500">New Roadmap Version: </span>
              <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 font-mono font-bold border border-violet-200">
                v{changeResult.new_roadmap_version}
              </span>
            </div>

            <button
              onClick={onNavigateToRoadmap}
              className="ml-auto px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>View New Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Career Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {matches.map((role) => {
          const isTarget = role.role_id === currentTargetId;
          const isSwitching = switchingRoleId === role.role_id;
          const isNewlyCreated = role.role_id === newlyCreatedId;

          return (
            <div
              key={role.role_id}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${
                isTarget
                  ? 'bg-gradient-to-b from-violet-50/70 to-white border-violet-500 shadow-violet-500/10'
                  : isNewlyCreated
                  ? 'bg-purple-50/40 border-purple-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {role.category}
                  </span>
                  {isTarget && (
                    <span className="text-[10px] font-bold text-violet-700 bg-violet-100 border border-violet-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      <span>Current Goal</span>
                    </span>
                  )}
                  {isNewlyCreated && !isTarget && (
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full">
                      Custom Track
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mb-1.5 leading-snug">{role.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{role.description}</p>

                {/* Readiness Progress Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Estimated Readiness</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{role.readiness_percent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        role.readiness_percent >= 50
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : role.readiness_percent >= 25
                          ? 'bg-gradient-to-r from-violet-500 to-purple-600'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, role.readiness_percent))}%` }}
                    />
                  </div>
                </div>

                {/* Strengths & Gaps preview */}
                <div className="space-y-2 mb-4 text-[11px]">
                  {role.strengths.length > 0 && (
                    <div>
                      <span className="text-slate-400 block mb-1">Strengths:</span>
                      <div className="flex flex-wrap gap-1">
                        {role.strengths.slice(0, 2).map((s, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {role.priority_gaps.length > 0 && (
                    <div>
                      <span className="text-slate-400 block mb-1">Key Gaps:</span>
                      <div className="flex flex-wrap gap-1">
                        {role.priority_gaps.slice(0, 2).map((g, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100">
                {isTarget ? (
                  <button
                    disabled
                    className="w-full py-2 rounded-xl bg-violet-100 border border-violet-200 text-violet-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-default"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
                    <span>Active Target Career</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectCareer(role.role_id, role.title)}
                    disabled={isSwitching}
                    className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <span>{isSwitching ? 'Switching Goal...' : 'Select as Goal'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE NEW CAREER TRACK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 shrink-0">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">Create Custom Career Track</h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 truncate">Define a new pathway and required skill matrix</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleCreateCareer} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
              {/* Quick Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Quick Presets (1-Click Fill)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('ai_prompt')}
                    className="p-2 rounded-xl text-xs font-semibold border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors text-left truncate"
                  >
                    🤖 AI Prompt Eng
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('devops')}
                    className="p-2 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors text-left truncate"
                  >
                    ☁️ Cloud & DevOps
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('flutter')}
                    className="p-2 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors text-left truncate"
                  >
                    📱 Flutter Mobile
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('security')}
                    className="p-2 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors text-left truncate"
                  >
                    🛡️ Cybersecurity
                  </button>
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Career Role Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Prompt Engineer, DevOps..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-violet-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Domain / Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-violet-500 shadow-xs bg-white"
                  >
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                    <option value="Data Engineering">Data Engineering</option>
                    <option value="Mobile Engineering">Mobile Engineering</option>
                    <option value="Security & Compliance">Security & Compliance</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Role Description & Scope
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of what this role builds and achieves..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-violet-500 shadow-xs resize-none"
                />
              </div>

              {/* Required Skills Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block">
                      Required Skills Matrix
                    </label>
                    <span className="text-[11px] text-slate-400 hidden xs:inline">
                      Used by Skill Analyst to calculate deterministic readiness.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSkillRow}
                    className="px-2.5 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold border border-violet-200 flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Skill</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {newSkills.map((row, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          placeholder="Skill name (e.g. Python, Docker, React)..."
                          value={row.skill_name}
                          onChange={(e) => handleSkillChange(idx, 'skill_name', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-violet-500"
                        />
                      </div>

                      <div className="flex items-center justify-between sm:justify-start gap-2">
                        <span className="text-xs text-slate-500 shrink-0">Required:</span>
                        <select
                          value={row.required_level}
                          onChange={(e) => handleSkillChange(idx, 'required_level', parseInt(e.target.value))}
                          className="flex-1 sm:flex-initial px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-violet-700 bg-white"
                        >
                          <option value={1}>Lvl 1 (Beginner)</option>
                          <option value={2}>Lvl 2 (Elementary)</option>
                          <option value={3}>Lvl 3 (Intermediate)</option>
                          <option value={4}>Lvl 4 (Advanced)</option>
                          <option value={5}>Lvl 5 (Mastery)</option>
                        </select>

                        {newSkills.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSkillRow(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                            title="Remove skill"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCareer}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-violet-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {creatingCareer ? (
                    <span>Registering Track...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Create Career Track</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
