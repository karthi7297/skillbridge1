import React, { useState, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ArrowRight,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Cpu,
  Check
} from 'lucide-react';
import { api } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  suggestedActions?: string[];
  timestamp: string;
}

interface MentorPageProps {
  onNavigateTab?: (tab: string) => void;
}

export const MentorPage: React.FC<MentorPageProps> = ({ onNavigateTab }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      sender: 'mentor',
      text: "Hello Alex! I am your SkillBridge AI Mentor. I have full context of your profile, your active roadmap, your verified skills, and your recent agent team activities. How can I help you today?",
      suggestedActions: ["What should I learn this week?", "Why do I need JavaScript before React?"],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeModel, setActiveModel] = useState('openrouter/free');
  const [models, setModels] = useState<Array<{ id: string; name: string; provider: string; description: string }>>([]);
  const [modelChangeSuccess, setModelChangeSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const data = await api.getModels();
      setActiveModel(data.active_model);
      setModels(data.models);
    } catch {
      // Backend will use default
    }
  };

  const handleModelSelect = async (modelId: string) => {
    try {
      const res = await api.selectModel(modelId);
      setActiveModel(res.active_model);
      setModelChangeSuccess(`Active AI Model: ${modelId}`);
      setTimeout(() => setModelChangeSuccess(null), 3000);
    } catch (err: any) {
      alert(`Model selection failed: ${err.message}`);
    }
  };

  const suggestedPrompts = [
    "What should I learn this week?",
    "Why did my roadmap change?",
    "Why do I need JavaScript before React?",
    "I have only 5 hours this week. Can you adjust my plan?",
    "Can I switch to Data Engineer?"
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.mentorChat(textToSend);
      const mentorMsg: Message = {
        id: `mentor-${Date.now()}`,
        sender: 'mentor',
        text: response.reply,
        suggestedActions: response.suggested_actions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, mentorMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `mentor-err-${Date.now()}`,
        sender: 'mentor',
        text: `I encountered an issue connecting to the orchestrator: ${err.message}. Please verify backend health.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    const actLower = action.toLowerCase();
    if (onNavigateTab) {
      if (actLower.includes('roadmap')) onNavigateTab('roadmap');
      else if (actLower.includes('assessment') || actLower.includes('quiz')) onNavigateTab('assessment');
      else if (actLower.includes('career')) onNavigateTab('careers');
      else if (actLower.includes('profile')) onNavigateTab('profile');
      else handleSend(action);
    } else {
      handleSend(action);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Header & OpenRouter Free Model Switcher */}
      <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600 shrink-0" />
            <span>AI Academic & Career Mentor</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Grounded directly in your profile, current skill gaps, active roadmap tasks, and agent activity history.
          </p>
        </div>

        {/* 3+ Free OpenRouter Model Selector */}
        <div className="flex flex-col items-start sm:items-end gap-1 w-full sm:w-auto">
          <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-violet-600" />
            <span>AI Model (OpenRouter Free):</span>
          </label>
          <select
            value={activeModel}
            onChange={(e) => handleModelSelect(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-white border border-violet-200 text-xs font-semibold text-violet-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-violet-300"
          >
            {models.length > 0 ? (
              models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider})
                </option>
              ))
            ) : (
              <>
                <option value="openrouter/free">OpenRouter Auto-Free</option>
                <option value="google/gemini-2.0-flash-exp:free">Gemini 2.0 Flash (Free)</option>
                <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B (Free)</option>
                <option value="mistralai/mistral-7b-instruct:free">Mistral 7B (Free)</option>
              </>
            )}
          </select>
          {modelChangeSuccess && (
            <span className="text-[10px] text-emerald-600 font-medium animate-pulse">{modelChangeSuccess}</span>
          )}
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="space-y-1.5">
        <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Suggested Questions:</span>
        </span>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-xl bg-white hover:bg-violet-50 border border-slate-200 hover:border-violet-300 text-slate-700 transition-colors shadow-xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="p-3 sm:p-6 rounded-2xl bg-white border border-violet-100 shadow-sm min-h-[350px] max-h-[520px] overflow-y-auto space-y-3 sm:space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                  isUser
                    ? 'bg-violet-600 text-white'
                    : 'bg-violet-100 text-violet-700 border border-violet-200'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 shadow-sm ${
                  isUser
                    ? 'bg-violet-600 text-white rounded-tr-none'
                    : 'bg-violet-50/70 text-gray-800 border border-violet-100 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                {/* Suggested Action Pills */}
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="pt-2 border-t border-violet-200/60 flex flex-wrap gap-1.5">
                    {m.suggestedActions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionClick(act)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-violet-100 text-violet-700 border border-violet-200 text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-xs"
                      >
                        <span>{act}</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                )}

                <div className={`text-[10px] ${isUser ? 'text-violet-200 text-right' : 'text-gray-400'}`}>
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 border border-violet-200 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-violet-50 border border-violet-100 text-xs text-gray-600 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-600 animate-ping" />
              <span>Mentor is analyzing learner telemetry & compiling response...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your study path, why a task was scheduled, or goal adjustments..."
          className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 shadow-sm"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
