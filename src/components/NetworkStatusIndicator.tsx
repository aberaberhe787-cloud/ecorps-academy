import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wifi,
  WifiOff,
  CheckCircle2,
  RefreshCw,
  X,
  ShieldCheck,
  Loader2,
  HardDrive
} from "lucide-react";
import { useApp } from "../context/AppContext";

/**
 * Compact status badge for the Navbar / Header
 */
export const NetworkStatusBadge: React.FC<{ onOpenDetails?: () => void }> = ({ onOpenDetails }) => {
  const { isOnline, persistenceStatus, retrySync } = useApp();
  const [isRetrying, setIsRetrying] = useState(false);

  const isOffline = !isOnline || persistenceStatus === "offline";
  const isSaving = persistenceStatus === "saving";

  const handleRetry = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRetrying(true);
    try {
      await retrySync();
    } finally {
      setIsRetrying(false);
    }
  };

  if (isOffline) {
    return (
      <button
        id="network-status-offline-badge"
        onClick={onOpenDetails || handleRetry}
        title="Offline Mode Active: Your progress is safely stored locally and will sync when you reconnect"
        aria-label="Offline mode active, progress saved locally"
        className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>
        <WifiOff className="h-3.5 w-3.5 text-amber-400 shrink-0" />
        <span className="hidden sm:inline font-mono text-[11px] font-semibold tracking-tight">
          Offline • Saved Locally
        </span>
        <span className="sm:hidden font-mono text-[11px]">Offline</span>
      </button>
    );
  }

  if (isSaving) {
    return (
      <div
        id="network-status-saving-badge"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 border border-blue-500/20 text-blue-400"
        title="Syncing progress to cloud..."
      >
        <Loader2 className="h-3 w-3 animate-spin text-blue-400 shrink-0" />
        <span className="hidden md:inline font-mono text-[11px]">Syncing...</span>
      </div>
    );
  }

  // When online & synced: return subtle reassurance pill (on desktop)
  return (
    <div
      id="network-status-synced-badge"
      className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono text-slate-400 hover:text-emerald-400 transition-colors"
      title="All progress synced with cloud"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      <span className="text-[10px] tracking-tight">Cloud Synced</span>
    </div>
  );
};

/**
 * Floating Toast Notification informing users of connectivity loss
 * and reassuring them that progress data loss is prevented.
 */
export const NetworkStatusToast: React.FC = () => {
  const { isOnline, persistenceStatus, retrySync } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const previousOnlineRef = useRef<boolean>(isOnline);

  const isOffline = !isOnline || persistenceStatus === "offline";

  // Watch for transitions from offline -> online
  useEffect(() => {
    if (previousOnlineRef.current === false && isOnline === true) {
      // User came back online!
      setShowRestoredNotice(true);
      setIsDismissed(false);

      const timer = window.setTimeout(() => {
        setShowRestoredNotice(false);
      }, 4500);

      return () => window.clearTimeout(timer);
    }
    previousOnlineRef.current = isOnline;
  }, [isOnline]);

  // When going offline, re-open the toast if it was dismissed previously
  useEffect(() => {
    if (isOffline) {
      setIsDismissed(false);
    }
  }, [isOffline]);

  const handleManualCheck = async () => {
    setIsRetrying(true);
    try {
      await retrySync();
    } finally {
      setIsRetrying(false);
    }
  };

  // Determine what to display
  const isVisible = (isOffline && !isDismissed) || showRestoredNotice;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="network-connectivity-toast"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-4 right-4 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] pointer-events-auto"
        >
          {showRestoredNotice ? (
            /* CONNECTION RESTORED NOTICE */
            <div className="rounded-2xl border border-emerald-500/40 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur-xl dark:border-emerald-500/40 dark:bg-slate-900/95">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-emerald-300">
                      Internet Connection Restored
                    </h4>
                    <button
                      onClick={() => setShowRestoredNotice(false)}
                      className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                      aria-label="Dismiss toast"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    You are back online. All offline progress, completed lessons, and earned XP have been securely synchronized to the cloud.
                  </p>
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>All changes safely synced</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* OFFLINE WARNING & PROTECTION NOTICE */
            <div className="rounded-2xl border border-amber-500/50 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur-xl dark:border-amber-500/40 dark:bg-slate-900/95 ring-1 ring-amber-500/20">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mt-0.5">
                  <WifiOff className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-amber-300">
                        Internet Connection Lost
                      </h4>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <HardDrive className="h-2.5 w-2.5" /> Local Save Active
                      </span>
                    </div>
                    <button
                      id="dismiss-offline-toast-btn"
                      onClick={() => setIsDismissed(true)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
                      aria-label="Dismiss toast"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                    You are currently offline. Don’t worry — <strong>no progress will be lost</strong>. Your completed lessons, mission submissions, and XP are securely cached on this device and will automatically sync once reconnected.
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>Auto-sync when back online</span>
                    </div>

                    <button
                      id="retry-network-sync-btn"
                      onClick={handleManualCheck}
                      disabled={isRetrying}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm disabled:opacity-60"
                    >
                      <RefreshCw className={`h-3 w-3 ${isRetrying ? "animate-spin" : ""}`} />
                      <span>{isRetrying ? "Checking..." : "Check Connection"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
