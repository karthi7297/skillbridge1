import React, { useState, useEffect } from 'react';
import {
  Compass,
  User,
  BrainCircuit,
  LineChart,
  MapPin,
  HelpCircle,
  Bot,
  Activity,
  Sparkles,
  Zap,
  Cpu,
  ChevronRight,
  Database,
  UserCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { HealthResponse } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefreshData: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onRefreshData,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [activeModel, setActiveModel] = useState<string>('openrouter/free');

  useEffect(() => {
    checkHealth();
    loadModel();
  }, []);

  const checkHealth = async () => {
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    }
  };

  const loadModel = async () => {
    try {
      const data = await api.getModels();
      setActiveModel(data.active_model);
    } catch {
      // ignore
    }
  };

  const navGroups = [
    {
      group: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Compass, badge: null },
        { id: 'profile', label: 'Profile & Skills', icon: User, badge: null },
      ]
    },
    {
      group: 'Career Intelligence',
      items: [
        { id: 'careers', label: 'Career Explorer', icon: BrainCircuit, badge: '8 Roles' },
        { id: 'gaps', label: 'Skill Gap Radar', icon: LineChart, badge: null },
        { id: 'roadmap', label: 'Learning Roadmap', icon: MapPin, badge: 'v2' },
      ]
    },
    {
      group: 'Multi-Agent Suite',
      items: [
        { id: 'assessment', label: 'Assessments', icon: HelpCircle, badge: 'Quiz' },
        { id: 'mentor', label: 'AI Mentor', icon: Bot, badge: 'Live' },
        { id: 'activity', label: 'Agent Activity', icon: Activity, badge: null },
      ]
    }
  ];

  const handleItemClick = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 select-none transition-transform duration-300 ease-in-out h-full shadow-2xl lg:shadow-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand Logo */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div
            onClick={() => handleItemClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-violet-500/30 group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">SkillBridge</span>
                <span className="text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-1.5 py-0.2 rounded-md font-mono">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-none mt-1">Multi-Agent Platform</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.group}
              </span>
              <div className="mt-1.5 space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/25 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-violet-600'
                        }`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white font-medium'
                            : 'bg-violet-50 text-violet-700 border border-violet-200'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick CTA Card in Sidebar */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-violet-900 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-violet-600" />
                <span>Target Role</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">Active</span>
            </div>
            <p className="text-xs font-bold text-slate-800">Full Stack Developer</p>
            <button
              onClick={() => handleItemClick('careers')}
              className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 shadow-sm"
            >
              <span>Switch Career Track</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Footer Info */}
        <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
          {/* Active OpenRouter Model Pill */}
          <div className="px-3 py-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 truncate">
              <Cpu className="w-3.5 h-3.5 text-violet-600 shrink-0" />
              <span className="text-slate-600 truncate font-medium" title={activeModel}>
                {activeModel.replace(':free', '').replace('openrouter/', '').split('/')[1] || 'Free AI Model'}
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="AI Engine Online" />
          </div>

          {/* User Card */}
          <div
            onClick={() => handleItemClick('profile')}
            className="p-2 rounded-xl flex items-center justify-between hover:bg-white transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                AC
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block leading-tight">Alex Chen</span>
                <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">alex@skillbridge.ai</span>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Connected" />
          </div>
        </div>
      </aside>
    </>
  );
};

