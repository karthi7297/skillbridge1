import React, { useState, useEffect } from 'react';
import { User, Lock, ChevronRight, Users, Loader2 } from 'lucide-react';
import { api, setActiveUserId } from '../services/api';
import { DemoUser } from '../types';

interface SigninPageProps {
  onSigninSuccess: (userId: string) => void;
}

export const SigninPage: React.FC<SigninPageProps> = ({ onSigninSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.listDemoUsers()
      .then(users => { if (!cancelled) setDemoUsers(users); })
      .catch(() => { if (!cancelled) setDemoUsers([]); })
      .finally(() => { if (!cancelled) setLoadingUsers(false); });
    return () => { cancelled = true; };
  }, []);

  const performSignin = async (identifier: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.login(identifier);
      setActiveUserId(response.user_id);
      onSigninSuccess(response.user_id);
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    await performSignin(email.trim() || 'demo-user-alex');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10 px-4 bg-violet-50">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Sign In Form */}
        <div className="p-8 bg-white rounded-2xl shadow-xl border border-violet-200 h-fit">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-700 to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/30">
              <User className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1.5">Welcome Back</h2>
            <p className="text-sm text-gray-500">Sign in to your SkillBridge AI account</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-700 text-sm mb-4">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSignin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email or User ID
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="text"
                placeholder="alex.chen@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:border-transparent transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-colors shadow-lg shadow-violet-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 mt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Demo mode accepts any email or user ID. Use <span className="font-mono text-violet-600">demo-user-alex</span> for the default learner.
            </p>
          </div>
        </div>

        {/* Mock Accounts */}
        <div className="p-8 bg-white rounded-2xl shadow-xl border border-violet-200 h-fit">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-violet-600" />
            <h3 className="text-lg font-bold text-gray-900">Mock Learner Accounts</h3>
          </div>
          <p className="text-xs text-gray-500 mb-5">
            Pick any seeded learner to sign in instantly. Each has a distinct target role and skill profile.
          </p>

          {loadingUsers ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
            </div>
          ) : demoUsers.length === 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
              No mock learners seeded yet. Use the “Load Sample Student” button in the header to populate the database.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {demoUsers.map((u) => (
                <button
                  key={u.user_id}
                  onClick={() => performSignin(u.user_id)}
                  disabled={loading}
                  className="w-full p-3.5 rounded-xl border border-violet-100 bg-violet-50/50 hover:bg-violet-100 hover:border-violet-300 text-left transition-all disabled:opacity-50 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{u.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{u.current_role}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 border border-violet-200 text-violet-700 font-semibold">
                          {u.goal_role_title || 'No target role'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-100 border border-cyan-200 text-cyan-700 font-semibold">
                          {u.skill_count} skills
                        </span>
                        {u.weekly_hours != null && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 font-semibold">
                            {u.weekly_hours} hrs/wk
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-violet-300 group-hover:text-violet-600 transition-colors shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
