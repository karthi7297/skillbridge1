import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface GuidedTourTooltipProps {
  onNavigateTab: (tab: string) => void;
  onClose: () => void;
}

export const GuidedTourTooltip: React.FC<GuidedTourTooltipProps> = ({
  onNavigateTab,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Interactive Judge Demo Guide",
      message: "Ready to test multi-agent adaptation? Follow this 4-step walkthrough inspired by the official hackathon scenario.",
      cta: "Explore Dashboard",
      tab: "dashboard"
    },
    {
      title: "1. Deterministic Gap Engine",
      message: "Click 'Skill Gap Radar' to view exact mathematical readiness calculated from 8 industry role matrices without generative hallucination.",
      cta: "Open Skill Gaps",
      tab: "gaps"
    },
    {
      title: "2. Trigger Adaptive Remediation",
      message: "In 'Skill Assessments', click 'Simulate Poor Score (<60%)'. Watch Evaluator trigger Roadmap Planner to insert remedial practice!",
      cta: "Try Assessment",
      tab: "assessment"
    },
    {
      title: "3. Goal Switch Preservation",
      message: "In 'Career Explorer', switch to 'Data Engineer'. Python and SQL transferable strengths are preserved while a new v2 roadmap is generated.",
      cta: "Career Explorer",
      tab: "careers"
    },
    {
      title: "4. Multi-Agent AI Mentor",
      message: "Ask the AI Mentor about your roadmap changes or pacing. Grounded in live agent logs with your choice of 5 OpenRouter free models.",
      cta: "Chat with Mentor",
      tab: "mentor"
    }
  ];

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleAction = () => {
    onNavigateTab(step.tab);
  };

  return (
    <div className="fixed bottom-16 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 z-50 sm:max-w-sm animate-fade-in">
      {/* Speech bubble pointer arrow */}
      <div className="relative rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white p-5 shadow-2xl shadow-violet-600/40 border border-white/20 backdrop-blur-md">
        {/* Header with Step Count & Close */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
              {currentStep + 1}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-200">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-violet-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Dismiss Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <h4 className="text-sm font-extrabold text-white mb-1.5">{step.title}</h4>
        <p className="text-xs text-violet-100 leading-relaxed mb-4">
          {step.message}
        </p>

        {/* Navigation & Action Bar matching screenshot */}
        <div className="flex items-center justify-between pt-2 border-t border-white/15">
          <button
            onClick={handleAction}
            className="text-xs font-bold text-white hover:text-violet-200 flex items-center gap-1 underline underline-offset-4"
          >
            <span>{step.cta}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 disabled:opacity-30 disabled:hover:bg-white/15 flex items-center justify-center text-white transition-colors"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
              title={currentStep === steps.length - 1 ? "Finish Tour" : "Next Step"}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

