import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Cpu, 
  Activity, 
  Server, 
  Flame, 
  Layers, 
  Terminal, 
  Database, 
  LineChart, 
  BookOpen, 
  Cloud,
  Sparkles,
  Zap
} from 'lucide-react';
import { SOCMetrics } from '../types/aegis';

interface NavbarProps {
  activeTab: 'command' | 'registry' | 'traces' | 'memory' | 'metrics';
  setActiveTab: (tab: 'command' | 'registry' | 'traces' | 'memory' | 'metrics') => void;
  metrics: SOCMetrics;
  onOpenThreatModel: () => void;
  onOpenDeploymentGuide: () => void;
  geminiConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  metrics,
  onOpenThreatModel,
  onOpenDeploymentGuide,
  geminiConnected
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#111827]/80 backdrop-blur-md">
      {/* Top Telemetry Ticker Bar */}
      <div className="flex items-center justify-between px-6 py-1.5 text-xs border-b border-slate-800/80 bg-[#0B0F17] font-mono text-slate-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="text-slate-500 uppercase tracking-wider">REGION:</span>
            <span className="text-cyan-400 font-medium">us-central1-a</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">MODEL ARMOR: <strong className="text-emerald-400 font-semibold">ENFORCING</strong></span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center space-x-1.5 text-[11px]">
            <Sparkles className={`w-3.5 h-3.5 ${geminiConnected ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className={geminiConnected ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
              {geminiConnected ? 'GEMINI 3.5 ACTIVE' : 'SANDBOX SIM'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-[11px]">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">BURN: <strong className="text-slate-200 font-medium">{(metrics.totalTokensBurned / 1000).toFixed(1)}k tokens</strong></span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1.5 text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400">NEUTRALIZED: <strong className="text-rose-400 font-bold">{metrics.totalThreatsNeutralized}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Immersive Navigation Header */}
      <div className="h-14 flex items-center justify-between px-6">
        {/* Brand & Logo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-emerald-500 rounded-sm flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.4)]">
              <div className="w-3 h-3 bg-[#0B0F17] rotate-45"></div>
            </div>
            <span className="text-white font-bold tracking-tighter text-lg font-display">
              AEGISFLEET <span className="text-emerald-500">OS</span>
            </span>
          </div>
          <div className="h-4 w-[1px] bg-slate-800 mx-1 hidden md:block"></div>
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <span>SOC_NODE: <strong className="text-slate-300 font-normal">PROD-GRID-01</strong></span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1.5">
          <button
            id="tab-btn-command"
            onClick={() => setActiveTab('command')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'command'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            COMMAND
          </button>

          <button
            id="tab-btn-registry"
            onClick={() => setActiveTab('registry')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'registry'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            REGISTRY
          </button>

          <button
            id="tab-btn-traces"
            onClick={() => setActiveTab('traces')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'traces'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            TELEMETRY
          </button>

          <button
            id="tab-btn-memory"
            onClick={() => setActiveTab('memory')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'memory'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            MEMORY
          </button>

          <button
            id="tab-btn-metrics"
            onClick={() => setActiveTab('metrics')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'metrics'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            METRICS
          </button>
        </nav>

        {/* Threat Mitigation & Zero-Trust Status & Quick Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Threat Mitigation</div>
            <div className="text-xs font-bold text-white">
              {metrics.threatMitigationRate}% <span className="text-emerald-500 font-normal">↑</span>
            </div>
          </div>

          <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
            <span className="text-[10px] font-bold text-slate-300 tracking-wider">ZERO-TRUST ACTIVE</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-threat-model"
              onClick={onOpenThreatModel}
              className="flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-mono bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="View Agentic Threat Model"
            >
              <BookOpen className="w-3 h-3 text-cyan-400" />
              <span className="hidden md:inline">Threat Model</span>
              <span className="md:hidden">Threats</span>
            </button>

            <button
              id="btn-deployment-guide"
              onClick={onOpenDeploymentGuide}
              className="flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-mono bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 transition-colors"
              title="Cloud Run Deployment Guide"
            >
              <Cloud className="w-3 h-3 text-emerald-400" />
              <span className="hidden md:inline">Cloud Run Guide</span>
              <span className="md:hidden">Deploy</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
