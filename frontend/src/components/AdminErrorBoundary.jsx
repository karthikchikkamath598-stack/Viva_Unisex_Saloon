import React from 'react';
import VivaLogo from './VivaLogo';

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Admin Dashboard crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center px-6 font-body text-white">
          <div className="max-w-md w-full bg-zinc-900 border border-red-900/30 p-10 rounded-xl shadow-2xl relative overflow-hidden">
            {/* Top gold accent line */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-viva-gold" />
            
            <div className="flex justify-center mb-6">
              <VivaLogo size={56} className="text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]" />
            </div>

            <h2 className="font-heading text-xl font-bold uppercase tracking-widest text-[#D4AF37] mb-3">
              Unable to load Admin Dashboard
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6 font-light">
              An unexpected error occurred while rendering the page. Please refresh the dashboard or try again.
            </p>
            
            {this.state.error && (
              <p className="text-[10px] text-red-400 bg-red-950/20 border border-red-900/30 p-3 rounded mb-8 font-mono overflow-auto max-h-32 text-left whitespace-pre-wrap">
                {this.state.error.toString()}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="text-xs border border-[#D4AF37] hover:border-white text-zinc-950 bg-[#D4AF37] hover:bg-transparent hover:text-white px-6 py-2.5 rounded font-bold transition-all uppercase tracking-widest cursor-pointer"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="text-xs border border-white/10 hover:border-white text-zinc-400 hover:text-white bg-transparent hover:bg-white/5 px-6 py-2.5 rounded transition-all uppercase tracking-widest cursor-pointer"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdminErrorBoundary;
