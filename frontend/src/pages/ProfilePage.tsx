import React, { useState, useEffect } from 'react';
import {
  User,
  Save,
  Plus,
  Trash2,
  Award,
  FolderGit2,
  Clock,
  Sparkles,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import { LearnerProfile, CareerRole } from '../types';

interface ProfilePageProps {
  onProfileUpdated?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onProfileUpdated }) => {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [careers, setCareers] = useState<CareerRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [name, setName] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [goalRoleId, setGoalRoleId] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(6);
  const [learningPref, setLearningPref] = useState('mixed');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profData, careerData] = await Promise.all([
        api.getProfile(),
        api.getCareers()
      ]);
      setProfile(profData);
      setCareers(careerData);
      setName(profData.name || '');
      setCurrentRole(profData.current_role || '');
      setGoalRoleId(profData.goal_role_id || '');
      setWeeklyHours(profData.weekly_hours || 6);
      setLearningPref(profData.learning_preference || 'mixed');
      setBio(profData.bio || '');
      setSkills(profData.skills || []);
      setCertifications(profData.certifications || []);
      setProjects(profData.projects || []);
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillLevelChange = (index: number, newLevel: number) => {
    const updated = [...skills];
    updated[index].level = newLevel;
    setSkills(updated);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    const exists = skills.some(s => s.skill_name.toLowerCase() === newSkillName.trim().toLowerCase());
    if (exists) { alert("Skill already present in profile list"); return; }
    setSkills([...skills, { skill_name: newSkillName.trim(), level: newSkillLevel, evidence_type: 'self-reported', evidence_notes: 'User added' }]);
    setNewSkillName('');
    setNewSkillLevel(1);
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const payload = {
        name, current_role: currentRole, goal_role_id: goalRoleId,
        weekly_hours: weeklyHours, learning_preference: learningPref, bio,
        skills: skills.map(s => ({ skill_name: s.skill_name, level: s.level, evidence_type: s.evidence_type, evidence_notes: s.evidence_notes })),
        certifications, projects
      };
      await api.updateProfile(payload);
      setSaveSuccess(true);
      if (onProfileUpdated) onProfileUpdated();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all";
  const selectClass = "w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6">
      {/* Header and Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600 shrink-0" />
            <span>Learner Profile & Competencies</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Structured and validated by the <strong>Profile Agent</strong>. Directly influences deterministic gap analysis.
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
          <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Profile updated successfully! Profile Agent generated new structured telemetry.</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Career Goal */}
        <div className="p-6 rounded-2xl bg-white border border-violet-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-violet-600" />
            <span>General Information</span>
          </h2>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Current Background / Education</label>
            <input type="text" value={currentRole} onChange={(e) => setCurrentRole(e.target.value)}
              placeholder="e.g. Computer Science Student, Self-taught" className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Target Career Role</label>
            <select value={goalRoleId} onChange={(e) => setGoalRoleId(e.target.value)} className={selectClass}>
              {careers.map((c) => (
                <option key={c.id} value={c.id}>{c.title} ({c.category})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Study Availability & Learning Style */}
        <div className="p-6 rounded-2xl bg-white border border-violet-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Study Availability & Preferences</span>
          </h2>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-700">Weekly Availability</label>
              <span className="text-xs font-mono font-bold text-violet-600">{weeklyHours} hours/week</span>
            </div>
            <input type="range" min={2} max={30} step={1} value={weeklyHours}
              onChange={(e) => setWeeklyHours(parseInt(e.target.value))}
              className="w-full cursor-pointer" />
            <p className="text-[11px] text-gray-400 mt-1">
              Roadmap duration and task allocation automatically scale to this pace.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Preferred Learning Style</label>
            <select value={learningPref} onChange={(e) => setLearningPref(e.target.value)} className={selectClass}>
              <option value="hands-on">Hands-On & Interactive (Coding Exercises)</option>
              <option value="reading">Documentation & Deep Reading</option>
              <option value="video">Video & Visual Walkthroughs</option>
              <option value="mixed">Mixed (Balanced Theory + Practice)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Learner Bio / Notes</label>
            <textarea rows={2} value={bio} onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio or career aspiration..."
              className={`${inputClass} resize-none`} />
          </div>
        </div>
      </div>

      {/* Skills & Levels Editor (0 - 5) */}
      <div className="p-6 rounded-2xl bg-white border border-violet-100 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span>Skill Competency Levels (0–5)</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Adjust your current proficiency. Level 0 = None, 3 = Intermediate, 5 = Production Mastery.
            </p>
          </div>
        </div>

        {/* Existing Skills List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {skills.map((sk, index) => (
            <div key={index} className="p-3.5 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900 truncate">{sk.skill_name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                    {sk.evidence_type || 'self-reported'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="range" min={0} max={5} value={sk.level}
                    onChange={(e) => handleSkillLevelChange(index, parseInt(e.target.value))}
                    className="w-28 cursor-pointer" />
                  <span className="text-xs font-mono font-bold text-violet-600">Lvl {sk.level}/5</span>
                </div>
              </div>

              <button onClick={() => handleRemoveSkill(index)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Remove skill">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Skill Form */}
        <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-gray-100">
          <input type="text" placeholder="Add skill (e.g. TypeScript, Docker, React)..."
            value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)}
            className={`flex-1 ${inputClass}`} />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Level:</span>
            <select value={newSkillLevel} onChange={(e) => setNewSkillLevel(parseInt(e.target.value))}
              className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-violet-400">
              {[0, 1, 2, 3, 4, 5].map((lvl) => (
                <option key={lvl} value={lvl}>Lvl {lvl}</option>
              ))}
            </select>
          </div>
          <button type="submit"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>
        </form>
      </div>

      {/* Certifications & Demonstrated Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Certifications */}
        <div className="p-6 rounded-2xl bg-white border border-violet-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-600" />
            <span>Verified Certifications</span>
          </h2>
          <div className="space-y-2">
            {certifications.length > 0 ? (
              certifications.map((c, i) => (
                <div key={i} className="p-3 rounded-xl bg-violet-50 border border-violet-100 text-xs">
                  <span className="font-semibold text-gray-900 block">{c.title}</span>
                  <span className="text-gray-500 text-[11px]">{c.issuer} • {c.issue_date}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">No certifications recorded yet.</p>
            )}
          </div>
        </div>

        {/* Demonstrated Projects */}
        <div className="p-6 rounded-2xl bg-white border border-violet-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-emerald-600" />
            <span>Demonstrated Projects</span>
          </h2>
          <div className="space-y-2">
            {projects.length > 0 ? (
              projects.map((p, i) => (
                <div key={i} className="p-3 rounded-xl bg-violet-50 border border-violet-100 text-xs">
                  <span className="font-semibold text-gray-900 block">{p.title}</span>
                  <p className="text-gray-500 text-[11px] mt-0.5">{p.description}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">No projects added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
