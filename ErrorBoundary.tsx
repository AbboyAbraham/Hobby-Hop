import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6 text-center">
          <div className="glass-card p-8 rounded-2xl max-w-md">
            <h1 className="text-2xl font-bold mb-4 text-teal-400">Hold Up!</h1>
            <p className="text-slate-300 mb-6">
              Something went wrong behind the scenes. Our hobby-scouting AI might be taking a quick nap.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg font-medium transition-colors"
            >
              Try Refreshing
            </button>
          </div>
        </div>
      );
    }

    return this.children;
  }
}
export default ErrorBoundary;
