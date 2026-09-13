import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  Flame,
  Clock,
  BookOpen,
  Terminal,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  ShieldAlert,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  evaluateLearnerInactivity,
  dismissReminderForToday,
  snoozeReminder,
  requestNotificationPermission,
  sendNativeSystemReminder,
  getNotificationPermissionStatus,
  resetReminderMuteState,
} from "../lib/reminderNotificationService";

export const LearnerInactivityReminder: React.FC = () => {
  const { userProgress, resumeCurriculum, setActiveTab, openSandbox } = useApp();
  const [isVisible, setIsVisible] = useState(false);
  const [missedDays, setMissedDays] = useState(1);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("default");
  const [isEnablingNative, setIsEnablingNative] = useState(false);
  const [hasEnabledNativeSuccess, setHasEnabledNativeSuccess] = useState(false);

  // Check inactivity on mount and when userProgress updates
  useEffect(() => {
    setNotificationPermission(getNotificationPermissionStatus());

    const evalResult = evaluateLearnerInactivity(
      userProgress.lastActivityDate,
      userProgress.loginHistory
    );

    if (evalResult.shouldShowReminder) {
      setMissedDays(evalResult.missedDaysCount || 1);
      // Slight delay so it doesn't collide with initial page load
      const timer = setTimeout(() => {
        setIsVisible(true);
        // If native notifications granted, also send system push
        if (evalResult.permissionStatus === "granted") {
          sendNativeSystemReminder(
            "🔥 Ecorp Prompt Academy: Missed Practice",
            `You missed learning for ${evalResult.missedDaysCount || 1} day! Jump in to protect your ${userProgress.streakDays}-day streak.`
          );
        }
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [userProgress.lastActivityDate, userProgress.loginHistory, userProgress.streakDays]);

  // Global event listener to manually test or trigger the reminder
  useEffect(() => {
    const handleManualTest = (e: Event) => {
      const customEvent = e as CustomEvent<{ days?: number }>;
      setMissedDays(customEvent.detail?.days || 1);
      resetReminderMuteState();
      setIsVisible(true);
    };

    window.addEventListener("ecorp:trigger-reminder-test", handleManualTest);
    return () => window.removeEventListener("ecorp:trigger-reminder-test", handleManualTest);
  }, []);

  const handleDismiss = () => {
    dismissReminderForToday();
    setIsVisible(false);
  };

  const handleSnooze = (hours = 2) => {
    snoozeReminder(hours);
    setIsVisible(false);
  };

  const handleResumeLearning = () => {
    setIsVisible(false);
    dismissReminderForToday();
    if (resumeCurriculum) {
      resumeCurriculum();
    } else {
      setActiveTab("curriculum");
    }
  };

  const handleQuickSandbox = () => {
    setIsVisible(false);
    dismissReminderForToday();
    if (openSandbox) {
      openSandbox("sandbox");
    } else {
      setActiveTab("playground");
    }
  };

  const handleEnablePushNotifications = async () => {
    setIsEnablingNative(true);
    const granted = await requestNotificationPermission();
    setIsEnablingNative(false);
    if (granted) {
      setNotificationPermission("granted");
      setHasEnabledNativeSuccess(true);
      sendNativeSystemReminder(
        "✨ Push Notifications Activated!",
        "Ecorp Academy will keep you updated if you miss a daily prompt practice."
      );
      setTimeout(() => setHasEnabledNativeSuccess(false), 4000);
    } else {
      setNotificationPermission(getNotificationPermissionStatus());
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <aside
          aria-label="Daily learning streak reminder"
          className="fixed top-3 sm:top-5 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-md z-50 pointer-events-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="rounded-2xl border border-amber-500/40 bg-slate-950/95 p-4 sm:p-5 shadow-2xl shadow-amber-950/30 backdrop-blur-xl text-slate-100 relative overflow-hidden"
          >
            {/* Top Accent Warning Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

            {/* Header: App Brand + Push Notification Badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Flame className="h-4 w-4 fill-amber-500 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                      Streak Alert
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Smartphone className="h-3 w-3" />
                      Mobile Reminder
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {missedDays === 1 ? "You missed learning yesterday!" : `Missed ${missedDays} days of practice!`}
                  </h3>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title="Dismiss for today"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Motivational Body Message */}
            <div className="space-y-2 mb-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Consistency is key to mastering prompt architectures. Complete 1 quick lesson or sandbox challenge to protect your{" "}
                <span className="font-bold text-amber-400 font-mono">
                  {userProgress.streakDays}-day streak
                </span>{" "}
                and collect a <span className="font-semibold text-emerald-400">+50 XP</span> activity bonus.
              </p>

              {/* Native Push Notification Opt-in Prompt */}
              {notificationPermission !== "granted" && notificationPermission !== "unsupported" && (
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Bell className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>Get mobile phone alerts</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleEnablePushNotifications}
                    disabled={isEnablingNative}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] transition-colors shrink-0 disabled:opacity-50"
                  >
                    {isEnablingNative ? "Enabling..." : "Enable"}
                  </button>
                </div>
              )}

              {hasEnabledNativeSuccess && (
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-950/60 border border-emerald-800 text-[11px] text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Mobile push notifications enabled!</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleResumeLearning}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 py-2 px-3 text-xs font-bold text-white shadow-md shadow-orange-950/40 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Resume Active Lesson (+50 XP)</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickSandbox}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 py-1.5 px-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Terminal className="h-3 w-3 text-blue-400" />
                  <span>3-Min Sandbox</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSnooze(2)}
                  className="flex items-center justify-center gap-1 rounded-xl border border-slate-800 bg-slate-900/90 py-1.5 px-3 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  title="Remind me in 2 hours"
                >
                  <Clock className="h-3 w-3" />
                  <span>Snooze 2h</span>
                </button>
              </div>
            </div>
          </motion.div>
        </aside>
      )}
    </AnimatePresence>
  );
};
