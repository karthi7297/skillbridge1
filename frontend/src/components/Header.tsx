import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  BrainCircuit,
  Compass,
  LineChart,
  MapPin,
  HelpCircle,
  Bot,
  Activity,
  User
} from 'lucide-react';
import { api } from '../services/api';
import { HealthResponse } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefreshData: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onRefreshData }) => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    }
  };

  const handleLoadDemo = async () => {
    setLoadingDemo(true);
    setActionMessage(null);
    try {
      await api.loadDemo();
      setActionMessage("Loaded Demo Student (Alex Chen)!");
      onRefreshData();
      setActiveTab('dashboard');
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setLoadingDemo(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm("Reset all learner data and restore baseline seed state?")) return;
    setLoadingReset(true);
    setActionMessage(null);
    try {
      await api.resetDemo();
      setActionMessage("Demo database reset successfully!");
      onRefreshData();
      setActiveTab('dashboard');
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setLoadingReset(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'profile', label: 'Profile & Skills', icon: User },
    { id: 'careers', label: 'Career Explorer', icon: BrainCircuit },
    { id: 'gaps', label: 'Skill Gap Analysis', icon: LineChart },
    { id: 'roadmap', label: 'Learning Roadmap', icon: MapPin },
    { id: 'assessment', label: 'Assessments', icon: HelpCircle },
    { id: 'mentor', label: 'AI Mentor', icon: Bot },
    { id: 'activity', label: 'Agent Activity', icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-violet-200 shadow-sm shadow-violet-100">
      {/* Top Banner with Brand and Demo Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-700 via-violet-600 to-purple-500 p-0.5 shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-gray-900">SkillBridge<span className="text-violet-600 font-mono">.AI</span></span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-violet-100 border border-violet-300 text-violet-700">
                  Agentic
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">Adaptive Multi-Agent Learning & Career Planner</p>
            </div>
          </div>

          {/* Quick Demo Controls */}
          <div className="flex items-center gap-3">
            {actionMessage && (
              <span className="text-xs px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-lg animate-pulse hidden md:inline-block">
                {actionMessage}
              </span>
            )}

            <button
              onClick={handleLoadDemo}
              disabled={loadingDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition-colors disabled:opacity-50"
              title="Loads sample learner: Python L3, SQL L2, HTML L1 -> Full Stack Developer"
            >
              <UserCheck className={`w-3.5 h-3.5 ${loadingDemo ? 'animate-spin' : ''}`} />
              <span>{loadingDemo ? 'Loading...' : 'Load Sample Student'}</span>
            </button>

            <button
              onClick={handleResetDemo}
              disabled={loadingReset}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium border border-gray-300 transition-colors disabled:opacity-50"
              title="Reset sample data and assessments to baseline"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingReset ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Health / System Status indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600">
              <Database className="w-3.5 h-3.5 text-gray-400" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] hidden lg:inline">{health ? health.database : 'Connecting...'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-violet-100">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/30'
                    : 'text-gray-500 hover:text-violet-700 hover:bg-violet-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
