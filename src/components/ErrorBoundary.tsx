import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full py-20 bg-[#1A1A1A] rounded-[48px] border border-white/5 flex flex-col items-center justify-center gap-6 text-center px-6">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-[24px] font-black text-white mb-2">出错了，页面加载失败</h2>
            <p className="text-[14px] text-white/40 font-bold mb-8 max-w-md mx-auto">
              我们将尝试恢复页面，或者您可以点击下方按钮重试。
              {this.state.error && <span className="block mt-2 opacity-50 text-[12px] font-mono">{this.state.error.message}</span>}
            </p>
            <button 
              onClick={this.handleReset}
              className="px-10 h-14 bg-white/5 text-white border border-white/10 rounded-full font-black text-[15px] hover:bg-white/10 transition-all flex items-center gap-3 mx-auto"
            >
              <RefreshCw className="w-5 h-5" /> 重试
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
