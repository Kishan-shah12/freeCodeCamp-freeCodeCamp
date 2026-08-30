import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Plus, 
  Globe, 
  Lock, 
  ShieldCheck, 
  Tag, 
  Clock, 
  Layers, 
  Sparkles,
  Server,
  X
} from 'lucide-react';
import { MemoryNode } from '../types/aegis';

interface MemoryBankTabProps {
  memoryNodes: MemoryNode[];
  onAddMemoryNode: (node: Partial<MemoryNode>) => void;
}

export const MemoryBankTab: React.FC<MemoryBankTabProps> = ({
  memoryNodes,
  onAddMemoryNode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartition, setSelectedPartition] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Node Form State
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryNode['category']>('POLICY');
  const [newPartition, setNewPartition] = useState<MemoryNode['partitionRegion']>('us-central1');
  const [newClassification, setNewClassification] = useState<MemoryNode['dataClassification']>('CONFIDENTIAL');

  const filteredNodes = memoryNodes.filter(node => {
    const matchesSearch = node.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPartition = selectedPartition === 'ALL' || node.partitionRegion === selectedPartition;
    const matchesCategory = selectedCategory === 'ALL' || node.category === selectedCategory;
    return matchesSearch && matchesPartition && matchesCategory;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    onAddMemoryNode({
      content: newContent,
      category: newCategory,
      partitionRegion: newPartition,
      dataClassification: newClassification,
      agentId: 'agent-secops-sentinel'
    });

    setShowAddModal(false);
    setNewContent('');
  };

  const getClassificationColor = (classification: MemoryNode['dataClassification']) => {
    switch (classification) {
      case 'RESTRICTED':
        return 'bg-rose-950 text-rose-300 border-rose-500/50';
      case 'CONFIDENTIAL':
        return 'bg-amber-950 text-amber-300 border-amber-500/50';
      case 'PUBLIC':
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-500/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold font-mono uppercase tracking-wider text-slate-100">
              Persistent State & Firestore Memory Bank
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Cross-session vectorized knowledge bank with Cloud SQL embeddings, semantic similarity scoring, and regional residency partitions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-lg font-mono text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-[#0B0F17] shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Knowledge Node</span>
        </button>
      </div>

      {/* Region Partition Summary Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[#0D121C] rounded-xl border border-slate-800 p-3.5 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold font-mono text-slate-200 uppercase">US-CENTRAL1 (IOWA)</div>
              <div className="text-[10px] font-mono text-slate-400">Primary Core & SOX Residency</div>
            </div>
          </div>
          <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
            {memoryNodes.filter(n => n.partitionRegion === 'us-central1').length} NODES
          </span>
        </div>

        <div className="bg-[#0D121C] rounded-xl border border-slate-800 p-3.5 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold font-mono text-slate-200 uppercase">EUROPE-WEST3 (FRANKFURT)</div>
              <div className="text-[10px] font-mono text-slate-400">GDPR / EU Data Sovereignty</div>
            </div>
          </div>
          <span className="text-xs font-bold font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
            {memoryNodes.filter(n => n.partitionRegion === 'europe-west3').length} NODES
          </span>
        </div>

        <div className="bg-[#0D121C] rounded-xl border border-slate-800 p-3.5 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold font-mono text-slate-200 uppercase">ASIA-EAST1 (TAIWAN)</div>
              <div className="text-[10px] font-mono text-slate-400">APAC Regional Edge Cache</div>
            </div>
          </div>
          <span className="text-xs font-bold font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            {memoryNodes.filter(n => n.partitionRegion === 'asia-east1').length} NODES
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0D121C] p-3 rounded-xl border border-slate-800 shadow-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Semantic search in vector memory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0F17] text-xs font-mono rounded-lg border border-slate-700 pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto font-mono text-xs">
          <select
            value={selectedPartition}
            onChange={(e) => setSelectedPartition(e.target.value)}
            className="bg-[#0B0F17] text-slate-300 rounded-lg border border-slate-700 p-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Cloud Partitions</option>
            <option value="us-central1">us-central1</option>
            <option value="europe-west3">europe-west3</option>
            <option value="asia-east1">asia-east1</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0B0F17] text-slate-300 rounded-lg border border-slate-700 p-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Categories</option>
            <option value="POLICY">POLICY</option>
            <option value="TAX_RULE">TAX_RULE</option>
            <option value="INCIDENT_LOG">INCIDENT_LOG</option>
            <option value="FACT">FACT</option>
            <option value="AUDIT_RECORD">AUDIT_RECORD</option>
          </select>
        </div>
      </div>

      {/* Memory Nodes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNodes.map((node) => (
          <div
            key={node.id}
            className="bg-[#0D121C] rounded-xl border border-slate-800 hover:border-emerald-500/40 p-4 shadow-xl flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-700">
                    {node.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {node.partitionRegion}
                  </span>
                </div>

                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${getClassificationColor(node.dataClassification)}`}>
                  {node.dataClassification}
                </span>
              </div>

              <p className="text-xs text-slate-200 font-mono leading-relaxed mb-3">
                {node.content}
              </p>

              {/* Vector Embedding Preview */}
              <div className="p-2 rounded bg-[#0B0F17] border border-slate-800 font-mono text-[10px]">
                <span className="text-slate-500 uppercase block mb-1">
                  Cloud SQL 768-dim Vector Sample:
                </span>
                <span className="text-emerald-400 truncate block">
                  [{Array.isArray(node.embeddingVector) && node.embeddingVector.length > 0 ? node.embeddingVector.slice(0, 6).join(', ') : '0.124, -0.441, 0.881, 0.052, -0.198, 0.312'}... (768 dims)]
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2">
              <span>ID: {node.id}</span>
              {node.similarityScore && (
                <span className="text-emerald-400 font-bold">
                  Similarity: {(node.similarityScore * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Memory Node Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0D121C] border border-emerald-500/40 rounded-xl p-5 max-w-xl w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-100">
                  Add Persistent Memory Node
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">KNOWLEDGE CONTENT</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter corporate policy, tax regulation, or security constraint..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-slate-700 rounded p-2 text-slate-200 focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">CATEGORY</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as MemoryNode['category'])}
                    className="w-full bg-[#0B0F17] border border-slate-700 rounded p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="POLICY">POLICY</option>
                    <option value="TAX_RULE">TAX_RULE</option>
                    <option value="INCIDENT_LOG">INCIDENT_LOG</option>
                    <option value="FACT">FACT</option>
                    <option value="AUDIT_RECORD">AUDIT_RECORD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">REGION PARTITION</label>
                  <select
                    value={newPartition}
                    onChange={(e) => setNewPartition(e.target.value as MemoryNode['partitionRegion'])}
                    className="w-full bg-[#0B0F17] border border-slate-700 rounded p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="us-central1">us-central1</option>
                    <option value="europe-west3">europe-west3</option>
                    <option value="asia-east1">asia-east1</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">CLASSIFICATION</label>
                  <select
                    value={newClassification}
                    onChange={(e) => setNewClassification(e.target.value as MemoryNode['dataClassification'])}
                    className="w-full bg-[#0B0F17] border border-slate-700 rounded p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                    <option value="RESTRICTED">RESTRICTED</option>
                    <option value="PUBLIC">PUBLIC</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-[#0B0F17] font-bold"
                >
                  Save to Vector Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
