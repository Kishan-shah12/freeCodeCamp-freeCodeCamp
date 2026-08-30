import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FleetCommandTab } from './components/FleetCommandTab';
import { AgentRegistryTab } from './components/AgentRegistryTab';
import { TraceExplorerTab } from './components/TraceExplorerTab';
import { MemoryBankTab } from './components/MemoryBankTab';
import { MetricsDashboardTab } from './components/MetricsDashboardTab';
import { ThreatModelModal } from './components/ThreatModelModal';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';
import { 
  INITIAL_AGENTS, 
  RED_TEAM_ATTACKS, 
  INITIAL_TRACES, 
  INITIAL_MEMORY_NODES, 
  INITIAL_METRICS 
} from './services/mockFleetData';
import { 
  EnterpriseAgent, 
  ExecutionTrace, 
  RedTeamAttackScenario, 
  MemoryNode, 
  SOCMetrics, 
  AccessTier 
} from './types/aegis';
import { ShieldCheck, ShieldAlert, CheckCircle, AlertTriangle, X } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'command' | 'registry' | 'traces' | 'memory' | 'metrics'>('command');
  const [agents, setAgents] = useState<EnterpriseAgent[]>(INITIAL_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<EnterpriseAgent>(INITIAL_AGENTS[0]);
  const [redTeamAttacks, setRedTeamAttacks] = useState<RedTeamAttackScenario[]>(RED_TEAM_ATTACKS);
  const [traces, setTraces] = useState<ExecutionTrace[]>(INITIAL_TRACES);
  const [activeTrace, setActiveTrace] = useState<ExecutionTrace | null>(INITIAL_TRACES[0]);
  const [memoryNodes, setMemoryNodes] = useState<MemoryNode[]>(INITIAL_MEMORY_NODES);
  const [metrics, setMetrics] = useState<SOCMetrics>(INITIAL_METRICS);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [geminiConnected, setGeminiConnected] = useState<boolean>(true);
  const [showThreatModel, setShowThreatModel] = useState<boolean>(false);
  const [showDeploymentGuide, setShowDeploymentGuide] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Initial fetch from backend APIs
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [agentsRes, attacksRes, tracesRes, memoryRes, metricsRes, healthRes] = await Promise.all([
          fetch('/api/fleet/agents').catch(() => null),
          fetch('/api/redteam/scenarios').catch(() => null),
          fetch('/api/telemetry/traces').catch(() => null),
          fetch('/api/memory/nodes').catch(() => null),
          fetch('/api/soc/metrics').catch(() => null),
          fetch('/api/health').catch(() => null)
        ]);

        if (agentsRes && agentsRes.ok) {
          const data = await agentsRes.json();
          const list = data?.agents || (Array.isArray(data) ? data : []);
          if (list.length > 0) {
            setAgents(list);
            setSelectedAgent(list[0]);
          }
        }

        if (attacksRes && attacksRes.ok) {
          const data = await attacksRes.json();
          const list = data?.scenarios || (Array.isArray(data) ? data : []);
          if (list.length > 0) setRedTeamAttacks(list);
        }

        if (tracesRes && tracesRes.ok) {
          const data = await tracesRes.json();
          const list = data?.traces || (Array.isArray(data) ? data : []);
          if (list.length > 0) {
            setTraces(list);
            setActiveTrace(list[0]);
          }
          if (data?.metrics) setMetrics(data.metrics);
        }

        if (memoryRes && memoryRes.ok) {
          const data = await memoryRes.json();
          const list = data?.nodes || (Array.isArray(data) ? data : []);
          if (list.length > 0) setMemoryNodes(list);
        }

        if (metricsRes && metricsRes.ok) {
          const data = await metricsRes.json();
          const m = data?.metrics || data;
          if (m && m.threatMitigationRate) setMetrics(m);
        }

        if (healthRes && healthRes.ok) {
          const data = await healthRes.json();
          setGeminiConnected(data.geminiConnected ?? true);
        }
      } catch (err) {
        console.warn('Backend initialized with robust offline SOC state:', err);
      }
    };

    fetchInitialData();
  }, []);

  // Execute Agent or Red Team attack
  const handleExecute = async (
    prompt: string, 
    callerTier: AccessTier, 
    callerIdentity: string, 
    attackId?: string
  ) => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          prompt,
          callerTier,
          callerIdentity,
          attackId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const rawData = await response.json();
      const traceResult: ExecutionTrace = rawData.trace || rawData;
      setActiveTrace(traceResult);
      setTraces(prev => [traceResult, ...prev]);

      // Safely calculate tokens burned
      const totalTokensBurned = traceResult.tokens?.totalTokens ?? 42;

      // Update metrics
      setMetrics(prev => {
        const isBlocked = traceResult.state === 'BLOCKED_SECURITY_VIOLATION';
        return {
          ...prev,
          totalThreatsNeutralized: isBlocked ? prev.totalThreatsNeutralized + 1 : prev.totalThreatsNeutralized,
          totalTokensBurned: prev.totalTokensBurned + totalTokensBurned,
          pubSubMessagesProcessed: prev.pubSubMessagesProcessed + 1,
          dlqMessagesCount: isBlocked ? prev.dlqMessagesCount + 1 : prev.dlqMessagesCount
        };
      });

      // Update agent invocations
      setAgents(prev => prev.map(a => {
        if (a.id === selectedAgent.id) {
          return {
            ...a,
            totalInvocations: a.totalInvocations + 1,
            threatsBlocked: traceResult.state === 'BLOCKED_SECURITY_VIOLATION' ? a.threatsBlocked + 1 : a.threatsBlocked
          };
        }
        return a;
      }));

      if (traceResult.state === 'BLOCKED_SECURITY_VIOLATION') {
        showToast(`Model Armor Neutralized Threat: ${traceResult.modelArmor?.threatsDetected?.[0]?.description || 'Security Violation'}`, 'error');
      } else if (traceResult.modelArmor?.decision === 'REDACT_AND_ALLOW') {
        showToast(`Executed safely with ${traceResult.modelArmor?.piiScrub?.redactedEntities?.length ?? 0} PII entities redacted.`, 'warning');
      } else {
        showToast(`Agent verified execution completed in ${traceResult.totalLatencyMs ?? 110}ms.`, 'success');
      }
    } catch (err) {
      console.error('Execution error:', err);
      showToast('Execution error. Please verify backend state.', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  // Deploy new agent
  const handleDeployAgent = async (agentData: Partial<EnterpriseAgent>) => {
    try {
      const res = await fetch('/api/fleet/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData)
      });
      if (res.ok) {
        const data = await res.json();
        const newAgent: EnterpriseAgent = data.agent || data;
        setAgents(prev => [newAgent, ...prev]);
        setSelectedAgent(newAgent);
        showToast(`Agent ${newAgent.name} successfully deployed to Fleet Grid.`, 'success');
      }
    } catch (err) {
      console.error('Deploy agent error:', err);
    }
  };

  // Update Agent Status
  const handleUpdateAgentStatus = async (agentId: string, status: EnterpriseAgent['status']) => {
    try {
      await fetch(`/api/fleet/agents/${agentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status } : a));
      showToast(`Agent status updated to ${status}.`, 'success');
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  // Add memory node
  const handleAddMemoryNode = async (nodeData: Partial<MemoryNode>) => {
    try {
      const res = await fetch('/api/memory/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nodeData)
      });
      if (res.ok) {
        const data = await res.json();
        const newNode: MemoryNode = data.node || data;
        setMemoryNodes(prev => [newNode, ...prev]);
        showToast('Knowledge Node persisted to Firestore & Cloud SQL vector store.', 'success');
      }
    } catch (err) {
      console.error('Memory node add error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metrics={metrics}
        onOpenThreatModel={() => setShowThreatModel(true)}
        onOpenDeploymentGuide={() => setShowDeploymentGuide(true)}
        geminiConnected={geminiConnected}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full max-w-[1680px] mx-auto overflow-x-hidden p-3 md:p-5">
        {activeTab === 'command' && (
          <FleetCommandTab
            agents={agents}
            selectedAgent={selectedAgent}
            onSelectAgent={setSelectedAgent}
            redTeamAttacks={redTeamAttacks}
            activeTrace={activeTrace}
            isRunning={isRunning}
            onExecute={handleExecute}
          />
        )}

        {activeTab === 'registry' && (
          <AgentRegistryTab
            agents={agents}
            onDeployAgent={handleDeployAgent}
            onUpdateAgentStatus={handleUpdateAgentStatus}
          />
        )}

        {activeTab === 'traces' && (
          <TraceExplorerTab
            traces={traces}
          />
        )}

        {activeTab === 'memory' && (
          <MemoryBankTab
            memoryNodes={memoryNodes}
            onAddMemoryNode={handleAddMemoryNode}
          />
        )}

        {activeTab === 'metrics' && (
          <MetricsDashboardTab
            metrics={metrics}
          />
        )}
      </main>

      {/* Immersive SOC System Footer */}
      <footer className="h-9 bg-[#0B0F17] border-t border-slate-800 flex items-center justify-between px-6 shrink-0 font-mono text-[10px] text-slate-500">
        <div className="flex items-center gap-4 uppercase tracking-widest">
          <span>Kernel: <strong className="text-slate-400 font-normal">1.0.4-LTS</strong></span>
          <span className="hidden sm:inline">Uptime: <strong className="text-slate-400 font-normal">142d 11h 02m</strong></span>
          <span>Load: <strong className="text-emerald-500 font-normal">12%</strong></span>
          <span className="hidden md:inline">Cluster: <strong className="text-cyan-400 font-normal">US-CENTRAL1-A</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400 uppercase tracking-widest">System Ready</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10B981]"></div>
        </div>
      </footer>

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slideUp">
          <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl border shadow-2xl font-mono text-xs ${
            toast.type === 'error'
              ? 'bg-rose-950/95 border-rose-500 text-rose-200'
              : toast.type === 'warning'
              ? 'bg-amber-950/95 border-amber-500 text-amber-200'
              : 'bg-emerald-950/95 border-emerald-500 text-emerald-200'
          }`}>
            {toast.type === 'error' ? (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Threat Model Modal */}
      {showThreatModel && (
        <ThreatModelModal onClose={() => setShowThreatModel(false)} />
      )}

      {/* Deployment Guide Modal */}
      {showDeploymentGuide && (
        <DeploymentGuideModal onClose={() => setShowDeploymentGuide(false)} />
      )}
    </div>
  );
}

export default App;
