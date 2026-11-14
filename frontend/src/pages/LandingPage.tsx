import React from 'react';
import {
  Sparkles,
  ArrowRight,
  UserCheck,
  BrainCircuit,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Target,
  RefreshCw,
  BookOpen
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLoadDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLoadDemo }) => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4 pt-6 pb-8">
        {/* Purple gradient blob background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-gradient-to-br from-violet-200/60 via-purple-100/40 to-transparent blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 border border-violet-300 text-violet-700 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PromptWars Hackathon Edition — Agentic Adaptive Learning</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
          From <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500">Current Skills</span> to Your Dream Career.
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          SkillBridge AI uses a collaborative team of five specialized AI agents to analyze your real profile, compute deterministic skill gaps, construct a phased roadmap with verified free resources, and continuously adapt as you learn or change career goals.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onLoadDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 transition-all hover:scale-105"
          >
            <UserCheck className="w-4 h-4" />
            <span>Load Demo Student (Alex Chen)</span>
          </button>

          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-sm transition-all shadow-sm"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Minute Winning Demo Callout */}
        <div className="mt-12 p-4 rounded-xl bg-amber-50 border border-amber-200 text-left max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4" />
            <span>Official Judge Demo Scenario</span>
          </div>
          <p className="text-xs text-gray-600 leading-normal">
            "I tell SkillBridge AI that I know Python (Lvl 3), SQL (Lvl 2), and basic HTML (Lvl 1) and want to become a Full Stack Developer. Specialized agents analyze gaps (JavaScript, React), build a roadmap, and adapt when I take a quiz or switch my goal to Data Engineer!"
          </p>
        </div>
      </section>

      {/* 5 Specialized Agents Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Multi-Agent Architecture</h2>
          <p className="text-sm text-gray-500">
            Five specialized agents governed by an application-level AgentRouter, communicating through structured typed contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              name: 'Profile Agent',
              role: 'Structures Profile & Skills',
              color: 'border-blue-200 bg-blue-50',
              badge: 'bg-blue-100 text-blue-700',
              icon: '🧑‍💼',
              desc: 'Extracts skills, levels (0-5), certifications, and projects into typed verified learner state.'
            },
            {
              name: 'Skill Analyst',
              role: 'Deterministic Gap Engine',
              color: 'border-violet-200 bg-violet-50',
              badge: 'bg-violet-100 text-violet-700',
              icon: '📊',
              desc: 'Compares current profile against 8 curated role matrices; calculates exact mathematical readiness.'
            },
            {
              name: 'Roadmap Planner',
              role: 'Dependency & Sequence',
              color: 'border-emerald-200 bg-emerald-50',
              badge: 'bg-emerald-100 text-emerald-700',
              icon: '🗺️',
              desc: 'Schedules prerequisites (JS before React), links verified free resources, and manages version history.'
            },
            {
              name: 'Progress Evaluator',
              role: 'Adaptive Assessment',
              color: 'border-amber-200 bg-amber-50',
              badge: 'bg-amber-100 text-amber-700',
              icon: '📝',
              desc: 'Serves multi-tier quizzes, grades answers, updates mastery, and triggers remediation if score < 60%.'
            },
            {
              name: 'Mentor Agent',
              role: 'Contextual Academic Coach',
              color: 'border-cyan-200 bg-cyan-50',
              badge: 'bg-cyan-100 text-cyan-700',
              icon: '🤖',
              desc: 'Answers questions grounded in your live roadmap, recent quiz attempts, and collaborative agent logs.'
            }
          ].map((agent, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl border-2 ${agent.color} flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${agent.badge}`}>Agent 0{i+1}</span>
                  <span className="text-xl">{agent.icon}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-0.5">{agent.name}</h3>
                <p className="text-xs font-medium text-gray-500 mb-3">{agent.role}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{agent.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-violet-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-600 mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Deterministic & Explainable</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              No hallucinated percentages. Readiness scores are calculated mathematically using weighted role-skill matrices: <code className="text-violet-700 bg-violet-50 px-1 py-0.5 rounded">Σ(w_i * coverage_i) / Σ(w_i)</code>.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-violet-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">100% Verified Free Catalog</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Never invent broken links. Every recommended course, tutorial, and exercise comes from our verified seed library from MDN, freeCodeCamp, Kaggle, and official documentation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-violet-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Two Adaptive Triggers</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              1. <strong>Poor Quiz (&lt;60%):</strong> Evaluator triggers remediation, inserts extra practice, delays dependent topics.
              <br />
              2. <strong>Goal Switch:</strong> Switch to Data Engineer; Python/SQL are preserved while new milestones are generated.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
