import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Cpu, 
  Play, 
  RefreshCw, 
  Flame, 
  Zap, 
  Copy, 
  Check, 
  AlertTriangle, 
  Terminal, 
  Eye, 
  Key, 
  Lock, 
  Unlock, 
  Server, 
  Radio, 
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  Bug
} from 'lucide-react';
import { 
  EnterpriseAgent, 
  ExecutionTrace, 
  RedTeamAttackScenario, 
  AccessTier, 
  PubSubExecutionState 
} from '../types/aegis';

interface FleetCommandTabProps {
  agents: EnterpriseAgent[];
  selectedAgent: EnterpriseAgent;
  onSelectAgent: (agent: EnterpriseAgent) => void;
  redTeamAttacks: RedTeamAttackScenario[];
  activeTrace: ExecutionTrace | null;
  isRunning: boolean;
  onExecute: (prompt: string, callerTier: AccessTier, callerIdentity: string, attackId?: string) => void;
}

export const FleetCommandTab: React.FC<FleetCommandTabProps> = ({
  agents,
  selectedAgent,
  onSelectAgent,
  redTeamAttacks,
  activeTrace,
  isRunning,
  onExecute,
}) => {
  const [promptInput, setPromptInput] = useState<string>(
    'Validate and reconcile cross-border vendor invoice INV-2026-9041 for tax calculation.'
  );
  const [selectedAttackId, setSelectedAttackId] = useState<string>('');
  const [callerTier, setCallerTier] = useState<AccessTier>('L2-Internal');
  const [callerIdentity, setCallerIdentity] = useState<string>('soc-lead-analyst-session');
  const [copied, setCopied] = useState<boolean>(false);
  const [diffView, setDiffView] = useState<'side-by-side' | 'unified'>('side-by-side');

  // Load attack scenario payload when selected
  const handleAttackSelect = (attackId: string) => {
    setSelectedAttackId(attackId);
    if (!attackId) return;
    const attack = redTeamAttacks.find(a => a.id === attackId);
    if (attack) {
      setPromptInput(attack.maliciousPrompt);
      // Auto-target the specific agent configured for this attack
      const target = agents.find(a => a.id === attack.targetAgentId);
      if (target) {
        onSelectAgent(target);
      }
    }
  };

  const handleRun = () => {
    if (!promptInput.trim() || isRunning) return;
    onExecute(promptInput, callerTier, callerIdentity, selectedAttackId || undefined);
  };

  const handleCopyOutput = () => {
    if (!activeTrace?.response) return;
    navigator.clipboard.writeText(activeTrace.response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Status badge coloring
  const getTierBadge = (tier: AccessTier) => {
    switch (tier) {
      case 'L3-Restricted':
        return 'bg-purple-950 text-purple-300 border-purple-500/40';
      case 'L2-Internal':
        return 'bg-blue-950 text-blue-300 border-blue-500/40';
      case 'L1-Public':
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[calc(100vh-140px)]">
      {/* ========================================================================= */}
      {/* LEFT PANE: Fleet Directory + Attack Sandbox + Dispatch Controls (4 Cols)  */}
      {/* ========================================================================= */}
      <div className="lg:col-span-4 flex flex-col space-y-4">
        {/* Agent Fleet Directory Card */}
        <aside className="bg-[#0D121C] rounded-xl border border-slate-800 flex flex-col shadow-xl overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
            <div className="flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase font-mono">
                Fleet Directory
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {agents.length} ONLINE
            </span>
          </div>

          <div className="p-2 space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar">
            {agents.map((agent) => {
              const isSelected = agent.id === selectedAgent.id;
              return (
                <div
                  key={agent.id}
                  id={`agent-select-${agent.id}`}
                  onClick={() => onSelectAgent(agent)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                      : 'bg-slate-900/40 border-transparent hover:border-slate-800 hover:bg-slate-800/40 text-slate-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-bold font-mono transition-colors ${
                      isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}>
                      {agent.name}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      agent.accessTier === 'L3-Restricted'
                        ? 'bg-purple-500/20 text-purple-300'
                        : agent.accessTier === 'L2-Internal'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {agent.accessTier}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate font-mono">
                    {agent.role} • {agent.department}
                  </div>
                  <div className="mt-2 flex gap-1 items-center">
                    <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${isSelected ? 'w-3/4 bg-emerald-500 shadow-[0_0_6px_#10B981]' : 'w-1/2 bg-slate-700'}`}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">
                      {agent.totalInvocations} runs
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Simulation Lab Attack Trigger Box */}
          <div className="p-3.5 border-t border-slate-800 bg-[#0B0F17]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Bug className="w-3 h-3 text-rose-400" />
                <span>Simulation Lab</span>
              </div>
              <span className="text-[9px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                OWASP LLM
              </span>
            </div>

            <select
              id="select-attack-scenario"
              value={selectedAttackId}
              onChange={(e) => handleAttackSelect(e.target.value)}
              className="w-full bg-[#0D121C] text-slate-200 text-xs font-mono rounded-md border border-slate-700 p-2 focus:border-rose-500 focus:outline-none mb-2"
            >
              <option value="">-- Choose Red Team Attack Scenario --</option>
              {redTeamAttacks.map((attack) => (
                <option key={attack.id} value={attack.id}>
                  [{attack.severity}] {attack.name}
                </option>
              ))}
            </select>

            {selectedAttackId && (
              <div className="text-[10px] font-mono bg-rose-500/10 border border-rose-500/25 rounded p-2 text-rose-300 mb-2">
                <strong>Vulnerability: </strong>{redTeamAttacks.find(a => a.id === selectedAttackId)?.owaspReference}
              </div>
            )}

            <button
              onClick={() => {
                if (!selectedAttackId && redTeamAttacks.length > 0) {
                  handleAttackSelect(redTeamAttacks[0].id);
                }
              }}
              className="w-full py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-mono font-bold rounded-md hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>TRIGGER RED TEAM ATTACK</span>
            </button>
          </div>
        </aside>

        {/* Execution Dispatch Console */}
        <div className="bg-[#0D121C] rounded-xl border border-slate-800 p-4 shadow-xl flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-bold font-mono tracking-wide uppercase text-slate-200">
                  Execution Dispatch Console
                </h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Zero-Trust Gate
              </span>
            </div>

            {/* Zero-Trust Caller Identity Controls */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-[9px] font-mono text-slate-400 mb-1 uppercase tracking-wider">
                  Caller Identity
                </label>
                <input
                  type="text"
                  value={callerIdentity}
                  onChange={(e) => setCallerIdentity(e.target.value)}
                  className="w-full bg-[#0B0F17] text-slate-300 text-xs font-mono rounded border border-slate-700 px-2 py-1.5 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-400 mb-1 uppercase tracking-wider">
                  Caller Access Tier
                </label>
                <select
                  value={callerTier}
                  onChange={(e) => setCallerTier(e.target.value as AccessTier)}
                  className="w-full bg-[#0B0F17] text-slate-300 text-xs font-mono rounded border border-slate-700 px-2 py-1.5 focus:outline-none focus:border-cyan-500"
                >
                  <option value="L1-Public">L1-Public</option>
                  <option value="L2-Internal">L2-Internal</option>
                  <option value="L3-Restricted">L3-Restricted</option>
                </select>
              </div>
            </div>

            {/* Prompt Input Box */}
            <div className="mb-3">
              <label className="block text-[9px] font-mono text-slate-400 mb-1 uppercase tracking-wider flex justify-between">
                <span>Inbound Payload (Prompt)</span>
                <span className="text-slate-500 font-mono">{promptInput.length} chars</span>
              </label>
              <textarea
                id="input-prompt-box"
                rows={3}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Enter prompt or select Red Team attack payload above..."
                className="w-full bg-[#0B0F17] text-slate-200 text-xs font-mono rounded-lg border border-slate-700 p-2.5 focus:border-emerald-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          <div>
            <button
              id="btn-dispatch-prompt"
              onClick={handleRun}
              disabled={isRunning || !promptInput.trim()}
              className={`w-full py-2.5 px-4 rounded-lg font-mono font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                isRunning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : selectedAttackId
                  ? 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-[#0B0F17] shadow-[0_0_15px_rgba(16,185,129,0.3)] font-bold'
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                  <span>ORCHESTRATING IN CLOUD RUN...</span>
                </>
              ) : selectedAttackId ? (
                <>
                  <Bug className="w-4 h-4" />
                  <span>DISPATCH RED TEAM ATTACK</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>DISPATCH TO FORTIFIED GRID</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CENTER PANE: Immersive Terminal Stream & Live Reasoning (5 Cols)          */}
      {/* ========================================================================= */}
      <section className="lg:col-span-5 flex flex-col bg-[#0D121C] rounded-xl border border-slate-800 shadow-inner overflow-hidden">
        {/* Terminal Header Bar */}
        <div className="h-10 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-900/40 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]"></div>
            <span className="text-[11px] font-mono font-bold text-white tracking-wider">
              SESSION_ID: AF-7729-X
            </span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <span className="text-slate-500">
              LATENCY: <strong className="text-emerald-400 font-normal">{activeTrace?.totalLatencyMs || 24}ms</strong>
            </span>
            <span className="text-slate-500">
              TOKENS: <strong className="text-cyan-400 font-normal">{activeTrace?.tokens?.totalTokens ? `${(activeTrace.tokens.totalTokens / 1000).toFixed(1)}k` : '1.4k'} / 128k</strong>
            </span>
          </div>
        </div>

        {/* Live Terminal Content Stream */}
        <div className="flex-1 p-4 font-mono text-[12px] leading-relaxed overflow-hidden flex flex-col justify-between">
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[460px]">
            {/* System Status Line */}
            <div className="flex gap-3">
              <span className="text-cyan-400 shrink-0 font-bold">[SYSTEM]</span>
              <span className="text-slate-400">
                Initializing Model Armor protocol V4.2... Secure Zero-Trust Gateway connected to Cloud Run runtime.
              </span>
            </div>

            {/* Agent Selected Line */}
            <div className="flex gap-3">
              <span className="text-emerald-400 shrink-0 font-bold">[AGENT]</span>
              <div className="text-slate-200 bg-slate-800/30 p-2.5 rounded border-l-2 border-emerald-500 w-full">
                Targeted Agent: <strong className="text-white">{selectedAgent.name}</strong> ({selectedAgent.role}) under Access Tier <strong className="text-emerald-300">{selectedAgent.accessTier}</strong>.
              </div>
            </div>

            {/* Inbound Prompt Entry */}
            <div className="flex gap-3">
              <span className="text-cyan-400 shrink-0 font-bold">[INBOUND]</span>
              <span className="text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800 w-full">
                {promptInput}
              </span>
            </div>

            {/* If trace is available, display live CoT and Armor logs */}
            {activeTrace && (
              <>
                {/* Model Armor Screening */}
                <div className="flex gap-3">
                  <span className="text-amber-400 shrink-0 font-bold">[ARMOR]</span>
                  <span className="text-amber-200/90 italic bg-amber-500/5 border border-amber-500/20 p-2 rounded w-full">
                    Intercepting payload: Decision = <strong>{activeTrace.modelArmor?.decision || 'ALLOW'}</strong> ({activeTrace.modelArmor?.latencyMs ?? 4}ms). Redacted: {activeTrace.modelArmor?.piiScrub?.redactedEntities?.length ?? 0} entities.
                  </span>
                </div>

                {/* Threat Detection */}
                {activeTrace.state === 'BLOCKED_SECURITY_VIOLATION' && (
                  <div className="flex gap-3">
                    <span className="text-rose-400 shrink-0 font-bold">[THREAT]</span>
                    <div className="text-rose-300 border border-rose-500/30 bg-rose-500/10 p-2.5 rounded w-full">
                      <strong className="text-rose-400 uppercase">WARNING: External prompt override detected. </strong>
                      <span>{activeTrace.modelArmor?.threatsDetected?.[0]?.description || 'Security Violation detected by Model Armor rule.'}</span>
                    </div>
                  </div>
                )}

                {/* Shield Action */}
                <div className="flex gap-3">
                  <span className="text-emerald-500 shrink-0 font-bold">[SHIELD]</span>
                  <div className={`p-2 rounded border w-full ${
                    activeTrace.state === 'BLOCKED_SECURITY_VIOLATION'
                      ? 'bg-rose-500/10 border-rose-500/30 text-white font-bold'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200 font-bold'
                  }`}>
                    {activeTrace.state === 'BLOCKED_SECURITY_VIOLATION' ? (
                      <span>SHIELD ENGAGED: Attack neutralized. Payload routed to Dead-Letter Queue (DLQ). Incident reported to SOC.</span>
                    ) : (
                      <span>SHIELD PASSED: Zero-Trust authorization granted. Executed through resilient Gemini fallback pipeline.</span>
                    )}
                  </div>
                </div>

                {/* Agent Reasoning Steps */}
                {activeTrace.reasoningSteps.map((step) => (
                  <div key={step.stepNumber} className="flex gap-3">
                    <span className={`shrink-0 font-bold ${step.status === 'BLOCKED' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      [STEP {step.stepNumber}]
                    </span>
                    <div className="text-slate-300 bg-slate-900/40 p-2 rounded border border-slate-800/80 w-full text-[11px]">
                      <strong className="text-slate-200">{step.stage.toUpperCase()}: </strong>
                      {step.thought}
                    </div>
                  </div>
                ))}

                {/* Final Output */}
                <div className="flex gap-3">
                  <span className="text-emerald-400 shrink-0 font-bold">[OUTPUT]</span>
                  <div className="text-slate-200 bg-[#0B0F17] p-2.5 rounded border border-slate-800 w-full text-[11px] leading-relaxed">
                    <div className="flex justify-between items-center mb-1 text-[10px] text-slate-400 pb-1 border-b border-slate-800">
                      <span>VERIFIED RESPONSE</span>
                      <button onClick={handleCopyOutput} className="hover:text-emerald-400 transition-colors">
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-[11px]">
                      {activeTrace.response}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Interactive Terminal Prompt Input Bar */}
          <div className="mt-3 h-12 bg-[#0B0F17] border border-slate-700 rounded-lg flex items-center px-4 gap-3 shrink-0">
            <span className="text-emerald-500 font-bold">❯</span>
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isRunning) handleRun();
              }}
              placeholder="Execute command or initiate mission..."
              className="bg-transparent border-none outline-none text-slate-100 flex-1 placeholder:text-slate-600 text-[12px] font-mono"
            />
            <div className="flex gap-1.5 items-center">
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-mono font-bold"
              >
                EXEC
              </button>
              <div className="w-5 h-5 rounded border border-slate-700 flex items-center justify-center text-[9px] text-slate-400 font-mono">⌘</div>
              <div className="w-5 h-5 rounded border border-slate-700 flex items-center justify-center text-[9px] text-slate-400 font-mono">K</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* RIGHT PANE: Security Policy Inspector & Residency Clusters (3 Cols)       */}
      {/* ========================================================================= */}
      <aside className="lg:col-span-3 bg-[#111827]/50 border border-slate-800 rounded-xl flex flex-col shadow-xl overflow-hidden">
        <div className="p-3.5 border-b border-slate-800 flex items-center gap-2 bg-slate-900/40">
          <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 font-mono">
            Security Policy Inspector
          </span>
        </div>

        <div className="p-4 flex-1 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Active Interceptors Counters */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] uppercase font-bold font-mono text-slate-400">
              <span>Active Interceptors</span>
              <span className="text-emerald-400 font-semibold">Online</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between p-2 bg-slate-900/60 rounded border border-slate-800/80 text-[11px] font-mono">
                <span className="text-slate-300">PII Redaction Engine</span>
                <span className="text-emerald-400 font-bold">{activeTrace?.modelArmor?.piiScrub?.redactedEntities?.length ?? 12} Redacted</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-900/60 rounded border border-slate-800/80 text-[11px] font-mono">
                <span className="text-slate-300">Prompt Injection Guard</span>
                <span className="text-emerald-400 font-bold">{activeTrace?.state === 'BLOCKED_SECURITY_VIOLATION' ? '1 Threat Blocked' : 'Enforcing Active'}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-900/60 rounded border border-slate-800/80 text-[11px] font-mono">
                <span className="text-slate-300">Token Exfiltration Shield</span>
                <span className="text-slate-400">0 Leaks</span>
              </div>
            </div>
          </div>

          {/* OTEL Distributed Trace Micro-Timeline */}
          <div className="space-y-2.5">
            <div className="text-[10px] uppercase font-bold font-mono text-slate-400">
              OTEL Distributed Trace
            </div>
            <div className="space-y-2 font-mono">
              <div className="h-11 border-l border-emerald-500/40 ml-1 pl-3.5 relative">
                <div className="absolute -left-1 top-0 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_4px_#10B981]"></div>
                <div className="text-[11px] text-white font-medium">Gateway: Auth Check</div>
                <div className="text-[9px] text-slate-400">1.2ms • <span className="text-emerald-400">Success</span></div>
              </div>
              <div className="h-11 border-l border-emerald-500/40 ml-1 pl-3.5 relative">
                <div className="absolute -left-1 top-0 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_4px_#10B981]"></div>
                <div className="text-[11px] text-white font-medium">Armor: PII Screening</div>
                <div className="text-[9px] text-slate-400">{activeTrace?.modelArmor?.latencyMs ?? 4.8}ms • <span className="text-emerald-400">{activeTrace?.modelArmor?.decision === 'BLOCK' ? 'Blocked' : 'Masked'}</span></div>
              </div>
              <div className="h-11 border-l border-cyan-500/40 ml-1 pl-3.5 relative">
                <div className="absolute -left-1 top-0 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_4px_#06B6D4]"></div>
                <div className="text-[11px] text-white font-medium">Gemini: Reasoning</div>
                <div className="text-[9px] text-slate-400">{activeTrace?.spans?.find(s => s.name.includes('Gemini'))?.durationMs || (activeTrace ? Math.max(12, activeTrace.totalLatencyMs - (activeTrace.modelArmor?.latencyMs || 0)) : 142)}ms • <span className="text-cyan-400">v3.5-Flash</span></div>
              </div>
            </div>
          </div>

          {/* Memory Residency Cluster Visualizer */}
          <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono mb-2 flex justify-between">
              <span>Memory Residency</span>
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
            <div className="flex items-end gap-1.5 h-12 pt-1">
              <div className="w-full bg-emerald-500/30 h-1/2 rounded-t-sm"></div>
              <div className="w-full bg-emerald-500/40 h-3/4 rounded-t-sm"></div>
              <div className="w-full bg-emerald-500/70 h-full rounded-t-sm shadow-[0_0_6px_rgba(16,185,129,0.3)]"></div>
              <div className="w-full bg-emerald-500/30 h-2/3 rounded-t-sm"></div>
              <div className="w-full bg-emerald-500/50 h-1/2 rounded-t-sm"></div>
            </div>
            <div className="text-[9px] text-slate-400 mt-2 text-center font-mono">
              Vector Cluster: <strong className="text-slate-200">US-CENTRAL1 Primary</strong>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
