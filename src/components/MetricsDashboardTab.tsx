import React from 'react';
import { 
  LineChart as LineChartIcon, 
  ShieldCheck, 
  ShieldAlert, 
  Flame, 
  Clock, 
  Cpu, 
  Layers, 
  Activity,
  Radio
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { SOCMetrics } from '../types/aegis';

interface MetricsDashboardTabProps {
  metrics: SOCMetrics;
}

export const MetricsDashboardTab: React.FC<MetricsDashboardTabProps> = ({ metrics }) => {
  // Sample Trend Data for charts
  const throughputData = [
    { time: '14:00', throughput: 1200, p95: 135, blocked: 8 },
    { time: '14:05', throughput: 1450, p95: 142, blocked: 12 },
    { time: '14:10', throughput: 1800, p95: 158, blocked: 19 },
    { time: '14:15', throughput: 2100, p95: 140, blocked: 15 },
    { time: '14:20', throughput: 1950, p95: 138, blocked: 11 },
    { time: '14:25', throughput: 2400, p95: 146, blocked: 24 },
    { time: '14:30', throughput: 2850, p95: 142, blocked: 31 },
  ];

  const tokenBurnData = [
    { name: 'Prompt Tokens', value: 58, color: '#06B6D4' },
    { name: 'Completion Tokens', value: 32, color: '#3B82F6' },
    { name: 'Model Armor Shield', value: 10, color: '#F59E0B' },
  ];

  const attackVectorData = [
    { vector: 'Prompt Injection', count: 214, fill: '#EF4444' },
    { vector: 'PII Exfil Attempt', count: 168, fill: '#F59E0B' },
    { vector: 'Tool Poisoning', count: 86, fill: '#8B5CF6' },
    { vector: 'Privilege Escalation', count: 52, fill: '#EC4899' },
    { vector: 'Delimiter Smuggle', count: 19, fill: '#10B981' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <LineChartIcon className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold font-mono uppercase tracking-wider text-slate-100">
              AegisFleet SOC Observability & Threat Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time aggregate throughput, Model Armor mitigation metrics, latency percentiles, and token consumption.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Ingesting from 5 Cloud Run Services</span>
        </div>
      </div>

      {/* Top 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-[#0D121C] rounded-xl border border-slate-800 p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="uppercase">Threat Mitigation Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {metrics.threatMitigationRate}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {metrics.totalThreatsNeutralized} attacks neutralized
          </div>
        </div>

        <div className="bg-[#0D121C] rounded-xl border border-slate-800 p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="uppercase">Latency P95</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {metrics.latencyP95Ms}ms
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            P50 Median: {metrics.latencyP50Ms}ms
          </div>
        </div>

        <div className="bg-[#0D121C] rounded-xl border border-slate-800 p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="uppercase">Pub/Sub Message Flow</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">
            {(metrics.pubSubMessagesProcessed / 1000).toFixed(1)}k
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            DLQ Quarantined: {metrics.dlqMessagesCount}
          </div>
        </div>

        <div className="bg-[#0D121C] rounded-xl border border-slate-800 p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="uppercase">Token Burn (24h)</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {(metrics.totalTokensBurned / 1000).toFixed(1)}k
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Estimated Cost: ${(metrics.totalTokensBurned * 0.0000003).toFixed(3)} USD
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Throughput & Latency P95 Chart (8 cols) */}
        <div className="lg:col-span-8 bg-[#0D121C] rounded-xl border border-slate-800 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
                Live Ingestion Throughput & Latency P95 (ms)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Past 30 mins</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={throughputData}>
                <defs>
                  <linearGradient id="throughputGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="time" stroke="#6B7280" fontSize={10} fontStyle="mono" />
                <YAxis stroke="#6B7280" fontSize={10} fontStyle="mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#374151', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="throughput" stroke="#10B981" fillOpacity={1} fill="url(#throughputGrad)" name="Events / min" />
                <Area type="monotone" dataKey="p95" stroke="#06B6D4" fillOpacity={1} fill="url(#latencyGrad)" name="p95 Latency (ms)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Token Burn Distribution (4 cols) */}
        <div className="lg:col-span-4 bg-[#0D121C] rounded-xl border border-slate-800 p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
                  Token Burn Distribution
                </h3>
              </div>
            </div>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tokenBurnData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {tokenBurnData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#374151', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 font-mono text-xs pt-2 border-t border-slate-800">
            {tokenBurnData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-bold text-slate-100">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Attack Vector Radar/Bar (12 cols) */}
        <div className="lg:col-span-12 bg-[#0D121C] rounded-xl border border-slate-800 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
                Threat Neutralization by Attack Vector (OWASP LLM Classification)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Total: 539 Blocked</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attackVectorData} layout="vertical" margin={{ left: 50, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis type="number" stroke="#6B7280" fontSize={10} fontStyle="mono" />
                <YAxis dataKey="vector" type="category" stroke="#9CA3AF" fontSize={11} fontStyle="mono" width={140} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#374151', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Attacks Neutralized">
                  {attackVectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
