import React, { FormEvent, useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Code2,
  Eye,
  EyeOff,
  Github,
  LockKeyhole,
  Mail,
  Sparkles,
  Trophy,
  UserRound,
  WandSparkles,
} from 'lucide-react';
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { recordUserActivity, consumeSessionExpiredNotice } from '../lib/sessionManager';

export const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [sessionNotice, setSessionNotice] = useState('');

  useEffect(() => {
    if (consumeSessionExpiredNotice()) {
      setSessionNotice('Your previous session expired due to inactivity. Please sign in again to continue.');
    }
  }, []);

  useEffect(() => {
    getRedirectResult(auth).catch((redirectError: any) => {
      if (redirectError) {
        setError(redirectError?.message || 'Redirect sign-in failed. Please try again.');
      }
    });
  }, []);

  const handleEmailAuth = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || password.length < 6) {
      setError('Enter a valid email and a password with at least 6 characters.');
      return;
    }

    setError('');
    setResetSuccess('');
    setSessionNotice('');
    setIsSubmitting(true);
    try {
      try {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      } catch (persistErr) {
        console.warn('Could not set auth persistence mode', persistErr);
      }

      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      recordUserActivity();
    } catch (authError: any) {
      setError(authError?.code === 'auth/invalid-credential'
        ? 'The email or password is incorrect.'
        : authError?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProviderAuth = async (provider: GoogleAuthProvider | GithubAuthProvider) => {
    setError('');
    setResetSuccess('');
    setSessionNotice('');
    setIsSubmitting(true);
    try {
      try {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      } catch (persistErr) {
        console.warn('Could not set auth persistence mode', persistErr);
      }

      await signInWithPopup(auth, provider);
      recordUserActivity();
    } catch (authError: any) {
      if (authError?.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError: any) {
          setError(redirectError?.message || 'Redirect sign-in failed. Please try again.');
        }
      } else {
        setError(authError?.message || 'Social sign-in failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address above first to receive a password reset link.');
      return;
    }
    setError('');
    setResetSuccess('');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSuccess(`Password reset email sent to ${email.trim()}. Please check your inbox.`);
    } catch (err: any) {
      setError(err?.message || 'Failed to send password reset email.');
    }
  };

  return (
    <main className="login-page min-h-screen bg-[#050a19] px-3.5 py-3 sm:px-6 sm:py-5 md:py-6 lg:px-10 lg:py-8 text-slate-100 flex flex-col justify-between">
      {/* Mobile Top Brand Bar - Compact, sticky branding on small screens (< 768px) */}
      <header className="md:hidden flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-400/50 bg-blue-950/80 shadow-sm shadow-blue-950/50">
            <WandSparkles className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-tight text-slate-100">Ecorp Academy</p>
            <p className="text-[9px] text-slate-400 leading-none">Prompt Engineering &amp; AI</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[9px] font-medium text-blue-300">
          <Sparkles className="h-2.5 w-2.5 text-blue-400" />
          <span>Interactive</span>
        </div>
      </header>

      {/* Main Responsive Container: Grid with mobile (<768px) first order on form, side-by-side on md/lg */}
      <div className="mx-auto w-full max-w-[1180px] grid grid-cols-1 md:grid-cols-2 rounded-[20px] md:rounded-[24px] border border-slate-800/80 bg-[#080e20]/95 shadow-2xl shadow-black/40 overflow-hidden md:min-h-[580px]">
        
        {/* SIGN-IN FORM: Positioned FIRST on mobile (< 768px) for instant above-the-fold CTA access */}
        <section
          id="auth-form-section"
          className="order-1 md:order-2 relative flex w-full items-center justify-center px-3.5 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10"
        >
          <div className="w-full max-w-md rounded-xl sm:rounded-2xl border border-indigo-500/40 bg-[#0c142a]/95 p-4 sm:p-6 md:p-7 shadow-[0_0_35px_rgba(37,99,235,.08)]">
            <div className="text-center">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-100">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-slate-400">
                {isSignUp ? 'Start mastering prompt engineering & AI systems' : 'Sign in to continue your AI learning journey'}
              </p>
            </div>

            {sessionNotice && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-300">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                <span>{sessionNotice}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {/* Quick 1-Click Social Sign In */}
            <div className="mt-3.5 sm:mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                id="google-signin-button"
                onClick={() => handleProviderAuth(new GoogleAuthProvider())}
                disabled={isSubmitting}
                className="flex min-h-[40px] sm:min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 py-2 px-3 text-xs font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-800/80 transition active:scale-[0.98]"
              >
                <span className="font-bold text-blue-400 text-sm leading-none">G</span>
                <span>Google</span>
              </button>
              <button
                type="button"
                id="github-signin-button"
                onClick={() => handleProviderAuth(new GithubAuthProvider())}
                disabled={isSubmitting}
                className="flex min-h-[40px] sm:min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 py-2 px-3 text-xs font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-800/80 transition active:scale-[0.98]"
              >
                <Github className="h-3.5 w-3.5 text-slate-300" />
                <span>GitHub</span>
              </button>
            </div>

            <div className="my-3 flex items-center gap-2.5 text-[9px] sm:text-[10px] uppercase font-mono tracking-wider text-slate-500">
              <span className="h-px flex-1 bg-slate-800" />
              <span>or with email</span>
              <span className="h-px flex-1 bg-slate-800" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-2.5 sm:space-y-3.5">
              {isSignUp && (
                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium text-slate-300">Full name</span>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="login-input text-xs sm:text-sm py-2 sm:py-2.5"
                      autoComplete="name"
                    />
                  </div>
                </label>
              )}

              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-slate-300">Email address</span>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="login-input text-xs sm:text-sm py-2 sm:py-2.5"
                    autoComplete="email"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-slate-300">Password</span>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••••••"
                    className="login-input pr-10 text-xs sm:text-sm py-2 sm:py-2.5"
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </label>

              {!isSignUp && (
                <div className="flex items-center justify-between text-[11px]">
                  <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="accent-blue-500 rounded"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-300">
                  {error}
                </p>
              )}

              {/* Primary Call to Action Button - Ensured Above the fold */}
              <button
                type="submit"
                id="primary-auth-submit-btn"
                disabled={isSubmitting}
                className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-900/30 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-3.5 sm:mt-4 text-center text-xs text-slate-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setResetSuccess('');
                }}
                className="font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-2 ml-1"
              >
                {isSignUp ? 'Sign in' : 'Create an account'}
              </button>
            </p>
          </div>
        </section>

        {/* MARKETING CONTENT: Placed below the form on mobile (order-2 md:order-1), side-by-side on desktop */}
        <section
          id="marketing-info-section"
          className="order-2 md:order-1 relative flex flex-col justify-between overflow-hidden px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10 lg:py-9 border-t md:border-t-0 md:border-r border-slate-800/60"
        >
          <div className="pointer-events-none absolute -bottom-32 -left-10 h-80 w-[520px] rounded-full bg-blue-600/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full opacity-50 [background-image:linear-gradient(135deg,transparent_45%,rgba(37,99,235,.3)_46%,transparent_47%),linear-gradient(45deg,transparent_45%,rgba(124,58,237,.25)_46%,transparent_47%)] [background-size:38px_38px]" />

          {/* Desktop/Tablet brand banner */}
          <div className="hidden md:flex relative z-10 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/50 bg-blue-950/60 shadow-lg shadow-blue-950/50">
              <WandSparkles className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold tracking-tight text-slate-100">Ecorp Academy</p>
              <p className="text-[10px] text-slate-400">Prompt Engineering &amp; AI Systems</p>
            </div>
          </div>

          <div className="relative z-10 mt-1 sm:mt-2 md:mt-6 lg:mt-8 max-w-[470px]">
            <div className="hidden md:inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-[11px] font-medium text-blue-300">
              <Sparkles className="h-3 w-3" /> Interactive AI Academy
            </div>
            <h2 className="mt-1 sm:mt-3 md:mt-4 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-slate-100">
              Master the Architecture of<br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Large Language Models
              </span>
            </h2>
            <p className="mt-2 sm:mt-3 max-w-[430px] text-xs sm:text-sm leading-relaxed text-slate-400">
              Join thousands of developers and AI practitioners mastering prompt engineering, system design, and production workflows with real-time sandbox feedback.
            </p>

            <div className="mt-4 sm:mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2.5 sm:gap-3">
              {[
                {
                  icon: BookOpen,
                  title: 'Interactive Lessons',
                  detail: 'Step-by-step interactive modules with verified prompt formulas',
                  color: 'text-blue-400 bg-blue-500/10',
                },
                {
                  icon: Code2,
                  title: 'Production Patterns',
                  detail: 'Chain-of-thought, ReAct, RAG, and meta-prompting frameworks',
                  color: 'text-emerald-400 bg-emerald-500/10',
                },
                {
                  icon: WandSparkles,
                  title: 'Live AI Sandbox',
                  detail: 'Test and benchmark prompts with instant evaluation metrics',
                  color: 'text-purple-400 bg-purple-500/10',
                },
                {
                  icon: Trophy,
                  title: 'Graded Missions',
                  detail: 'Earn verified skill certificates and track your mastery XP',
                  color: 'text-amber-400 bg-amber-500/10',
                },
              ].map(({ icon: Icon, title, detail, color }) => (
                <div key={title} className="flex items-center gap-2.5 sm:gap-3 rounded-xl bg-slate-900/40 p-2 sm:p-2.5 border border-slate-800/50">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{title}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block relative z-10 mt-6 pt-4 border-t border-slate-800/60 text-[11px] text-slate-500">
            <span>Trusted by builders learning modern AI orchestration</span>
          </div>
        </section>
      </div>

      {/* Footer Features Bar */}
      <footer className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-x-6 gap-y-1.5 py-2.5 sm:py-3 text-[10px] sm:text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-blue-400" />
          <strong className="text-blue-300">10+</strong> Interactive Lessons
        </span>
        <span className="flex items-center gap-1.5">
          <Code2 className="h-3.5 w-3.5 text-emerald-400" />
          <strong className="text-emerald-300">6+</strong> Production Patterns
        </span>
        <span className="flex items-center gap-1.5">
          <Trophy className="h-3.5 w-3.5 text-amber-400" />
          <strong className="text-amber-300">5+</strong> Graded Missions
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5 text-purple-400" />
          <strong className="text-purple-300">100%</strong> Hands-On Practice
        </span>
      </footer>
    </main>
  );
};

