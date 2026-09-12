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

export const LoginPage: React.FC = () => {
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
    <main className="login-page min-h-dvh bg-[#050a19] px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-4 lg:py-6 text-slate-100 flex flex-col justify-start md:justify-center items-center gap-3 sm:gap-4 md:gap-3.5 lg:gap-5 w-full max-w-full overflow-x-hidden overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]">
      {/* Mobile Top Brand Bar - Compact branding on small phone screens (< 768px) */}
      <header className="md:hidden flex items-center justify-between mb-1.5 sm:mb-3 px-1 w-full max-w-md mx-auto shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/50 bg-blue-950/80 shadow-sm shadow-blue-950/50">
            <WandSparkles className="h-4.5 w-4.5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-slate-100 leading-tight">Ecorp Academy</p>
            <p className="text-[10px] text-slate-400 leading-none">Prompt Engineering &amp; AI</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[10px] font-medium text-blue-300">
          <Sparkles className="h-3 w-3 text-blue-400 shrink-0" />
          <span>Interactive</span>
        </div>
      </header>

      {/* Main Responsive Container: Fluid sizing across device widths, 1-column stack on tablet portrait, 2-column grid on tablet landscape & desktop */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-[94%] sm:w-[92%] md:w-[min(92vw,660px)] min-[960px]:w-[94%] lg:w-[90%] max-w-6xl grid grid-cols-1 min-[960px]:grid-cols-2 lg:grid-cols-2 rounded-2xl lg:rounded-3xl border border-slate-800/80 bg-[#080e20]/95 shadow-2xl shadow-black/40 overflow-hidden my-auto lg:my-auto tablet-fluid-container tablet-main-grid tablet-no-excess-margin min-h-0"
      >
        
        {/* SIGN-IN FORM: Prominent, fluid width, stacked below marketing on tablet portrait, side-by-side on landscape/desktop */}
        <section
          id="auth-form-section"
          className="w-full min-w-0 max-w-full order-1 min-[768px]:order-2 min-[960px]:col-start-2 relative flex flex-col items-center justify-center p-[clamp(0.75rem,2vw,1.75rem)] tablet-viewport-pad tablet-fluid-section tablet-no-excess-margin overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="w-full min-w-0 max-w-md md:max-w-none lg:max-w-md mx-auto rounded-xl lg:rounded-2xl p-1 sm:p-2.5 lg:p-6 lg:border lg:border-indigo-500/40 lg:bg-[#0c142a]/95 lg:shadow-[0_0_35px_rgba(37,99,235,.08)] tablet-viewport-pad tablet-no-excess-margin"
          >
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                {isSignUp ? 'Start mastering prompt engineering & AI systems' : 'Sign in to continue your AI learning journey'}
              </p>
            </div>

            {resetSuccess && (
              <div className="mt-2.5 sm:mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {/* Quick 1-Click Social Sign In */}
            <div className="mt-3.5 sm:mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
              <button
                type="button"
                id="google-signin-button"
                onClick={() => handleProviderAuth('google')}
                disabled={isSubmitting || socialLoading !== null}
                aria-busy={socialLoading === 'google'}
                className={`group flex min-h-[44px] items-center justify-center gap-2 sm:gap-2.5 rounded-xl border py-2.5 px-2.5 sm:px-3.5 text-xs sm:text-sm font-semibold transition-all duration-150 w-full shadow-sm touch-manipulation min-w-0 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080e20] ${
                  socialLoading === 'google'
                    ? 'border-blue-500/70 bg-blue-950/50 text-blue-200 cursor-wait shadow-[0_0_18px_rgba(59,130,246,0.3)]'
                    : isSubmitting || socialLoading !== null
                    ? 'border-slate-800 bg-slate-900/50 text-slate-500 cursor-not-allowed opacity-50'
                    : 'border-slate-700/80 bg-slate-900/90 text-slate-200 hover:border-slate-500 hover:bg-slate-800/90 active:scale-[0.98] hover:shadow-[0_0_15px_rgba(66,133,244,0.12)]'
                }`}
              >
                {socialLoading === 'google' ? (
                  <span className="relative flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400/80 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-400 animate-pulse shadow-sm shadow-blue-400/50" />
                  </span>
                ) : (
                  <svg
                    className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span className="truncate">
                  {socialLoading === 'google' ? 'Connecting...' : 'Google'}
                </span>
              </button>
              <button
                type="button"
                id="github-signin-button"
                onClick={() => handleProviderAuth('github')}
                disabled={isSubmitting || socialLoading !== null}
                aria-busy={socialLoading === 'github'}
                className={`group flex min-h-[44px] items-center justify-center gap-2 sm:gap-2.5 rounded-xl border py-2.5 px-2.5 sm:px-3.5 text-xs sm:text-sm font-semibold transition-all duration-150 w-full shadow-sm touch-manipulation min-w-0 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080e20] ${
                  socialLoading === 'github'
                    ? 'border-slate-500/70 bg-slate-900 text-slate-100 cursor-wait shadow-[0_0_18px_rgba(255,255,255,0.2)]'
                    : isSubmitting || socialLoading !== null
                    ? 'border-slate-800 bg-slate-900/50 text-slate-500 cursor-not-allowed opacity-50'
                    : 'border-slate-700/80 bg-slate-900/90 text-slate-200 hover:border-slate-500 hover:bg-slate-800/90 active:scale-[0.98] hover:shadow-[0_0_15px_rgba(255,255,255,0.06)]'
                }`}
              >
                {socialLoading === 'github' ? (
                  <span className="relative flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slate-300/80 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white animate-pulse shadow-sm shadow-white/50" />
                  </span>
                ) : (
                  <svg
                    className="h-4 w-4 shrink-0 fill-current text-white transition-transform duration-150 group-hover:scale-105"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                )}
                <span className="truncate">
                  {socialLoading === 'github' ? 'Connecting...' : 'GitHub'}
                </span>
              </button>
            </div>

            <div className="my-3 sm:my-3.5 flex items-center gap-2 text-xs uppercase font-mono tracking-wider text-slate-500">
              <span className="h-px flex-1 bg-slate-800" />
              <span>or with email</span>
              <span className="h-px flex-1 bg-slate-800" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3 sm:space-y-3.5" noValidate>
              {isSignUp && (
                <div className="space-y-1">
                  <label
                    htmlFor="signup-name-input"
                    className={`mb-1 block text-xs sm:text-sm font-medium transition-colors ${
                      fieldErrors.name
                        ? 'text-rose-400 font-semibold'
                        : focusedField === 'name'
                        ? 'text-blue-300 font-semibold'
                        : 'text-slate-300'
                    }`}
                  >
                    Full name
                  </label>
                  <div className="relative group">
                    <svg
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] pointer-events-none transition-colors duration-200 ${
                        fieldErrors.name
                          ? 'text-rose-400'
                          : focusedField === 'name'
                          ? 'text-blue-400'
                          : touched.name && name.trim() && !fieldErrors.name
                          ? 'text-emerald-400'
                          : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      id="signup-name-input"
                      type="text"
                      inputMode="text"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      onFocus={() => handleFocus('name')}
                      onBlur={() => handleBlur('name')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleEmailAuth(e);
                        }
                      }}
                      placeholder="Your name"
                      className={`login-input text-base sm:text-sm py-2.5 sm:py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080e20] ${
                        focusedField === 'name' ? 'is-focused' : ''
                      } ${
                        fieldErrors.name
                          ? 'has-error'
                          : touched.name && name.trim()
                          ? 'is-valid'
                          : ''
                      }`}
                      autoComplete="name"
                      autoCapitalize="words"
                      autoCorrect="off"
                      spellCheck="false"
                      aria-invalid={Boolean(fieldErrors.name)}
                      aria-describedby={fieldErrors.name ? 'name-error-msg' : undefined}
                    />
                  </div>
                  {fieldErrors.name && (
                    <div
                      id="name-error-msg"
                      role="alert"
                      className="mt-1 flex items-start gap-1.5 text-xs text-rose-400 font-medium break-words leading-tight"
                    >
                      <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-rose-400" />
                      <span className="flex-1 break-words">{fieldErrors.name}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label
                  htmlFor="login-email-input"
                  className={`mb-1 block text-xs sm:text-sm font-medium transition-colors ${
                    fieldErrors.email
                      ? 'text-rose-400 font-semibold'
                      : focusedField === 'email'
                      ? 'text-blue-300 font-semibold'
                      : 'text-slate-300'
                  }`}
                >
                  Email address
                </label>
                <div className="relative group">
                  <svg
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] pointer-events-none transition-colors duration-200 ${
                      fieldErrors.email
                        ? 'text-rose-400'
                        : focusedField === 'email'
                        ? 'text-blue-400'
                        : touched.email && email.trim() && !fieldErrors.email
                        ? 'text-emerald-400'
                        : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <input
                    id="login-email-input"
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(event) => handleEmailChange(event.target.value)}
                    onFocus={() => handleFocus('email')}
                    onBlur={() => handleBlur('email')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleEmailAuth(e);
                      }
                    }}
                    placeholder="you@example.com"
                    className={`login-input text-base sm:text-sm py-2.5 sm:py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080e20] ${
                      focusedField === 'email' ? 'is-focused' : ''
                    } ${
                      fieldErrors.email
                        ? 'has-error'
                        : touched.email && email.trim() && !fieldErrors.email
                        ? 'is-valid'
                        : ''
                    }`}
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? 'email-error-msg' : undefined}
                    required
                  />
                </div>
                {fieldErrors.email && (
                  <div
                    id="email-error-msg"
                    role="alert"
                    className="mt-1 flex items-start gap-1.5 text-xs text-rose-400 font-medium break-words leading-tight"
                  >
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-rose-400" />
                    <span className="flex-1 break-words">{fieldErrors.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="login-password-input"
                  className={`mb-1 block text-xs sm:text-sm font-medium transition-colors ${
                    fieldErrors.password
                      ? 'text-rose-400 font-semibold'
                      : focusedField === 'password'
                      ? 'text-blue-300 font-semibold'
                      : 'text-slate-300'
                  }`}
                >
                  Password
                </label>
                <div className="relative group">
                  <svg
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] pointer-events-none transition-colors duration-200 ${
                      fieldErrors.password
                        ? 'text-rose-400'
                        : focusedField === 'password'
                        ? 'text-blue-400'
                        : touched.password && password.length >= 6 && !fieldErrors.password
                        ? 'text-emerald-400'
                        : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="16" r="1" />
                    <rect x="3" y="10" width="18" height="12" rx="2" />
                    <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                  </svg>
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => handlePasswordChange(event.target.value)}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleEmailAuth(e);
                      }
                    }}
                    placeholder="••••••••••••"
                    className={`login-input pr-11 text-base sm:text-sm py-2.5 sm:py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080e20] ${
                      focusedField === 'password' ? 'is-focused' : ''
                    } ${
                      fieldErrors.password
                        ? 'has-error'
                        : touched.password && password.length >= 6
                        ? 'is-valid'
                        : ''
                    }`}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? 'password-error-msg' : undefined}
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 active:scale-95 transition-all touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <div
                    id="password-error-msg"
                    role="alert"
                    className="mt-1 flex items-start gap-1.5 text-xs text-rose-400 font-medium break-words leading-tight"
                  >
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-rose-400" />
                    <span className="flex-1 break-words">{fieldErrors.password}</span>
                  </div>
                )}
              </div>

              {error && (
                <div role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300 flex items-start gap-2 break-words">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-rose-400" />
                  <span className="flex-1">{error}</span>
                </div>
              )}

              {/* Primary Call to Action Button - Direct Tab Target from Password */}
              <button
                type="submit"
                id="primary-auth-submit-btn"
                disabled={isSubmitting || socialLoading !== null}
                aria-busy={isSubmitting}
                className="flex w-full min-h-[46px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm sm:text-base font-bold text-white shadow-lg shadow-blue-900/30 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-wait disabled:opacity-75 disabled:hover:brightness-100 mt-1.5 select-none touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080e20]"
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

              {!isSignUp && (
                <div className="flex flex-wrap items-center justify-between gap-y-1.5 gap-x-2 text-xs sm:text-sm pt-1">
                  <label
                    htmlFor="login-remember-me-checkbox"
                    className="group inline-flex items-center gap-2 py-1 pr-2 rounded-lg text-slate-300 hover:text-slate-100 cursor-pointer select-none transition-colors touch-manipulation"
                  >
                    <input
                      id="login-remember-me-checkbox"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => handleRememberMeChange(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080e20] transition cursor-pointer accent-blue-500"
                    />
                    <span className="font-medium text-xs sm:text-sm">Remember me</span>
                  </label>
                  <button
                    type="button"
                    id="forgot-password-button"
                    onClick={openForgotPasswordModal}
                    className="inline-flex items-center py-1 px-1 text-blue-400 hover:text-blue-300 font-medium underline-offset-2 hover:underline transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 focus-visible:ring-offset-[#080e20] rounded"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </form>

            <p className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-slate-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setFieldErrors({});
                  setTouched({});
                  setResetSuccess('');
                }}
                className="font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-2 ml-1 py-1 px-1 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 focus-visible:ring-offset-[#080e20] rounded"
              >
                {isSignUp ? 'Sign in' : 'Create an account'}
              </button>
            </p>
          </motion.div>
        </section>

        {/* MARKETING CONTENT: Displayed with responsive flexbox and CSS grid layouts */}
        <section
          id="marketing-info-section"
          className="flex order-2 min-[768px]:order-1 min-[960px]:col-start-1 relative flex-col justify-between md:justify-center lg:justify-between overflow-hidden p-[clamp(0.75rem,2vw,2rem)] tablet-viewport-pad tablet-fluid-section tablet-no-excess-margin border-t min-[768px]:border-t-0 min-[768px]:border-b min-[960px]:border-b-0 min-[960px]:border-r border-slate-800/60 min-w-0 max-w-full gap-[clamp(0.5rem,1.5vw,1rem)]"
        >
          <div className="pointer-events-none absolute -bottom-32 -left-10 h-[clamp(14rem,28vw,22rem)] w-[clamp(14rem,28vw,22rem)] max-w-full rounded-full bg-blue-600/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full opacity-50 [background-image:linear-gradient(135deg,transparent_45%,rgba(37,99,235,.3)_46%,transparent_47%),linear-gradient(45deg,transparent_45%,rgba(124,58,237,.25)_46%,transparent_47%)] [background-size:38px_38px]" />

          {/* Desktop/Tablet brand banner */}
          <div className="hidden md:flex relative z-10 items-center gap-[clamp(0.5rem,1vw,0.75rem)]">
            <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl border border-blue-400/50 bg-blue-950/60 shadow-lg shadow-blue-950/50">
              <WandSparkles className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold tracking-tight text-slate-100 text-sm md:text-base">Ecorp Academy</p>
              <p className="text-[10px] md:text-xs text-slate-400">Prompt Engineering &amp; AI Systems</p>
            </div>
          </div>

          <div className="relative z-10 w-full min-w-0 max-w-full flex flex-col gap-[clamp(0.25rem,0.8vw,0.625rem)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-2.5 py-1 text-[11px] sm:text-xs md:text-xs font-medium text-blue-300 w-fit">
              <Sparkles className="h-3 w-3 shrink-0" />
              <span>Interactive AI Academy</span>
            </div>
            <h2 className="text-base sm:text-xl md:text-[clamp(1.15rem,2vw,1.4rem)] lg:text-3xl font-bold leading-snug tracking-tight text-slate-100 tablet-title">
              Master the Architecture of<br className="hidden sm:inline" />{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Large Language Models
              </span>
            </h2>
            <p className="text-xs sm:text-sm md:text-[clamp(0.75rem,1.2vw,0.875rem)] lg:text-sm leading-relaxed text-slate-400 w-full tablet-subtitle">
              Join thousands of developers and AI practitioners mastering prompt engineering, system design, and production workflows with real-time sandbox feedback.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 min-[768px]:grid-cols-2 tablet-card-grid gap-[clamp(0.35rem,1vw,0.65rem)] w-full">
              {[
                {
                  icon: BookOpen,
                  title: 'Interactive Lessons',
                  detail: 'Step-by-step modules with verified formulas',
                  color: 'text-blue-400 bg-blue-500/10',
                },
                {
                  icon: Code2,
                  title: 'Production Patterns',
                  detail: 'Chain-of-thought, ReAct & RAG frameworks',
                  color: 'text-emerald-400 bg-emerald-500/10',
                },
                {
                  icon: WandSparkles,
                  title: 'Live AI Sandbox',
                  detail: 'Instant evaluation and benchmark metrics',
                  color: 'text-purple-400 bg-purple-500/10',
                },
                {
                  icon: Trophy,
                  title: 'Graded Missions',
                  detail: 'Verified skill certificates & mastery XP',
                  color: 'text-amber-400 bg-amber-500/10',
                },
              ].map(({ icon: Icon, title, detail, color }) => (
                <div key={title} className="tablet-feature-card flex items-center gap-2.5 rounded-xl bg-slate-900/60 p-2 sm:p-2.5 border border-slate-800/70 min-w-0 transition-colors hover:border-slate-700/80">
                  <div className={`flex h-8 w-8 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-lg ${color}`}>
                     <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm md:text-sm font-semibold text-slate-200 truncate">{title}</p>
                    <p className="text-[11px] md:text-xs text-slate-400 leading-tight line-clamp-2">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block relative z-10 pt-2 lg:pt-4 border-t border-slate-800/60 text-[11px] md:text-xs text-slate-500">
            <span>Trusted by builders learning modern AI orchestration</span>
          </div>
        </section>
      </motion.div>

      {/* Footer Features Bar: Fluid 2x2 grid on tablet (768px-1024px), single stack on mobile, 4-item horizontal on large desktop */}
      <footer
        id="login-footer-feature-statistics"
        className="mx-auto w-[94%] sm:w-[92%] md:w-[min(92vw,660px)] min-[960px]:w-[94%] lg:w-[90%] max-w-6xl grid grid-cols-1 sm:grid-cols-2 min-[768px]:grid-cols-2 lg:flex lg:flex-row lg:items-center lg:justify-between gap-[clamp(0.4rem,1.2vw,0.75rem)] lg:gap-6 py-2 sm:py-3 lg:py-5 text-xs text-center px-0 tablet-no-excess-margin tablet-footer-fluid shrink-0"
      >
        {FOOTER_FEATURES.map((feat, index) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.text}
              className="w-full lg:w-auto relative group overflow-hidden rounded-xl p-[1px] transition-all duration-300 hover:scale-[1.02] shadow-sm shadow-black/30 shrink-0"
            >
              {/* Baseline subtle dark border */}
              <div className="absolute inset-0 rounded-xl border border-slate-800/70 pointer-events-none" />

              {/* Rotating Gradient Border Beam */}
              <div
                className="absolute inset-[-150%] animate-rotate-border pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: feat.gradient,
                  animationDelay: `${index * -1.1}s`,
                  willChange: 'transform',
                }}
              />

              {/* Inner Content Badge with comfortable tablet font size */}
              <div className="relative z-10 flex h-full w-full items-center justify-center gap-2.5 rounded-[11px] bg-[#070d1e]/95 py-2.5 px-3 md:px-4 lg:px-5 backdrop-blur-md">
                <Icon className={`h-4 w-4 md:h-4.5 md:w-4.5 ${feat.iconColor} shrink-0`} />
                <span className="text-slate-300 text-xs md:text-sm whitespace-nowrap leading-none">
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
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto min-h-dvh"
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
              className="w-full max-w-md rounded-2xl border border-slate-800/90 bg-[#080e20] p-5 sm:p-7 shadow-2xl shadow-blue-950/40 text-slate-100 relative my-auto min-h-0"
            >
              {/* Close Button */}
              <button
                type="button"
                id="close-forgot-password-modal"
                onClick={closeForgotPasswordModal}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800/80 hover:text-slate-100 transition-colors touch-manipulation"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              {!forgotSuccess ? (
                <div>
                  {/* Modal Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-sm">
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 id="forgot-password-title" className="text-base sm:text-lg font-bold text-slate-100">
                        Reset Password
                      </h3>
                      <p className="text-xs text-slate-400">
                        We'll send you an email with a link to reset your password.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSendPasswordReset} className="space-y-4" noValidate>
                    <div className="space-y-1">
                      <label
                        htmlFor="forgot-password-email-input"
                        className="block text-xs sm:text-sm font-medium text-slate-300"
                      >
                        Account email address
                      </label>
                      <div className="relative group">
                        {/* Color-matched Mail SVG icon inside left padding */}
                        <svg
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] pointer-events-none transition-colors duration-200 ${
                            forgotEmailError
                              ? 'text-rose-400'
                              : forgotEmail.trim()
                              ? 'text-blue-400'
                              : 'text-slate-400 group-hover:text-slate-300'
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect width="20" height="16" x="2" y="4" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        <input
                          id="forgot-password-email-input"
                          type="email"
                          inputMode="email"
                          value={forgotEmail}
                          onChange={(e) => {
                            setForgotEmail(e.target.value);
                            if (forgotEmailError) setForgotEmailError('');
                            if (forgotError) setForgotError('');
                          }}
                          placeholder="you@example.com"
                          className={`login-input text-base sm:text-sm py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080e20] ${
                            forgotEmailError ? 'has-error' : ''
                          }`}
                          autoComplete="email"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck="false"
                          aria-invalid={Boolean(forgotEmailError)}
                          aria-describedby={forgotEmailError ? 'forgot-email-error-msg' : undefined}
                          autoFocus
                          required
                        />
                      </div>
                      {forgotEmailError && (
                        <div
                          id="forgot-email-error-msg"
                          role="alert"
                          className="mt-1 flex items-start gap-1.5 text-xs text-rose-400 font-medium break-words leading-tight"
                        >
                          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-rose-400" />
                          <span className="flex-1">{forgotEmailError}</span>
                        </div>
                      )}
                    </div>

                    {forgotError && (
                      <div
                        role="alert"
                        className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300 flex items-start gap-2 break-words"
                      >
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-rose-400" />
                        <span className="flex-1">{forgotError}</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                      <button
                        type="submit"
                        id="submit-password-reset-btn"
                        disabled={isForgotSubmitting}
                        aria-busy={isForgotSubmitting}
                        className="flex w-full sm:flex-1 min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 px-4 text-sm font-bold text-white shadow-lg shadow-blue-900/30 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-wait disabled:opacity-75 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080e20]"
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
                        className="w-full sm:w-auto min-h-[44px] rounded-xl border border-slate-800 bg-slate-900/70 hover:bg-slate-800/80 px-4 py-2.5 text-sm font-medium text-slate-300 transition active:scale-[0.99] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080e20]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="text-center py-2">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-sm">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-1.5">
                    Check your inbox
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                    We sent a password reset link to{' '}
                    <strong className="text-blue-300 font-semibold">{forgotEmail}</strong>. Follow the instructions in the email to set a new password.
                  </p>
                  <p className="text-[11px] text-slate-500 mb-5">
                    Didn't receive the email? Check your spam folder or wait a moment to try again.
                  </p>
                  <button
                    type="button"
                    id="back-to-signin-after-reset-btn"
                    onClick={closeForgotPasswordModal}
                    className="w-full min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 py-2.5 px-4 text-sm font-semibold transition active:scale-[0.99] touch-manipulation"
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
