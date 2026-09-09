/**
 * Robust Error Handling & Fetch Wrapper for All API Calls
 * 
 * Provides centralized error interception, idle/resume detection (for users resuming
 * their page after leaving it open for several hours), automatic cold-start recovery,
 * and user-friendly toast notifications routed through NetworkStatusToast.
 */

export interface ApiErrorInfo {
  id: string;
  status: number; // 405, 500, 502, 503, 504, 0 (network)
  title: string;
  message: string;
  url?: string;
  timestamp: number;
  isResumeRelated?: boolean;
  retry?: () => Promise<any> | void;
}

export interface RobustFetchOptions extends RequestInit {
  /** Optional custom retry callback */
  onRetry?: () => Promise<any> | void;
  /** Whether to suppress toast notifications for this specific call (default false) */
  silent?: boolean;
  /** Custom error message override */
  customErrorMessage?: string;
  /** Auto-retry once on 500/502/503/504 or 405 cold start (default: true) */
  autoRetryOnce?: boolean;
  /** Internal recursion guard */
  __isRobustWrapped?: boolean;
}

// Event names for loose coupling between API calls and the NetworkStatusToast component
const API_ERROR_EVENT = "ecorp:api-error";
const API_CLEAR_EVENT = "ecorp:api-clear";

// State tracking for user idle and page resumption
let lastVisibleTime = Date.now();
let lastUserInteractionTime = Date.now();
let resumeDetectedTime = 0;

// 15 minutes threshold for considering the page as "resumed after long idle/hours"
const LONG_IDLE_THRESHOLD_MS = 15 * 60 * 1000;
// 2 minutes window where subsequent errors are attributed to page resumption
const RESUME_GRACE_WINDOW_MS = 2 * 60 * 1000;

if (typeof window !== "undefined") {
  const onVisibilityChange = () => {
    const now = Date.now();
    if (document.visibilityState === "visible") {
      const elapsedFromVisible = now - lastVisibleTime;
      const elapsedFromInteraction = now - lastUserInteractionTime;
      
      // If tab was hidden or user inactive for more than 15 minutes (e.g. several hours)
      if (elapsedFromVisible >= LONG_IDLE_THRESHOLD_MS || elapsedFromInteraction >= LONG_IDLE_THRESHOLD_MS) {
        resumeDetectedTime = now;
      }
      lastVisibleTime = now;
    } else {
      lastVisibleTime = now;
    }
  };

  const onActivity = () => {
    lastUserInteractionTime = Date.now();
  };

  window.addEventListener("visibilitychange", onVisibilityChange, { passive: true });
  window.addEventListener("focus", onVisibilityChange, { passive: true });
  window.addEventListener("pageshow", onVisibilityChange, { passive: true });
  window.addEventListener("online", () => {
    resumeDetectedTime = Date.now();
  });

  const activityEvents = ["mousedown", "keydown", "touchstart", "scroll"];
  activityEvents.forEach((evt) => {
    window.addEventListener(evt, onActivity, { passive: true });
  });
}

/**
 * Checks whether the page was recently resumed after a long idle period (several hours or >15m).
 */
export function isPageResumedAfterLongIdle(): boolean {
  if (typeof window === "undefined") return false;
  const now = Date.now();
  if (resumeDetectedTime > 0 && now - resumeDetectedTime < RESUME_GRACE_WINDOW_MS) {
    return true;
  }
  const timeSinceInteraction = now - lastUserInteractionTime;
  if (timeSinceInteraction > LONG_IDLE_THRESHOLD_MS) {
    return true;
  }
  return false;
}

/**
 * Dispatches an API error notice to be displayed by NetworkStatusToast.
 */
export function notifyApiError(errorInfo: Omit<ApiErrorInfo, "id" | "timestamp">): void {
  if (typeof window === "undefined") return;
  const detail: ApiErrorInfo = {
    ...errorInfo,
    id: "api_err_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    timestamp: Date.now(),
  };
  window.dispatchEvent(new CustomEvent(API_ERROR_EVENT, { detail }));
}

/**
 * Clears any active API error notice from NetworkStatusToast.
 */
export function clearApiError(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(API_CLEAR_EVENT));
}

/**
 * Subscribes NetworkStatusToast to API error events.
 */
export function subscribeToApiErrors(callback: (err: ApiErrorInfo | null) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onError = (e: Event) => {
    const customEvent = e as CustomEvent<ApiErrorInfo>;
    callback(customEvent.detail);
  };
  const onClear = () => {
    callback(null);
  };

  window.addEventListener(API_ERROR_EVENT, onError);
  window.addEventListener(API_CLEAR_EVENT, onClear);

  return () => {
    window.removeEventListener(API_ERROR_EVENT, onError);
    window.removeEventListener(API_CLEAR_EVENT, onClear);
  };
}

/**
 * Formats a friendly title and explanation for 405, 500, or network errors,
 * with special understanding of page resumption after hours of idle time.
 */
export function formatApiErrorMessage(
  status: number,
  _url: string,
  serverMessage?: string
): { title: string; message: string } {
  const isResumed = isPageResumedAfterLongIdle();

  if (status === 405) {
    if (isResumed) {
      return {
        title: "Session Resumed – Reconnecting Route",
        message: "You resumed this page after an extended period of inactivity. The serverless route went idle (HTTP 405). Please retry your request to re-establish the connection.",
      };
    }
    return {
      title: "API Routing Notice (405)",
      message: serverMessage || "The server rejected this request method. The route may be updating or deploying. Please retry in a moment.",
    };
  }

  if (status === 500) {
    if (isResumed) {
      return {
        title: "Session Resumed – Server Warming Up",
        message: "You returned to this page after several hours. The execution server is warming up from idle sleep (HTTP 500). Please retry in a few moments — your prompts and progress are safe.",
      };
    }
    return {
      title: "Server Temporarily Unavailable (500)",
      message: serverMessage || "The AI server encountered a temporary internal error. Please retry in a moment.",
    };
  }

  if (status === 502 || status === 503 || status === 504) {
    if (isResumed) {
      return {
        title: "Session Resumed – Gateway Reconnecting",
        message: `The server gateway is waking up after being idle (HTTP ${status}). Please click Retry in a moment.`,
      };
    }
    return {
      title: "Server Reconnecting",
      message: `The backend service is temporarily restarting (HTTP ${status}). Please retry in a few seconds.`,
    };
  }

  if (status === 0) {
    if (isResumed) {
      return {
        title: "Reconnecting Network",
        message: "Your device network connection is recovering after the page was inactive. Please retry once reconnected.",
      };
    }
    return {
      title: "Network Connection Error",
      message: "Unable to reach the server. Please check your internet connection and try again.",
    };
  }

  return {
    title: `Request Notice (HTTP ${status})`,
    message: serverMessage || "An unexpected error occurred while communicating with the server. Please retry.",
  };
}

// Store pristine reference to environment's native fetch implementation
const nativeFetch: typeof fetch = (function () {
  if (typeof window !== "undefined" && typeof window.fetch === "function") {
    try {
      return window.fetch.bind(window);
    } catch {
      return window.fetch;
    }
  }
  return typeof fetch === "function" ? fetch : (() => Promise.reject(new Error("fetch is not supported")));
})();

/**
 * Robust fetch wrapper that intercepts 405, 500, or network drops,
 * manages idle-resume cold-start recovery, and triggers user-friendly
 * toast notifications through NetworkStatusToast.
 */
export async function robustApiFetch(
  input: RequestInfo | URL,
  init?: RobustFetchOptions
): Promise<Response> {
  const url = typeof input === "string" ? input : (input instanceof Request ? input.url : input.toString());
  const isApiCall = url.includes("/api/") || url.startsWith("/api");

  const attemptFetch = async (): Promise<Response> => {
    const fetchOptions: RequestInit = { ...init };
    delete (fetchOptions as any).__isRobustWrapped;
    delete (fetchOptions as any).autoRetryOnce;
    delete (fetchOptions as any).silent;
    delete (fetchOptions as any).onRetry;
    delete (fetchOptions as any).customErrorMessage;
    return await nativeFetch(input, fetchOptions);
  };

  try {
    let response = await attemptFetch();

    // Catch 405 (Method Not Allowed) and 500+ (Internal Server Error, Gateway errors)
    if (isApiCall && (response.status === 405 || response.status >= 500)) {
      const isResumed = isPageResumedAfterLongIdle();
      const shouldAutoRetry = init?.autoRetryOnce !== false && (isResumed || response.status >= 500);

      // Auto-retry once on cold start or idle resume to transparently recover if possible
      if (shouldAutoRetry && !init?.signal?.aborted) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        try {
          const retryResponse = await attemptFetch();
          if (retryResponse.ok || (retryResponse.status !== 405 && retryResponse.status < 500)) {
            clearApiError();
            return retryResponse;
          }
          response = retryResponse;
        } catch {
          // If the auto-retry itself threw a network exception, proceed with toast notification below
        }
      }

      // If still error, display user-friendly toast notification via NetworkStatusToast
      if (!init?.silent) {
        let serverMessage: string | undefined;
        try {
          const cloned = response.clone();
          const text = await cloned.text();
          if (text) {
            try {
              const json = JSON.parse(text);
              serverMessage = json.error || json.message;
            } catch {
              if (text.length < 150 && !text.includes("<html")) {
                serverMessage = text;
              }
            }
          }
        } catch {}

        const formatted = formatApiErrorMessage(response.status, url, serverMessage);
        notifyApiError({
          status: response.status,
          title: formatted.title,
          message: formatted.message,
          url,
          isResumeRelated: isResumed,
          retry: init?.onRetry || (() => robustApiFetch(input, { ...init, autoRetryOnce: false })),
        });
      }
    } else if (response.ok && isApiCall) {
      // Clear any prior error toast when an API call succeeds
      clearApiError();
    }

    return response;
  } catch (err: any) {
    if (err?.name === "AbortError" || init?.signal?.aborted) {
      throw err;
    }

    if (isApiCall && !init?.silent) {
      const isResumed = isPageResumedAfterLongIdle();
      const formatted = formatApiErrorMessage(0, url, err?.message);
      notifyApiError({
        status: 0,
        title: formatted.title,
        message: formatted.message,
        url,
        isResumeRelated: isResumed,
        retry: init?.onRetry || (() => robustApiFetch(input, { ...init, autoRetryOnce: false })),
      });
    }

    throw err;
  }
}

/**
 * Safely attempts to register a transparent global fetch interceptor if the runtime environment allows it.
 * If the environment defines window.fetch as getter-only or read-only, it falls back cleanly without error.
 */
export function initGlobalApiFetchInterceptor(): void {
  if (typeof window === "undefined") return;
  const globalAny = window as any;
  if (globalAny.__ecorp_api_fetch_intercepted__) return;

  try {
    const original = globalAny.__ecorp_original_fetch__ || window.fetch.bind(window);
    globalAny.__ecorp_original_fetch__ = original;

    const wrappedFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === "string" ? input : (input instanceof Request ? input.url : input.toString());
      if ((url.startsWith("/api/") || url.includes("/api/")) && !(init as any)?.__isRobustWrapped) {
        return robustApiFetch(input, { ...init, __isRobustWrapped: true } as any);
      }
      return original(input, init);
    };

    // Attempt assignment via descriptor or direct property assignment safely
    let assigned = false;
    try {
      Object.defineProperty(window, "fetch", {
        value: wrappedFetch,
        writable: true,
        configurable: true,
      });
      assigned = true;
    } catch {
      try {
        window.fetch = wrappedFetch;
        assigned = true;
      } catch {
        // window.fetch is getter-only or locked by browser sandbox; fallback safely
        assigned = false;
      }
    }

    if (assigned) {
      globalAny.__ecorp_api_fetch_intercepted__ = true;
    }
  } catch {
    // Graceful fallback - direct calls to robustApiFetch remain active and fully functional
  }
}

// Safely attempt initialization if environment allows
if (typeof window !== "undefined") {
  try {
    initGlobalApiFetchInterceptor();
  } catch {}
}
