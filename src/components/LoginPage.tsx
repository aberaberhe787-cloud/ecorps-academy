import React, { FormEvent, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  Code2,
  Eye,
  EyeOff,
  Github,
  LockKeyhole,
  Mail,
  Moon,
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
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
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
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
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
    setIsSubmitting(true);
    try {
      await signInWithPopup(auth, provider);
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

  return (
    <main className="login-page min-h-screen overflow-hidden bg-[#050a19] px-5 py-6 text-slate-100 sm:px-8 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[1180px] flex-col rounded-[22px] border border-slate-800/80 bg-[#080e20]/90 shadow-2xl shadow-black/30 lg:min-h-[610px] lg:flex-row">
        <section className="relative flex flex-1 flex-col overflow-hidden px-7 py-8 sm:px-10 lg:px-10 lg:py-9">
          <div className="pointer-events-none absolute -bottom-32 -left-10 h-80 w-[520px] rounded-full bg-blue-600/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full opacity-50 [background-image:linear-gradient(135deg,transparent_45%,rgba(37,99,235,.3)_46%,transparent_47%),linear-gradient(45deg,transparent_45%,rgba(124,58,237,.25)_46%,transparent_47%)] [background-size:38px_38px]" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/50 bg-blue-950/60 shadow-lg shadow-blue-950/50"><WandSparkles className="h-5 w-5 text-blue-400" /></div>
            <div><p className="font-semibold tracking-tight text-slate-100">Ecorp Academy</p><p className="text-[10px] text-slate-400">Prompt Engineering &amp; AI Systems</p></div>
          </div>

          <div className="relative z-10 mt-14 max-w-[470px] lg:mt-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-[11px] font-medium text-blue-300"><Sparkles className="h-3 w-3" /> Interactive Learning Platform</div>
            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-100 sm:text-4xl">Master the Architecture of<br /><span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Large Language Models</span></h1>
            <p className="mt-4 max-w-[430px] text-sm leading-6 text-slate-400">Join thousands of learners mastering prompt engineering, AI systems design, and real-world application through interactive lessons and hands-on practice.</p>
            <div className="mt-6 space-y-4">
              {[
                { icon: BookOpen, title: 'Interactive Lessons', detail: 'Learn through step-by-step interactive content', color: 'text-blue-400 bg-blue-500/10' },
                { icon: Code2, title: 'Prompt Engineering', detail: 'Master the art of crafting effective AI prompts', color: 'text-blue-400 bg-blue-500/10' },
                { icon: WandSparkles, title: 'Real-time Practice', detail: 'Practice in our sandbox with instant feedback', color: 'text-purple-400 bg-purple-500/10' },
                { icon: Trophy, title: 'Achievements & Certificates', detail: 'Earn badges and certificates as you progress', color: 'text-purple-400 bg-purple-500/10' },
              ].map(({ icon: Icon, title, detail, color }) => <div key={title} className="flex items-center gap-3"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color}`}><Icon className="h-4 w-4" /></div><div><p className="text-xs font-semibold text-slate-200">{title}</p><p className="mt-0.5 text-[10px] text-slate-500">{detail}</p></div></div>)}
            </div>
          </div>
        </section>

        <section className="relative flex w-full items-center px-5 py-5 sm:px-10 lg:w-[48%] lg:px-10">
          <div className="absolute right-8 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/70 text-slate-400"><Moon className="h-4 w-4" /></div>
          <div className="w-full rounded-2xl border border-indigo-500/50 bg-[#0c142a] p-6 shadow-[0_0_45px_rgba(37,99,235,.08)] sm:p-8">
            <div className="text-center"><h2 className="text-2xl font-bold text-slate-100">{isSignUp ? 'Create your account' : 'Welcome back'}</h2><p className="mt-2 text-xs text-slate-400">{isSignUp ? 'Start your AI learning journey' : 'Continue your AI learning journey'}</p></div>
            <form onSubmit={handleEmailAuth} className="mt-7 space-y-4">
              {isSignUp && <label className="block"><span className="mb-1.5 block text-[11px] text-slate-300">Full name</span><div className="relative"><UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input type="text" placeholder="Your name" className="login-input" /></div></label>}
              <label className="block"><span className="mb-1.5 block text-[11px] text-slate-300">Email address</span><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="login-input" autoComplete="email" /></div></label>
              <label className="block"><span className="mb-1.5 block text-[11px] text-slate-300">Password</span><div className="relative"><LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••••" className="login-input pr-10" autoComplete={isSignUp ? 'new-password' : 'current-password'} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>
              {!isSignUp && <div className="flex items-center justify-between text-[10px]"><label className="flex items-center gap-2 text-slate-400"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="accent-blue-500" /> Remember me</label><button type="button" className="text-blue-400 hover:text-blue-300">Forgot password?</button></div>}
              {error && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300">{error}</p>}
              <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-900/30 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60">{isSubmitting ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'} <ArrowRight className="h-4 w-4" /></button>
            </form>
            <div className="my-6 flex items-center gap-3 text-[10px] text-slate-500"><span className="h-px flex-1 bg-slate-800" />or continue with<span className="h-px flex-1 bg-slate-800" /></div>
            <div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => handleProviderAuth(new GithubAuthProvider())} disabled={isSubmitting} className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 text-xs text-slate-300 hover:border-slate-500"><Github className="h-4 w-4" /> GitHub</button><button type="button" onClick={() => handleProviderAuth(new GoogleAuthProvider())} disabled={isSubmitting} className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 text-xs text-slate-300 hover:border-slate-500"><span className="font-bold text-blue-400">G</span> Google</button></div>
            <p className="mt-6 text-center text-xs text-slate-400">{isSignUp ? 'Already have an account?' : "Don't have an account?"} <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="font-semibold text-blue-400 hover:text-blue-300">{isSignUp ? 'Sign in' : 'Sign up'}</button></p>
          </div>
        </section>
      </div>
      <footer className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-x-8 gap-y-2 py-4 text-[10px] text-slate-500"><span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-blue-400" /> <strong className="text-blue-300">10+</strong> Interactive Lessons</span><span className="flex items-center gap-2"><Code2 className="h-4 w-4 text-emerald-400" /> <strong className="text-emerald-300">6+</strong> Production Patterns</span><span className="flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-400" /> <strong className="text-amber-300">5+</strong> Graded Missions</span><span className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-400" /> <strong className="text-purple-300">100%</strong> Hands-On Practice</span></footer>
    </main>
  );
};
