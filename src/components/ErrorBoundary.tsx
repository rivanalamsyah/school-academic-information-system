import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  /** Optional label for logging context (e.g. "Dashboard", "PublicWebsite") */
  context?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Production-grade React Error Boundary.
 * Catches unhandled JS errors in child component trees and renders a friendly fallback UI.
 * Usage: wrap page-level or feature-level components that may throw.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console in dev; in production wire this to a monitoring service (Sentry, etc.)
    const ctx = this.props.context ?? "Unknown";
    console.error(`[ErrorBoundary][${ctx}] Uncaught error:`, error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center"
        >
          <div className="max-w-md w-full bg-white border border-red-100 rounded-2xl shadow-lg p-8 space-y-5">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-800">Terjadi Kesalahan</h2>
              <p className="text-sm text-slate-500">
                Halaman ini mengalami kesalahan yang tidak terduga. Tim teknis telah diberitahu.
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-3 text-left">
                  <summary className="text-xs text-red-500 cursor-pointer font-mono hover:underline">
                    Detail error (dev only)
                  </summary>
                  <pre className="mt-2 text-xs text-red-700 bg-red-50 p-3 rounded-lg overflow-auto max-h-40 whitespace-pre-wrap">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all"
              >
                Muat Ulang Halaman
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
