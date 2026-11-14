import React, { useState } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  UserCheck,
  Bell,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  Database,
  ExternalLink,
  Menu
} from 'lucide-react';
import { api } from '../services/api';

interface TopNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefreshData: () => void;
  onOpenGuide?: () => void;
  onToggleMobileMenu?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  setActiveTab,
  onRefreshData,
  onOpenGuide,
  onToggleMobileMenu
}) => {
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Learner Overview & Priority Milestones' },
    profile: { title: 'Profile & Skills', subtitle: 'Verified Competencies (0–5) & Background' },
    careers: { title: 'Career Explorer', subtitle: 'Target Roles & Mathematical Readiness' },
    gaps: { title: 'Skill Gap Radar', subtitle: 'Deterministic Gap Matrix & Competency Polygon' },
    roadmap: { title: 'Learning Roadmap', subtitle: 'Phased Prerequisite Order & Verified Free Resources' },
    assessment: { title: 'Skill Assessments', subtitle: 'Adaptive Evaluator Quizzes & Remediation Engine' },
    mentor: { title: 'AI Academic Mentor', subtitle: 'Contextual Multi-Agent Coaching & Guidance' },
    activity: { title: 'Agent Activity', subtitle: 'Real-time Inter-Agent Communication Telemetry' },
    signin: { title: 'Learner Switcher', subtitle: 'Select or Load Learner Profile' },
    landing: { title: 'Welcome', subtitle: 'SkillBridge AI Platform' }
  };

  const currentMeta = tabTitles[activeTab] || { title: 'SkillBridge AI', subtitle: 'Multi-Agent Adaptive Learning' };

  const handleLoadDemo = async () => {
    setLoadingDemo(true);
    setActionMessage(null);
    try {
      await api.loadDemo();
      setActionMessage("Loaded Demo Student!");
      onRefreshData();
      setActiveTab('dashboard');
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setLoadingDemo(false);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm("Reset all learner data and restore baseline seed state?")) return;
    setLoadingReset(true);
    try {
      await api.resetDemo();
      setActionMessage("Demo database reset!");
      onRefreshData();
      setActiveTab('dashboard');
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setLoadingReset(false);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-slate-200/90 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
        )}

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight truncate">
            {currentMeta.title}
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5 hidden md:block truncate">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="hidden lg:flex items-center relative w-64 xl:w-72">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search skills, topics, tasks..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:bg-white transition-all shadow-xs"
        />
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {actionMessage && (
          <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold animate-pulse hidden md:inline-block">
            {actionMessage}
          </span>
        )}

        {/* Primary Purple Action Button */}
        <button
          onClick={() => setActiveTab('assessment')}
          className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-[11px] sm:text-xs font-bold shadow-md shadow-violet-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Quiz</span>
          <span className="hidden sm:inline">Assessment</span>
        </button>

        {/* Load Demo Student */}
        <button
          onClick={handleLoadDemo}
          disabled={loadingDemo}
          className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
          title="Load Alex Chen demo state"
        >
          <UserCheck className={`w-3.5 h-3.5 text-violet-600 ${loadingDemo ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">Sample Student</span>
        </button>

        {/* Reset State */}
        <button
          onClick={handleResetDemo}
          disabled={loadingReset}
          className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
          title="Reset database to baseline seed"
        >
          <RefreshCw className={`w-4 h-4 ${loadingReset ? 'animate-spin' : ''}`} />
        </button>

        {/* Tour Guide Button */}
        {onOpenGuide && (
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 text-xs font-bold border border-violet-200 transition-colors"
            title="Open Interactive Demo Guide"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span className="hidden xl:inline">Guide Tour</span>
          </button>
        )}

        {/* Profile Avatar */}
        <div
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-2 pl-1 cursor-pointer group"
          title="View Profile"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-violet-200 shadow-xs">
            AC
          </div>
          <span className="text-xs font-bold text-slate-700 group-hover:text-violet-700 hidden xl:inline">
            Alex Chen
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
        </div>
      </div>
    </header>
  );
};

