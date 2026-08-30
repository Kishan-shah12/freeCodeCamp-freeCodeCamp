import React, { useState } from 'react';
import { 
  Server, 
  Shield, 
  Layers, 
  Plus, 
  CheckCircle, 
  AlertOctagon, 
  RotateCcw, 
  ExternalLink, 
  Cpu, 
  Key, 
  Lock, 
  Unlock, 
  Activity, 
  Tag, 
  Code,
  X
} from 'lucide-react';
import { EnterpriseAgent, AccessTier, Department } from '../types/aegis';

interface AgentRegistryTabProps {
  agents: EnterpriseAgent[];
  onDeployAgent: (agentData: Partial<EnterpriseAgent>) => void;
  onUpdateAgentStatus: (agentId: string, status: EnterpriseAgent['status']) => void;
}

export const AgentRegistryTab: React.FC<AgentRegistryTabProps> = ({
  agents,
  onDeployAgent,
  onUpdateAgentStatus
}) => {
  const [showDeployModal, setShowDeployModal] = useState<boolean>(false);
  const [selectedAgentDetail, setSelectedAgentDetail] = useState<EnterpriseAgent | null>(null);

  // Form State for Deploy Agent
  const [newName, setNewName] = useState('');
  const [newDepartment, setNewDepartment] = useState<Department>('Engineering');
  const [newRole, setNewRole] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTier, setNewTier] = useState<AccessTier>('L2-Internal');
  const [newAllowedTools, setNewAllowedTools] = useState('gcp_secret_read, cloud_run_deploy');
  const [newBoundaryTags, setNewBoundaryTags] = useState('SOC2-TYPE-II, ZERO-TRUST-BASELINE');
  const [newSystemInstruction, setNewSystemInstruction] = useState('');

  const handleDeploySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRole.trim()) return;

    onDeployAgent({
      name: newName,
      department: newDepartment,
      role: newRole,
      description: newDescription,
      accessTier: newTier,
      allowedTools: newAllowedTools.split(',').map(t => t.trim()).filter(Boolean),
      securityBoundaryTags: newBoundaryTags.split(',').map(t => t.trim()).filter(Boolean),
      systemInstruction: newSystemInstruction || `You are ${newName}, an enterprise agent governed by AegisFleet OS.`,
      capabilitiesSchema: {
        type: 'object',
        properties: {
          action: { type: 'string' }
        },
        required: ['action']
      }
    });

    setShowDeployModal(false);
    // Reset
    setNewName('');
    setNewRole('');
    setNewDescription('');
  };

  const getTierColor = (tier: AccessTier) => {
    switch (tier) {
      case 'L3-Restricted':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'L2-Internal':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'L1-Public':
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold font-mono uppercase tracking-wider text-slate-100">
              Enterprise Agent Registry & Governance Catalog
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Discover, govern, and deploy versioned autonomous agents with hardware-enforced Zero-Trust access boundaries.
          </p>
        </div>

        <button
          id="btn-deploy-agent-modal"
          onClick={() => setShowDeployModal(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-[#0B0F17] shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy Enterprise Agent</span>
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            id={`agent-card-${agent.id}`}
            className="bg-[#0D121C] rounded-xl border border-slate-800 hover:border-emerald-500/40 p-4 shadow-xl flex flex-col justify-between transition-all group"
          >
            <div>
              {/* Agent Top Status & Tier */}
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-emerald-500/40">
                    <Server className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-100 font-mono tracking-wide">
                      {agent.name}
                    </h3>
                    <div className="text-[10px] font-mono text-slate-400">
                      {agent.codename} • <strong className="text-slate-300">{agent.version}</strong>
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getTierColor(agent.accessTier)}`}>
                  {agent.accessTier}
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-3 leading-relaxed font-mono text-[11px]">
                {agent.description}
              </p>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-1.5 p-2 bg-[#0B0F17] rounded-lg border border-slate-800/80 mb-3 text-center font-mono">
                <div>
                  <div className="text-[9px] text-slate-500 uppercase">Uptime</div>
                  <div className="text-xs font-bold text-emerald-400">{agent.uptime}%</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-500 uppercase">Invocations</div>
                  <div className="text-xs font-bold text-slate-200">{agent.totalInvocations.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-500 uppercase">Threats</div>
                  <div className="text-xs font-bold text-rose-400">{agent.threatsBlocked}</div>
                </div>
              </div>

              {/* Tools List */}
              <div className="mb-3">
                <span className="text-[10px] font-mono text-slate-400 block mb-1 font-semibold uppercase">
                  Whitelisted Tools ({agent.allowedTools.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {agent.allowedTools.map((tool, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Boundary Tags */}
              <div className="mb-3">
                <span className="text-[10px] font-mono text-slate-400 block mb-1 font-semibold uppercase">
                  Security Boundaries:
                </span>
                <div className="flex flex-wrap gap-1">
                  {agent.securityBoundaryTags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-purple-300 border border-purple-900/40"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Lifecycle Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between font-mono text-[11px]">
              <div className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  agent.status === 'ONLINE' || agent.status === 'ACTIVE' ? 'bg-emerald-400 shadow-[0_0_6px_#10B981]' : 'bg-amber-400'
                }`} />
                <span className="text-slate-300 font-semibold text-[10px]">{agent.status}</span>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setSelectedAgentDetail(agent)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] border border-slate-700"
                >
                  Schema
                </button>

                {agent.status === 'ONLINE' || agent.status === 'ACTIVE' ? (
                  <button
                    onClick={() => onUpdateAgentStatus(agent.id, 'DEPRECATED')}
                    className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-300 text-[10px] border border-rose-500/30 transition-all"
                  >
                    Deprecate
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateAgentStatus(agent.id, 'ONLINE')}
                    className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500 hover:text-black text-emerald-300 text-[10px] border border-emerald-500/30 transition-all"
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RBAC Permission Matrix Section */}
      <div className="bg-[#0D121C] rounded-xl border border-slate-800 p-4 shadow-xl">
        <div className="flex items-center space-x-2 mb-3">
          <Key className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
            Zero-Trust Access Tier & RBAC Permission Matrix
          </h3>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left font-mono text-xs text-slate-300">
            <thead className="bg-[#0B0F17] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-2.5">Agent Codename</th>
                <th className="p-2.5">Department</th>
                <th className="p-2.5">Tier Target</th>
                <th className="p-2.5">L1 Caller Access</th>
                <th className="p-2.5">L2 Caller Access</th>
                <th className="p-2.5">L3 Caller Access</th>
                <th className="p-2.5">Cloud Run Service</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-800/30">
                  <td className="p-2.5 font-semibold text-slate-100">{agent.name}</td>
                  <td className="p-2.5 text-slate-400">{agent.department}</td>
                  <td className="p-2.5">
                    <span className={`px-1.5 py-0.5 rounded border text-[10px] ${getTierColor(agent.accessTier)}`}>
                      {agent.accessTier}
                    </span>
                  </td>
                  <td className="p-2.5">
                    {agent.accessTier === 'L1-Public' ? (
                      <span className="text-emerald-400 font-bold flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" /> <span>GRANTED</span>
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center space-x-1">
                        <AlertOctagon className="w-3.5 h-3.5" /> <span>DENIED</span>
                      </span>
                    )}
                  </td>
                  <td className="p-2.5">
                    {agent.accessTier === 'L1-Public' || agent.accessTier === 'L2-Internal' ? (
                      <span className="text-emerald-400 font-bold flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" /> <span>GRANTED</span>
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center space-x-1">
                        <AlertOctagon className="w-3.5 h-3.5" /> <span>DENIED</span>
                      </span>
                    )}
                  </td>
                  <td className="p-2.5">
                    <span className="text-emerald-400 font-bold flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5" /> <span>GRANTED</span>
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-500 font-mono text-[11px]">{agent.cloudRunService}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deploy Agent Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0D121C] border border-emerald-500/40 rounded-xl p-5 max-w-xl w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-100">
                  Deploy New Enterprise Agent
                </h3>
              </div>
              <button
                onClick={() => setShowDeployModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeploySubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">AGENT NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AuditBot-SOX-Sentinel"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-slate-700 rounded p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">DEPARTMENT</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value as Department)}
                    className="w-full bg-[#0B0F17] border border-slate-700 rounded p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Finance">Finance</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Legal">Legal</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">ZERO-TRUST ACCESS TIER</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value as AccessTier)}
                    className="w-full bg-[#0B0F17] border border-slate-700 rounded p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="L1-Public">L1-Public</option>
                    <option value="L2-Internal">L2-Internal</option>
                    <option value="L3-Restricted">L3-Restricted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ENTERPRISE ROLE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SOX Audit Verification & Policy Compliance"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-slate-700 rounded p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">DESCRIPTION</label>
                <textarea
                  rows={2}
                  placeholder="Describe agent capabilities and scope..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-slate-700 rounded p-2 text-slate-200 focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ALLOWED TOOLS (Comma-separated)</label>
                <input
                  type="text"
                  value={newAllowedTools}
                  onChange={(e) => setNewAllowedTools(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-slate-700 rounded p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">SECURITY BOUNDARY TAGS</label>
                <input
                  type="text"
                  value={newBoundaryTags}
                  onChange={(e) => setNewBoundaryTags(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-slate-700 rounded p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDeployModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-[#0B0F17] font-bold"
                >
                  Confirm & Deploy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schema Detail Modal */}
      {selectedAgentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0D121C] border border-emerald-500/40 rounded-xl p-5 max-w-xl w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold font-mono text-slate-100 uppercase">
                  {selectedAgentDetail.name} JSON Capability Schema
                </h3>
              </div>
              <button
                onClick={() => setSelectedAgentDetail(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="bg-[#0B0F17] p-3 rounded-lg border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto max-h-[300px] custom-scrollbar">
              {JSON.stringify(selectedAgentDetail.capabilitiesSchema, null, 2)}
            </pre>

            <div className="mt-3 text-right">
              <button
                onClick={() => setSelectedAgentDetail(null)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
