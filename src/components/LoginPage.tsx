import React, { FormEvent, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Code2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  Sparkles,
  Trophy,
  UserRound,
  WandSparkles,
  X,
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
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { recordUserActivity } from '../lib/sessionManager';
import { AnimatedPromptRuntime } from './AnimatedPromptRuntime';
import { useApp } from '../context/AppContext';

function getAuthErrorMessage(authError: any): string {
  const code = authError?.code;
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'The email or password you entered is incorrect. Please verify your credentials or reset your password.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please switch to the Sign In tab.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please provide a valid email address.';
    case 'auth/operation-not-allowed':
      return 'This sign-in provider is not enabled in the Firebase Console. Please enable Email/Password or Google provider under Authentication > Sign-in method.';
    case 'auth/unauthorized-domain':
      return 'This preview domain is not authorized in Firebase Auth. Please add this domain under Firebase Console -> Authentication -> Settings -> Authorized domains.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing authentication. Please try again.';
    case 'auth/too-many-requests':
      return 'Access temporarily blocked due to too many failed attempts. Please reset your password or try again in a few minutes.';
    case 'auth/network-request-failed':
      return 'Network communication failed. Please check your internet connection and try again.';
    default:
      return authError?.message || 'Authentication failed. Please try again.';
  }
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

const validateEmail = (val: string): string => {
  if (!val.trim()) return 'Email address is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(val.trim())) {
    return 'Please enter a valid email address (e.g. name@domain.com).';
  }
  return '';
};

const validatePassword = (val: string): string => {
  if (!val) return 'Password is required.';
  if (val.length < 6) return 'Password must be at least 6 characters.';
  return '';
};

const validateName = (val: string): string => {
  if (!val.trim()) return 'Full name is required.';
  if (val.trim().length < 2) return 'Name must be at least 2 characters.';
  return '';
};

const FOOTER_FEATURES = [
  {
    icon: BookOpen,
    iconColor: 'text-blue-400',
    number: '10+',
    numberColor: 'text-blue-300',
    text: 'Interactive Lessons',
    gradient: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 150deg, #2563eb 220deg, #38bdf8 290deg, #818cf8 360deg)',
  },
  {
    icon: Code2,
    iconColor: 'text-emerald-400',
    number: '6+',
    numberColor: 'text-emerald-300',
    text: 'Production Patterns',
    gradient: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 150deg, #059669 220deg, #34d399 290deg, #2dd4bf 360deg)',
  },
  {
    icon: Trophy,
    iconColor: 'text-amber-400',
    number: '5+',
    numberColor: 'text-amber-300',
    text: 'Graded Missions',
    gradient: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 150deg, #d97706 220deg, #fbbf24 290deg, #f97316 360deg)',
  },
  {
    icon: Check,
    iconColor: 'text-purple-400',
    number: '100%',
    numberColor: 'text-purple-300',
    text: 'Hands-On Practice',
    gradient: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 150deg, #7c3aed 220deg, #c084fc 290deg, #f472b6 360deg)',
  },
];

interface LoginPageProps {
  message?: string;
  onSuccess?: () => void;
  isModal?: boolean;
  redirectPath?: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({ message, onSuccess, isModal = false, redirectPath = null }) => {
  const { setActiveTab } = useApp();
  // ... inside handleEmailAuth onSuccess and handleProviderAuth onSuccess:
  // if (redirectPath) setActiveTab(redirectPath as any);
  // else if (onSuccess) onSuccess();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ai_studio_remember_me');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    try {
      localStorage.setItem('ai_studio_remember_me', String(checked));
    } catch {
      // Ignore localStorage restrictions
    }
  };
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; password?: boolean }>({});
  const [focusedField, setFocusedField] = useState<'name' | 'email' | 'password' | null>(null);

  // Forgot Password Modal State
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmailError, setForgotEmailError] = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isForgotPasswordOpen) {
        setIsForgotPasswordOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isForgotPasswordOpen]);

  useEffect(() => {
    getRedirectResult(auth).then((result) => {
      if (result && result.user) {
        recordUserActivity();
      }
    }).catch((redirectError: any) => {
      if (redirectError) {
        setError(getAuthErrorMessage(redirectError));
      }
    });
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    if (touched.name || fieldErrors.name) {
      const err = validateName(val);
      setFieldErrors((prev) => ({ ...prev, name: err || undefined }));
    }
    if (error) setError('');
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (touched.email || fieldErrors.email) {
      const err = validateEmail(val);
      setFieldErrors((prev) => ({ ...prev, email: err || undefined }));
    }
    if (error) setError('');
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (touched.password || fieldErrors.password) {
      const err = validatePassword(val);
      setFieldErrors((prev) => ({ ...prev, password: err || undefined }));
    }
    if (error) setError('');
  };

  const handleBlur = (field: 'name' | 'email' | 'password') => {
    setFocusedField(null);
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'name' && isSignUp) {
      const err = validateName(name);
      setFieldErrors((prev) => ({ ...prev, name: err || undefined }));
    } else if (field === 'email') {
      const err = validateEmail(email);
      setFieldErrors((prev) => ({ ...prev, email: err || undefined }));
    } else if (field === 'password') {
      const err = validatePassword(password);
      setFieldErrors((prev) => ({ ...prev, password: err || undefined }));
    }
  };

  const handleFocus = (field: 'name' | 'email' | 'password') => {
    setFocusedField(field);
  };

  const handleEmailAuth = async (event?: FormEvent | React.KeyboardEvent) => {
    if (event) {
      event.preventDefault();
    }
    if (isSubmitting || socialLoading !== null) {
      return;
    }

    const errors: FieldErrors = {};
    if (isSignUp) {
      const nameErr = validateName(name);
      if (nameErr) errors.name = nameErr;
    }
    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;
    const passwordErr = validatePassword(password);
    if (passwordErr) errors.password = passwordErr;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouched({ name: true, email: true, password: true });
      return;
    }

    setFieldErrors({});
    setError('');
    setResetSuccess('');
    setIsSubmitting(true);
    recordUserActivity();

    try {
      const persistenceMode = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      try {
        await setPersistence(auth, persistenceMode);
      } catch (persistErr) {
        console.warn('Could not set auth persistence mode', persistErr);
      }

      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim() && userCredential.user) {
          try {
            await updateProfile(userCredential.user, { displayName: name.trim() });
          } catch (profileErr) {
            console.warn('Could not set user display name', profileErr);
          }
        }
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      recordUserActivity();
      if (redirectPath) setActiveTab(redirectPath as any);
      else if (onSuccess) onSuccess();
    } catch (authError: any) {
      const code = authError?.code;
      const genericMsg = getAuthErrorMessage(authError);
      setError(genericMsg);

      const newFieldErrors: FieldErrors = {};
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        newFieldErrors.password = 'Incorrect password. Check your password or reset it.';
        newFieldErrors.email = 'Please ensure this email is associated with your account.';
      } else if (code === 'auth/user-not-found') {
        newFieldErrors.email = 'No account found with this email. Create an account instead.';
      } else if (code === 'auth/email-already-in-use') {
        newFieldErrors.email = 'This email is already in use. Please sign in instead.';
      } else if (code === 'auth/invalid-email') {
        newFieldErrors.email = 'Please enter a valid email address format.';
      } else if (code === 'auth/weak-password') {
        newFieldErrors.password = 'Password is too weak. Please use at least 6 characters.';
      }

      setFieldErrors((prev) => ({ ...prev, ...newFieldErrors }));
      setTouched({ name: true, email: true, password: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProviderAuth = async (providerType: 'google' | 'github') => {
    setError('');
    setFieldErrors({});
    setResetSuccess('');
    setSocialLoading(providerType);
    setIsSubmitting(true);
    recordUserActivity();

    const provider = providerType === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();

    try {
      const persistenceMode = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      try {
        await setPersistence(auth, persistenceMode);
      } catch (persistErr) {
        console.warn('Could not set auth persistence mode', persistErr);
      }

      await signInWithPopup(auth, provider);
      recordUserActivity();
      if (redirectPath) setActiveTab(redirectPath as any);
      else if (onSuccess) onSuccess();
    } catch (authError: any) {
      if (authError?.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError: any) {
          setError(getAuthErrorMessage(redirectError));
        }
      } else {
        setError(getAuthErrorMessage(authError));
      }
    } finally {
      setSocialLoading(null);
      setIsSubmitting(false);
    }
  };

  const openForgotPasswordModal = () => {
    setForgotEmail(email.trim());
    setForgotEmailError('');
    setForgotSuccess(false);
    setForgotError('');
    setIsForgotPasswordOpen(true);
  };

  const closeForgotPasswordModal = () => {
    setIsForgotPasswordOpen(false);
    setForgotEmailError('');
    setForgotError('');
  };

  const handleSendPasswordReset = async (event: FormEvent) => {
    event.preventDefault();
    const cleanEmail = forgotEmail.trim();
    const emailErr = validateEmail(cleanEmail);
    if (emailErr) {
      setForgotEmailError(emailErr);
      return;
    }

    setForgotEmailError('');
    setForgotError('');
    setIsForgotSubmitting(true);

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setForgotSuccess(true);
      setResetSuccess(`Password reset email sent to ${cleanEmail}. Check your inbox.`);
      if (!email) {
        setEmail(cleanEmail);
      }
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/user-not-found') {
        setForgotEmailError('No registered account found with this email address.');
      } else if (code === 'auth/invalid-email') {
        setForgotEmailError('Please enter a valid email address format.');
      } else if (code === 'auth/too-many-requests') {
        setForgotError('Too many password reset attempts. Please wait a few minutes before trying again.');
      } else {
        setForgotError(getAuthErrorMessage(err));
      }
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  return (
    <main className="login-page min-h-dvh bg-[#030712] text-slate-100 flex flex-col justify-between items-center w-full px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 lg:py-10 relative">
      {/* Background Ambient Glows & Cyber Gradients */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <div className="absolute top-[-10%] left-[10%] w-[300px] sm:w-[500px] lg:w-[700px] h-[300px] sm:h-[500px] lg:h-[700px] rounded-full bg-blue-600/10 blur-[100px] lg:blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[250px] sm:w-[450px] lg:w-[600px] h-[250px] sm:h-[450px] lg:h-[600px] rounded-full bg-indigo-600/10 blur-[90px] lg:blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:4rem_4rem]" />
      </div>

      {/* Top Mobile/Tablet Header Branding (< 1024px) */}
      <header className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:hidden flex items-center justify-between mb-4 sm:mb-6 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/40 bg-blue-950/80 shadow-md shadow-blue-950/60">
            <WandSparkles className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-white block leading-tight">Ecorp Academy</span>
            <span className="text-xs text-blue-400/90 font-medium leading-none block">Prompt Engineering &amp; AI</span>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
          <Sparkles className="h-3 w-3 text-blue-400 shrink-0" />
          <span>v2.4 Live</span>
        </div>
      </header>

      {/* Main Container: Mobile/Tablet centered stack (w-full max-w-md sm:max-w-xl md:max-w-2xl), Desktop 2-column balanced grid (lg:max-w-6xl xl:max-w-7xl lg:grid-cols-12) */}
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-6xl xl:max-w-7xl my-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-10 xl:gap-14 items-center"
        >
          {/* LEFT COLUMN: Authoritative Ecorp Academy Showcase (Streamlined on mobile/tablet below auth card, full power on desktop lg:col-span-7) */}
          <section
            id="marketing-info-section"
            className="order-2 lg:order-1 lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-7"
          >
            {/* Desktop Brand Banner */}
            <div className="hidden lg:flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-950/90 to-slate-900 shadow-lg shadow-blue-950/60">
                <WandSparkles className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white block">Ecorp Academy</span>
                <span className="text-xs text-blue-400 font-semibold tracking-wide uppercase font-mono">Prompt Engineering &amp; AI Systems</span>
              </div>
            </div>

            {/* Hero Value Headline */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span>Next-Gen LLM Architecture Curriculum</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-white leading-tight">
                Master the Architecture of{' '}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  Large Language Models
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed max-w-2xl">
                Hands-on, production-grade mastery in structured directives, in-context reasoning, autonomous agents, and multi-modal prompt synthesis.
              </p>
            </div>

            {/* Live Interactive Code/Prompt Preview Sandbox Card (Animated Directive Runtime) */}
            <AnimatedPromptRuntime />

            {/* 4 Feature Value Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[
                {
                  icon: BookOpen,
                  title: 'Interactive Lessons',
                  detail: '10+ structured modules with instant verification',
                  color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                },
                {
                  icon: Code2,
                  title: 'Production Patterns',
                  detail: 'CoT, Few-Shot, ReAct & RAG frameworks',
                  color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                },
                {
                  icon: WandSparkles,
                  title: 'Live AI Sandbox',
                  detail: 'Instant token benchmarks & output evaluations',
                  color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                },
                {
                  icon: Trophy,
                  title: 'Graded Missions',
                  detail: 'Earn verified certificates & ledger XP',
                  color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                },
              ].map(({ icon: Icon, title, detail, color }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 rounded-xl bg-slate-900/50 p-3 sm:p-3.5 border border-slate-800/80 backdrop-blur-sm transition-all hover:bg-slate-900/80 hover:border-slate-700/80"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${color}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-100">{title}</p>
                    <p className="text-xs text-slate-400 leading-snug">{detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Trust Proof */}
            <div className="flex items-center gap-4 pt-2 text-xs text-slate-400 border-t border-slate-800/70">
              <div className="flex -space-x-2 overflow-hidden shrink-0">
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-900 bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">EA</div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-900 bg-purple-600 text-white font-bold flex items-center justify-center text-[10px]">AI</div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-900 bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">LLM</div>
              </div>
              <span className="leading-snug">Join <strong className="text-slate-200">10,000+</strong> engineers mastering prompt engineering worldwide.</span>
            </div>
          </section>

          {/* RIGHT COLUMN: Elevated Authentication Form Card (Mobile full width, Desktop lg:col-span-5) */}
          <section
            id="auth-form-section"
            className="order-1 lg:order-2 lg:col-span-5 w-full flex justify-center"
          >
            <div className="w-full rounded-2xl sm:rounded-3xl border border-slate-800/90 bg-slate-900/90 p-5 sm:p-7 md:p-8 lg:p-8 xl:p-9 backdrop-blur-xl shadow-2xl shadow-blue-950/40 relative">
              {/* Top Accent Line */}
              <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent rounded-full" />

              {/* Form Title & Subtitle */}
              <div className="text-center space-y-1.5 mb-5 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {isSignUp ? 'Create your account' : 'Welcome back'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {isSignUp
                    ? 'Start mastering prompt engineering & AI systems'
                    : 'Sign in to access your curriculum and credentials'}
                </p>
              </div>

              {/* Action Banner Message */}
              {message && (
                <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {/* Password Reset Alert Confirmation */}
              {resetSuccess && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              {/* 1-Click Fast Social Auth Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  type="button"
                  id="google-signin-button"
                  onClick={() => handleProviderAuth('google')}
                  disabled={isSubmitting || socialLoading !== null}
                  aria-busy={socialLoading === 'google'}
                  className={`group flex min-h-[44px] items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs sm:text-sm font-semibold transition-all duration-150 w-full shadow-sm touch-manipulation select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                    socialLoading === 'google'
                      ? 'border-blue-500/70 bg-blue-950/50 text-blue-200 cursor-wait'
                      : isSubmitting || socialLoading !== null
                      ? 'border-slate-800 bg-slate-900/50 text-slate-500 cursor-not-allowed opacity-50'
                      : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:border-slate-500 hover:bg-slate-800 active:scale-[0.98]'
                  }`}
                >
                  {socialLoading === 'google' ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  ) : (
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  )}
                  <span className="truncate">{socialLoading === 'google' ? 'Connecting...' : 'Google'}</span>
                </button>

                <button
                  type="button"
                  id="github-signin-button"
                  onClick={() => handleProviderAuth('github')}
                  disabled={isSubmitting || socialLoading !== null}
                  aria-busy={socialLoading === 'github'}
                  className={`group flex min-h-[44px] items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs sm:text-sm font-semibold transition-all duration-150 w-full shadow-sm touch-manipulation select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 ${
                    socialLoading === 'github'
                      ? 'border-slate-500/70 bg-slate-900 text-slate-100 cursor-wait'
                      : isSubmitting || socialLoading !== null
                      ? 'border-slate-800 bg-slate-900/50 text-slate-500 cursor-not-allowed opacity-50'
                      : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:border-slate-500 hover:bg-slate-800 active:scale-[0.98]'
                  }`}
                >
                  {socialLoading === 'github' ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
                  ) : (
                    <svg className="h-4 w-4 shrink-0 fill-current text-white" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  )}
                  <span className="truncate">{socialLoading === 'github' ? 'Connecting...' : 'GitHub'}</span>
                </button>
              </div>

              {/* Horizontal Divider */}
              <div className="mb-5 flex items-center gap-3 text-xs uppercase font-mono tracking-wider text-slate-500">
                <span className="h-px flex-1 bg-slate-800" />
                <span>or with email</span>
                <span className="h-px flex-1 bg-slate-800" />
              </div>

              {/* Credentials Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4" noValidate>
                {isSignUp && (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="signup-name-input"
                      className="block text-xs sm:text-sm font-semibold text-slate-300"
                    >
                      Full name
                    </label>
                    <div className="relative">
                      <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        id="signup-name-input"
                        type="text"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        onFocus={() => handleFocus('name')}
                        onBlur={() => handleBlur('name')}
                        placeholder="Ada Lovelace"
                        className={`login-input ${focusedField === 'name' ? 'is-focused' : ''} ${
                          fieldErrors.name ? 'has-error' : touched.name && name.trim() ? 'is-valid' : ''
                        }`}
                        autoComplete="name"
                        required
                      />
                    </div>
                    {fieldErrors.name && (
                      <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{fieldErrors.name}</span>
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label
                    htmlFor="login-email-input"
                    className="block text-xs sm:text-sm font-semibold text-slate-300"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      id="login-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      onFocus={() => handleFocus('email')}
                      onBlur={() => handleBlur('email')}
                      placeholder="you@domain.com"
                      className={`login-input ${focusedField === 'email' ? 'is-focused' : ''} ${
                        fieldErrors.email ? 'has-error' : touched.email && email.trim() ? 'is-valid' : ''
                      }`}
                      autoComplete="email"
                      required
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{fieldErrors.email}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="login-password-input"
                    className="block text-xs sm:text-sm font-semibold text-slate-300"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      id="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      onFocus={() => handleFocus('password')}
                      onBlur={() => handleBlur('password')}
                      placeholder="••••••••••••"
                      className={`login-input pr-11 ${focusedField === 'password' ? 'is-focused' : ''} ${
                        fieldErrors.password ? 'has-error' : touched.password && password.length >= 6 ? 'is-valid' : ''
                      }`}
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                      required
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{fieldErrors.password}</span>
                    </p>
                  )}
                </div>

                {error && (
                  <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  id="primary-auth-submit-btn"
                  disabled={isSubmitting || socialLoading !== null}
                  aria-busy={isSubmitting}
                  className="w-full min-h-[46px] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] hover:bg-right py-3 px-4 text-sm font-bold text-white shadow-lg shadow-blue-900/40 transition-all duration-300 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 cursor-pointer select-none mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white shrink-0" />
                      <span>{isSignUp ? 'Creating account...' : 'Signing in...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </>
                  )}
                </button>

                {/* Remember Me & Forgot Password */}
                {!isSignUp && (
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm pt-1">
                    <label
                      htmlFor="login-remember-me-checkbox"
                      className="inline-flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer select-none"
                    >
                      <input
                        id="login-remember-me-checkbox"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => handleRememberMeChange(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                      />
                      <span>Remember me</span>
                    </label>
                    <button
                      type="button"
                      id="forgot-password-button"
                      onClick={openForgotPasswordModal}
                      className="text-blue-400 hover:text-blue-300 font-medium hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </form>

              {/* Mode Switch Toggle */}
              <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs sm:text-sm text-slate-400">
                <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setFieldErrors({});
                    setTouched({});
                    setResetSuccess('');
                  }}
                  className="font-bold text-blue-400 hover:text-blue-300 hover:underline ml-1 cursor-pointer"
                >
                  {isSignUp ? 'Sign in' : 'Create an account'}
                </button>
              </div>
            </div>
          </section>
        </motion.div>
      </div>

      {/* Footer Feature Statistics Bar (Standard Tailwind: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4) */}
      <footer
        id="login-footer-feature-statistics"
        className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-6xl xl:max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8 lg:mt-12 z-10 shrink-0"
      >
        {FOOTER_FEATURES.map((feat, index) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.text}
              className="relative group overflow-hidden rounded-2xl p-[1px] transition-all duration-300 hover:scale-[1.02] shadow-sm shadow-black/40"
            >
              <div className="absolute inset-0 rounded-2xl border border-slate-800/80 pointer-events-none" />
              <div
                className="absolute inset-[-150%] animate-rotate-border pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity"
                style={{
                  background: feat.gradient,
                  animationDelay: `${index * -1.1}s`,
                  willChange: 'transform',
                }}
              />
              <div className="relative z-10 flex h-full w-full items-center justify-center gap-3 rounded-[15px] bg-slate-900/90 py-3 px-4 backdrop-blur-md">
                <Icon className={`h-4.5 w-4.5 ${feat.iconColor} shrink-0`} />
                <span className="text-slate-300 text-xs sm:text-sm whitespace-nowrap">
                  <strong className={`${feat.numberColor} font-bold mr-1.5`}>{feat.number}</strong>
                  {feat.text}
                </span>
              </div>
            </div>
          );
        })}
      </footer>

      {/* Forgot Password Flow Modal */}
      <AnimatePresence>
        {isForgotPasswordOpen && (
          <div
            id="forgot-password-modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeForgotPasswordModal();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-password-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl shadow-blue-950/50 text-slate-100 relative my-auto"
            >
              <button
                type="button"
                id="close-forgot-password-modal"
                onClick={closeForgotPasswordModal}
                className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              {!forgotSuccess ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 id="forgot-password-title" className="text-lg font-bold text-white">
                        Reset Password
                      </h3>
                      <p className="text-xs text-slate-400">
                        We'll send a secure password reset link to your email.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSendPasswordReset} className="space-y-4" noValidate>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="forgot-password-email-input"
                        className="block text-xs sm:text-sm font-semibold text-slate-300"
                      >
                        Account email address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input
                          id="forgot-password-email-input"
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => {
                            setForgotEmail(e.target.value);
                            if (forgotEmailError) setForgotEmailError('');
                            if (forgotError) setForgotError('');
                          }}
                          placeholder="you@domain.com"
                          className={`login-input ${forgotEmailError ? 'has-error' : ''}`}
                          autoComplete="email"
                          autoFocus
                          required
                        />
                      </div>
                      {forgotEmailError && (
                        <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>{forgotEmailError}</span>
                        </p>
                      )}
                    </div>

                    {forgotError && (
                      <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>{forgotError}</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                      <button
                        type="submit"
                        id="submit-password-reset-btn"
                        disabled={isForgotSubmitting}
                        aria-busy={isForgotSubmitting}
                        className="w-full sm:flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 px-4 text-sm font-bold text-white shadow-lg shadow-blue-900/30 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                      >
                        {isForgotSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-white shrink-0" />
                            <span>Sending link...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Reset Link</span>
                            <ArrowRight className="h-4 w-4 shrink-0" />
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={closeForgotPasswordModal}
                        disabled={isForgotSubmitting}
                        className="w-full sm:w-auto min-h-[44px] rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="text-center py-3 space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Check your inbox</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    We sent a password reset link to{' '}
                    <strong className="text-blue-400">{forgotEmail}</strong>. Follow the instructions to reset your password.
                  </p>
                  <button
                    type="button"
                    id="back-to-signin-after-reset-btn"
                    onClick={closeForgotPasswordModal}
                    className="w-full min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-white py-2.5 px-4 text-sm font-bold transition mt-2 cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};
