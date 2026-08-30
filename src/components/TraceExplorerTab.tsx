import React, { useState } from 'react';
import { 
  Activity, 
  Clock, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Download, 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  Check, 
  Search, 
  Flame, 
  Cpu,
  FileJson
} from 'lucide-react';
import { ExecutionTrace, OpenTelemetrySpan } from '../types/aegis';

interface TraceExplorerTabProps {
  traces: ExecutionTrace[];
}

export const TraceExplorerTab: React.FC<TraceExplorerTabProps> = ({ traces }) => {
  const [selectedTraceId, setSelectedTraceId] = useState<string>(traces[0]?.traceId || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSpanId, setExpandedSpanId] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showJsonModal, setShowJsonModal] = useState<boolean>(false);

  const selectedTrace = traces.find(t => t.traceId === selectedTraceId) || traces[0];

  const filteredTraces = traces.filter(t => 
    t.traceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyJson = () => {
    if (!selectedTrace) return;
    navigator.clipboard.writeText(JSON.stringify(selectedTrace, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTrace = () => {
    if (!selectedTrace) return;
    const blob = new Blob([JSON.stringify(selectedTrace, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opentelemetry-trace-${selectedTrace.traceId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxDuration = selectedTrace 
    ? Math.max(...selectedTrace.spans.map(s => s.endTimeMs), selectedTrace.totalLatencyMs, 1)
    : 100;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold font-mono uppercase tracking-wider text-slate-100">
              OpenTelemetry Distributed Trace Explorer
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Interactive OpenTelemetry span waterfall timeline, latency breakdown, and SOC compliance telemetry tree.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyJson}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Trace JSON'}</span>
          </button>

          <button
            onClick={handleDownloadTrace}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-[#0B0F17] shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Trace Bundle</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Trace List (4 cols) */}
        <div className="lg:col-span-4 bg-[#0D121C] rounded-xl border border-slate-800 p-3 shadow-xl flex flex-col space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by Trace ID, Agent, Status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B0F17] text-xs font-mono rounded-lg border border-slate-700 pl-8 pr-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredTraces.map((trace) => {
              const isSelected = trace.traceId === selectedTrace?.traceId;
              const isBlocked = trace.state === 'BLOCKED_SECURITY_VIOLATION';
              return (
                <button
                  key={trace.traceId}
                  id={`trace-item-${trace.traceId}`}
                  onClick={() => setSelectedTraceId(trace.traceId)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                      : 'bg-slate-900/40 border-transparent hover:border-slate-800 hover:bg-slate-800/40 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold font-mono text-slate-200 truncate">
                      {trace.traceId}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      isBlocked
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {isBlocked ? 'BLOCKED' : 'VERIFIED'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="truncate">{trace.agentName}</span>
                    <span className="text-emerald-400 font-bold">{trace.totalLatencyMs}ms</span>
                  </div>

                  <div className="text-[9px] font-mono text-slate-500 mt-1 truncate">
                    {new Date(trace.timestamp).toLocaleTimeString()} • {trace.tokens?.totalTokens ?? 0} tokens
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Waterfall Visualizer + Span Details (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedTrace ? (
            <>
              {/* Trace Overview Header Card */}
              <div className="bg-[#0D121C] rounded-xl border border-slate-800 p-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800">
                  <div>
                    <div className="text-xs font-mono text-emerald-400 font-bold">
                      TRACE ID: {selectedTrace.traceId}
                    </div>
                    <div className="text-xs text-slate-300 font-mono">
                      Agent: <strong>{selectedTrace.agentName}</strong> • Region: <strong>{selectedTrace.cloudRegion}</strong>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-xs font-mono">
                    <div className="flex items-center space-x-1 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{selectedTrace.totalLatencyMs}ms</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-300">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>{selectedTrace.tokens?.totalTokens ?? 0} Tok</span>
                    </div>
                  </div>
                </div>

                {/* Prompt & Decision Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded bg-[#0B0F17] border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Inbound Prompt</span>
                    <p className="text-slate-300 text-[11px] line-clamp-2">{selectedTrace.prompt}</p>
                  </div>
                  <div className={`p-2.5 rounded border ${
                    selectedTrace.modelArmor?.passed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}>
                    <span className="text-[10px] uppercase font-bold block mb-1">Model Armor Decision</span>
                    <p className="text-[11px]">
                      {selectedTrace.modelArmor?.decision || 'ALLOW'} • {selectedTrace.modelArmor?.piiScrub?.redactedEntities?.length ?? 0} PII redacted
                    </p>
                  </div>
                </div>
              </div>

              {/* Distributed Trace Waterfall Chart */}
              <div className="bg-[#0D121C] rounded-xl border border-slate-800 p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
                      OpenTelemetry Span Waterfall Tree
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Total Duration: <strong className="text-emerald-400">{selectedTrace.totalLatencyMs}ms</strong>
                  </span>
                </div>

                {/* Waterfall Timeline Header */}
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pb-1.5 mb-2 border-b border-slate-800">
                  <span className="w-1/3">SPAN NAME & SERVICE</span>
                  <span className="w-2/3 flex justify-between px-2">
                    <span>0ms</span>
                    <span>{Math.round(maxDuration / 2)}ms</span>
                    <span>{maxDuration}ms</span>
                  </span>
                </div>

                {/* Spans List */}
                <div className="space-y-2">
                  {selectedTrace.spans.map((span) => {
                    const isExpanded = expandedSpanId === span.spanId;
                    const leftPct = Math.max(0, Math.min(95, (span.startTimeMs / maxDuration) * 100));
                    const widthPct = Math.max(5, Math.min(100 - leftPct, (span.durationMs / maxDuration) * 100));
                    const isError = span.status === 'ERROR' || span.status === 'BLOCKED';

                    return (
                      <div key={span.spanId} className="space-y-1">
                        <div
                          onClick={() => setExpandedSpanId(isExpanded ? null : span.spanId)}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#0B0F17] border border-slate-800 hover:border-slate-700 cursor-pointer font-mono text-xs transition-colors"
                        >
                          <div className="w-1/3 flex items-center space-x-1.5 truncate pr-2">
                            {isExpanded ? <ChevronDown className="w-3 h-3 text-emerald-400 shrink-0" /> : <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />}
                            <span className="font-semibold text-slate-200 truncate">{span.name}</span>
                          </div>

                          {/* Waterfall Bar */}
                          <div className="w-2/3 relative h-6 bg-slate-900/60 rounded flex items-center px-1">
                            <div
                              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                              className={`absolute h-4 rounded text-[9px] flex items-center px-1.5 text-white font-bold truncate transition-all ${
                                isError
                                  ? 'bg-gradient-to-r from-rose-600 to-red-700 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                                  : span.name.includes('ModelArmor')
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-700 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                                  : span.name.includes('Gemini')
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                                  : 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                              }`}
                            >
                              <span className="truncate">{span.durationMs}ms</span>
                            </div>
                          </div>
                        </div>

                        {/* Span Attributes Inspector (Collapsible) */}
                        {isExpanded && (
                          <div className="p-3 bg-[#0B0F17] rounded-lg border border-slate-800 font-mono text-xs ml-4 space-y-1.5 animate-fadeIn">
                            <div className="flex items-center justify-between text-slate-400 text-[10px] border-b border-slate-800 pb-1">
                              <span>SPAN ID: <strong className="text-emerald-400">{span.spanId}</strong></span>
                              <span>SERVICE: <strong className="text-slate-300">{span.serviceName}</strong></span>
                              <span>STATUS: <strong className={isError ? 'text-rose-400' : 'text-emerald-400'}>{span.status}</strong></span>
                            </div>

                            <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                              Span Attributes:
                            </div>
                            <pre className="bg-[#070A0F] p-2 rounded text-emerald-300 text-[11px] overflow-x-auto custom-scrollbar">
                              {JSON.stringify(span.attributes, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[#0D121C] rounded-xl border border-slate-800 p-8 text-center text-slate-500 font-mono text-xs">
              No trace selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
