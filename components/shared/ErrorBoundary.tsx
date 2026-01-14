
import React, { ErrorInfo, ReactNode } from 'react';
import Card from './Card';
import Button from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-midnight">
          <Card className="max-w-md w-full border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.2)]">
            <div className="p-8 text-center">
              <div className="mb-6 inline-block p-4 rounded-full bg-red-900/20 border border-red-500/40">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-cinzel font-bold text-amber-100 mb-2">
                Cosmic Interference
              </h2>
              
              <p className="text-amber-200/60 font-lora mb-6">
                The stars are momentarily misaligned. We encountered an unexpected error in the mystical fabric.
              </p>

              <div className="bg-black/40 p-3 rounded mb-6 text-xs text-red-300 font-mono text-left overflow-auto max-h-32">
                {this.state.error?.message}
              </div>

              <Button onClick={this.handleRetry} className="w-full bg-red-900/50 hover:bg-red-800 border-red-500/50">
                Realign & Retry
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
