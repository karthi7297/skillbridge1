import React, { useState } from 'react';
import {
  Compass,
  BrainCircuit,
  MapPin,
  HelpCircle,
  Bot,
  Menu,
  Activity,
  User
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { GuidedTourTooltip } from './components/GuidedTourTooltip';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { CareersPage } from './pages/CareersPage';
import { SkillGapPage } from './pages/SkillGapPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { MentorPage } from './pages/MentorPage';
import { AgentActivityPage } from './pages/AgentActivityPage';
import { SigninPage } from './pages/SigninPage';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleRefreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Quick 1-tap mobile bottom bar tabs
  const mobileBottomTabs = [
    { id: 'dashboard', label: 'Home', icon: Compass },
    { id: 'careers', label: 'Careers', icon: BrainCircuit },
    { id: 'roadmap', label: 'Roadmap', icon: MapPin },
    { id: 'assessment', label: 'Quiz', icon: HelpCircle },
    { id: 'mentor', label: 'Mentor', icon: Bot },
  ];

  // If viewing the public landing page
  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-violet-600 selection:text-white">
        <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-600 text-white font-black flex items-center justify-center text-base shadow-md shadow-violet-500/25">
              S
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">SkillBridge<span className="text-violet-600">.AI</span></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/25"
            >
              Open SaaS Dashboard
            </button>
          </div>
        </header>

        <main className="flex-1">
          <LandingPage
            onGetStarted={() => setActiveTab('dashboard')}
            onLoadDemo={() => {
              handleRefreshData();
              setActiveTab('dashboard');
            }}
          />
        </main>
      </div>
    );
  }

  // Full-Stack Professional SaaS Dashboard Layout
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] text-slate-900 selection:bg-violet-600 selection:text-white">
      {/* Vertical Sidebar Navigation (Slide-over drawer on mobile, static on desktop) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefreshData={handleRefreshData}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar with Breadcrumb, Search, Quick Actions & Mobile Hamburger */}
        <TopNavbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onRefreshData={handleRefreshData}
          onOpenGuide={() => setShowGuide(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        />

        {/* Scrollable Work Area with bottom padding on mobile for bottom bar */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 pb-20 lg:pb-6" key={refreshKey}>
          {activeTab === 'signin' && (
            <SigninPage onSigninSuccess={() => {
              handleRefreshData();
              setActiveTab('dashboard');
            }} />
          )}

          {activeTab === 'dashboard' && (
            <DashboardPage onNavigate={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'profile' && (
            <ProfilePage onProfileUpdated={handleRefreshData} />
          )}

          {activeTab === 'careers' && (
            <CareersPage
              onCareerChanged={handleRefreshData}
              onNavigateToRoadmap={() => setActiveTab('roadmap')}
            />
          )}

          {activeTab === 'gaps' && (
            <SkillGapPage />
          )}

          {activeTab === 'roadmap' && (
            <RoadmapPage onTaskCompleted={handleRefreshData} />
          )}

          {activeTab === 'assessment' && (
            <AssessmentPage
              onAssessmentCompleted={handleRefreshData}
              onNavigateToRoadmap={() => setActiveTab('roadmap')}
            />
          )}

          {activeTab === 'mentor' && (
            <MentorPage onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'activity' && (
            <AgentActivityPage />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar (Visible on mobile/tablet screens < 1024px) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-30 px-2 py-1 shadow-lg flex items-center justify-around">
          {mobileBottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-violet-600 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-violet-100/80 text-violet-700' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] mt-0.5 leading-tight">{tab.label}</span>
              </button>
            );
          })}

          {/* More / Menu Button to open drawer */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-500 hover:text-slate-800 transition-all"
            aria-label="Open Full Menu"
          >
            <div className="p-1 rounded-lg">
              <Menu className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-0.5 leading-tight">More</span>
          </button>
        </nav>
      </div>

      {/* Floating Interactive Guide Overlay */}
      {showGuide && (
        <GuidedTourTooltip
          onNavigateTab={(tab) => {
            setActiveTab(tab);
          }}
          onClose={() => setShowGuide(false)}
        />
      )}
    </div>
  );
}

export default App;
