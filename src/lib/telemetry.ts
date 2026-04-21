import * as Sentry from "@sentry/nextjs";

type LogLevel = "info" | "warning" | "error" | "debug";

/**
 * Unified Telemetry Utility
 * Bridges Vercel application events with Sentry monitoring.
 * Use this to log important "Breadcrumbs" or manual events.
 */
export const Audit = {
  /**
   * Log an informational event. This creates a breadcrumb in Sentry.
   */
  log: (message: string, level: LogLevel = "info", data?: Record<string, any>) => {
    Sentry.addBreadcrumb({
      category: "audit",
      message: message,
      level: level,
      data: data,
    });
    
    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Audit:${level.toUpperCase()}] ${message}`, data || "");
    }
  },

  /**
   * Manually capture an exception with extra context.
   */
  error: (error: any, context?: Record<string, any>) => {
    Sentry.captureException(error, {
      extra: context,
    });
    
    if (process.env.NODE_ENV === "development") {
      console.error("[Audit:ERROR]", error, context);
    }
  },

  /**
   * Send a specific message to Sentry without a full crash.
   */
  notify: (message: string, data?: Record<string, any>) => {
    Sentry.captureMessage(message, {
      extra: data,
    });
  }
};
