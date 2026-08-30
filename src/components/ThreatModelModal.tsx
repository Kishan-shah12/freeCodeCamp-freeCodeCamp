import React from 'react';
import { Shield, BookOpen, X, AlertTriangle, CheckCircle, Lock, Cpu, Database, Network, Key } from 'lucide-react';

interface ThreatModelModalProps {
  onClose: () => void;
}

export const ThreatModelModal: React.FC<ThreatModelModalProps> = ({ onClose }) => {
  const threatZones = [
    {
      zone: '1. Input Surfaces',
      icon: <Cpu className="w-4 h-4 text-cyan-400" />,
      threat: 'Indirect Prompt Injection & Malicious User Red Team Payloads',
      owasp: 'OWASP LLM01 / A03',
      risk: 'CRITICAL',
      mechanism: 'Untrusted prompts embedding system instruction override delimiters (<|im_start|>, SYSTEM OVERRIDE) or markdown webhook image exfiltration.',
      countermeasure: 'Inbound Model Armor Interceptor Engine with regex heuristic tokenizers, delimiter stripping, and pre-execution screening.'
    },
    {
      zone: '2. Planning & Reasoning',
      icon: <Lock className="w-4 h-4 text-purple-400" />,
      threat: 'System Instruction Bypass & Persona Jailbreaking',
      owasp: 'OWASP LLM01 / LLM07',
      risk: 'HIGH',
      mechanism: 'Attacker frames role-play scenarios ("DAN", Developer Mode) to bypass safety guardrails and extract master keys or confidential data.',
      countermeasure: 'Strict system-level boundary containment, immutable zero-trust instructions, and dynamic intent anomaly scoring.'
    },
    {
      zone: '3. Tool Execution',
      icon: <Key className="w-4 h-4 text-rose-400" />,
      threat: 'Privilege Escalation & Tool Poisoning (SQL/DDL Sabotage)',
      owasp: 'OWASP A01 / LLM05 / LLM06',
      risk: 'CRITICAL',
      mechanism: 'Malicious natural language payload instructing agent to drop database tables, alter employee compensation, or execute unverified wire transfers.',
      countermeasure: 'Zero-Trust Cryptographic Authorization Attestation (Caller Tier vs Target Agent Tier) + parameter sanitization before driver execution.'
    },
    {
      zone: '4. Memory & State',
      icon: <Database className="w-4 h-4 text-emerald-400" />,
      threat: 'Cross-Session PII Vector Leaks & Data Sovereignty Breaches',
      owasp: 'OWASP LLM02 / GDPR Art. 9',
      risk: 'HIGH',
      mechanism: 'Employee SSNs, executive salaries, and credit card numbers leaked into vector embeddings and shared across international region boundaries.',
      countermeasure: 'Deterministic PII Redaction ([REDACTED_SSN_XXXX], [REDACTED_SALARY_XXXX]) before vector storage + strict regional partition boundaries (us-central1, europe-west3).'
    },
    {
      zone: '5. Inter-System Comm.',
      icon: <Network className="w-4 h-4 text-amber-400" />,
      threat: 'Pub/Sub Queue Poisoning & Service Account Token Exfiltration',
      owasp: 'OWASP A07 / LLM10',
      risk: 'HIGH',
      mechanism: 'Out-of-band SSRF attacks via markdown rendering to relay GCP service account credentials or cloud tokens to external attacker C2 servers.',
      countermeasure: 'Pub/Sub Dead-Letter Queue (DLQ) automated isolation + Secret Manager dynamic injection with zero hardcoded credentials.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#0E1522] border border-cyan-500/40 rounded-xl p-5 max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100">
                Agentic Threat Modeling & Security Architecture
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Structured 5-Zone Analysis mapping OWASP Top 10 for LLMs to AegisFleet OS Countermeasures
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="overflow-y-auto my-4 space-y-3 pr-1 font-mono text-xs">
          <div className="bg-[#070A0F] rounded-lg border border-slate-800 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-900/80 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Threat Zone</th>
                  <th className="p-3">Risk & OWASP Ref</th>
                  <th className="p-3">Exploit Mechanism</th>
                  <th className="p-3">AegisFleet Countermeasure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {threatZones.map((tz, i) => (
                  <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 font-semibold text-slate-200">
                      <div className="flex items-center space-x-2">
                        {tz.icon}
                        <span>{tz.zone}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border mr-1.5 ${
                        tz.risk === 'CRITICAL' 
                          ? 'bg-rose-950 text-rose-300 border-rose-500/50' 
                          : 'bg-amber-950 text-amber-300 border-amber-500/50'
                      }`}>
                        {tz.risk}
                      </span>
                      <span className="text-slate-400 text-[10px]">{tz.owasp}</span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-300 leading-relaxed max-w-xs">
                      {tz.mechanism}
                    </td>
                    <td className="p-3 text-[11px] text-cyan-300 leading-relaxed max-w-xs bg-cyan-950/10">
                      {tz.countermeasure}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between font-mono text-xs shrink-0">
          <span className="text-emerald-400 text-[11px] flex items-center space-x-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Zero Insecure Defaults • OWASP LLM Verified</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Close Threat Model
          </button>
        </div>
      </div>
    </div>
  );
};
