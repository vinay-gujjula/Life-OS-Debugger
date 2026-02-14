import React from 'react';
import { BugReportData } from '../types';

interface BugReportProps {
  data: BugReportData;
  onRestart?: () => void;
}

const Icons = {
  Alert: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
  ),
  Target: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
  ),
  Lock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
  ),
  Shield: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
  ),
  Loop: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
  ),
  Refresh: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
  )
}

const BugReport: React.FC<BugReportProps> = ({ data, onRestart }) => {
  return (
    <div className="w-full max-w-4xl mx-auto my-6 animate-slide-up">
      <div className="glass-card rounded-3xl border border-white/10 overflow-hidden relative">
        
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-50"></div>

        {/* Content Container */}
        <div className="p-6 md:p-10 relative z-10">
          
          {/* Header Section */}
          <div className="text-center mb-10">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-danger/10 border border-brand-danger/20 text-brand-danger text-xs font-semibold tracking-wide uppercase mb-6">
                <Icons.Alert />
                <span>Conflict Detected</span>
             </div>
             <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 mb-3 tracking-tight">
               {data.primary_contradiction}
             </h2>
             <div className="h-1 w-24 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full mx-auto mt-6 opacity-70"></div>
          </div>

          {/* Diagnosis Summary - Highlighted */}
          <div className="mb-10 bg-brand-surface/50 rounded-2xl p-6 border border-white/5 shadow-inner">
             <h3 className="text-brand-muted text-xs font-bold uppercase tracking-widest mb-3">Diagnostic Analysis</h3>
             <p className="text-brand-text/90 text-lg leading-relaxed font-light">
                {data.diagnosis_summary}
             </p>
          </div>

          {/* The 4 Signals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
             
             {/* Signal 1 */}
             <div className="bg-brand-surface/30 p-5 rounded-2xl border border-white/5 hover:bg-brand-surface/50 transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                   <div className="p-2 rounded-lg bg-brand-primary/20 text-brand-primary group-hover:scale-110 transition-transform">
                      <Icons.Target />
                   </div>
                   <div className="text-sm font-semibold text-brand-muted uppercase tracking-wider">Core Desire</div>
                </div>
                <p className="text-brand-text font-medium">{data.core_desire}</p>
             </div>

             {/* Signal 2 */}
             <div className="bg-brand-surface/30 p-5 rounded-2xl border border-white/5 hover:bg-brand-surface/50 transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                   <div className="p-2 rounded-lg bg-brand-danger/20 text-brand-danger group-hover:scale-110 transition-transform">
                      <Icons.Lock />
                   </div>
                   <div className="text-sm font-semibold text-brand-muted uppercase tracking-wider">Fear Root</div>
                </div>
                <p className="text-brand-text font-medium">{data.fear_root}</p>
             </div>

             {/* Signal 3 */}
             <div className="bg-brand-surface/30 p-5 rounded-2xl border border-white/5 hover:bg-brand-surface/50 transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                   <div className="p-2 rounded-lg bg-brand-secondary/20 text-brand-secondary group-hover:scale-110 transition-transform">
                      <Icons.Shield />
                   </div>
                   <div className="text-sm font-semibold text-brand-muted uppercase tracking-wider">Defensive Behavior</div>
                </div>
                <p className="text-brand-text font-medium">{data.defensive_behavior}</p>
             </div>

             {/* Signal 4 */}
             <div className="bg-brand-surface/30 p-5 rounded-2xl border border-white/5 hover:bg-brand-surface/50 transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                   <div className="p-2 rounded-lg bg-brand-accent/20 text-brand-accent group-hover:scale-110 transition-transform">
                      <Icons.Loop />
                   </div>
                   <div className="text-sm font-semibold text-brand-muted uppercase tracking-wider">Repeating Loop</div>
                </div>
                <p className="text-brand-text font-medium">{data.repeating_loop}</p>
             </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-white/10 pt-8 flex justify-center">
             {onRestart && (
               <button 
                 onClick={onRestart}
                 className="flex items-center gap-2 px-8 py-3 rounded-full bg-white text-brand-bg font-bold hover:bg-brand-text hover:scale-105 transition-all shadow-lg shadow-white/10"
               >
                 <Icons.Refresh />
                 <span>Restart Session</span>
               </button>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default BugReport;