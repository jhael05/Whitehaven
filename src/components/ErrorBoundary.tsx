import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleRecover = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#DECDBE] shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto text-[#8C5332]">
              <AlertTriangle className="w-8 h-8 text-amber-700" />
            </div>

            <h2 className="font-serif-cafe text-2xl font-bold text-[#2C1810]">
              Something unexpected occurred
            </h2>

            <p className="text-xs text-[#7C6656] leading-relaxed">
              We encountered a temporary interface issue, but don&apos;t worry—your order and loyalty stamps are safe.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={this.handleRecover}
                className="w-full py-3 px-5 rounded-full bg-[#8C5332] hover:bg-[#6F3E22] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Resume App</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-2.5 px-5 rounded-full border border-[#D8C7B6] bg-white hover:bg-[#FAF7F2] text-[#5D4037] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Reload White Haven Café</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
