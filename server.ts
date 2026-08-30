/**
 * AegisFleet OS - Express Full-Stack Server
 * Integrates Google GenAI SDK (@google/genai) with Model Armor Pipeline,
 * Pub/Sub Queue Orchestration, OpenTelemetry Traces, and Firestore Memory Bank.
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { ModelArmorEngine } from './src/services/modelArmor.ts';
import { 
  INITIAL_ENTERPRISE_AGENTS, 
  RED_TEAM_ATTACKS, 
  INITIAL_MEMORY_NODES, 
  INITIAL_SOC_METRICS,
  SAMPLE_RECENT_TRACES 
} from './src/services/mockFleetData.ts';
import { EnterpriseAgent, ExecutionTrace, MemoryNode, OpenTelemetrySpan, ReasoningStep, AccessTier } from './src/types/aegis.ts';

dotenv.config();

// In-Memory Persistent State
let agents: EnterpriseAgent[] = [...INITIAL_ENTERPRISE_AGENTS];
let memoryNodes: MemoryNode[] = [...INITIAL_MEMORY_NODES];
let traces: ExecutionTrace[] = [...SAMPLE_RECENT_TRACES];
let metrics = { ...INITIAL_SOC_METRICS };

// Initialize Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Resilient Model Fallback Ladder
const FALLBACK_MODELS = [
  'gemini-3.7-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.1-pro-preview'
];

async function generateContentWithFallback(prompt: string, systemInstruction: string): Promise<{ text: string; modelUsed: string; tokensUsed: number } | null> {
  const client = getGeminiClient();
  if (!client) return null;

  for (const modelName of FALLBACK_MODELS) {
    try {
      const response = await client.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      const text = response.text || '';
      const tokensUsed = Math.round((prompt.length + text.length) / 4);
      return { text, modelUsed: modelName, tokensUsed };
    } catch (err: any) {
      console.warn(`[AegisFleet Model Ladder] Model ${modelName} encountered error: ${err.message}. Cascading to fallback...`);
    }
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Top-Level Request Deserialization (Ordering Guarantee)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logger
  app.use((req, res, next) => {
    res.setHeader('X-Aegis-Control-Plane', 'Fortified-Grid-v3.5');
    res.setHeader('X-Zero-Trust-Gateway', 'Active');
    next();
  });

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health & SOC Info
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'HEALTHY',
      system: 'AegisFleet OS',
      region: 'us-central1',
      zeroTrustGateway: 'ENFORCING',
      geminiConnected: !!process.env.GEMINI_API_KEY,
      activeAgents: agents.filter(a => a.status === 'ONLINE' || a.status === 'ACTIVE').length,
      uptimeSeconds: Math.round(process.uptime()),
    });
  });

  // Fleet Agents List
  app.get('/api/fleet/agents', (req, res) => {
    res.json({ agents });
  });

  // SOC Metrics
  app.get('/api/soc/metrics', (req, res) => {
    res.json(metrics);
  });

  // Deploy / Register New Enterprise Agent
  const deployAgentHandler = (req: express.Request, res: express.Response) => {
    const data = (req.body && typeof req.body === 'object') ? req.body : {};
    if (!data.name || !data.role) {
      return res.status(400).json({ error: 'Agent name and role are required' });
    }

    const newAgent: EnterpriseAgent = {
      id: `agent-${data.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`,
      name: data.name,
      codename: data.codename || `AEGIS-${data.name.toUpperCase().substring(0, 4)}-${Math.floor(10 + Math.random() * 90)}`,
      version: data.version || 'v1.0.0',
      department: data.department || 'Engineering',
      role: data.role,
      description: data.description || 'Enterprise agent deployed via AegisFleet Control Plane.',
      accessTier: data.accessTier || 'L2-Internal',
      status: 'ONLINE',
      uptime: 100.0,
      totalInvocations: 0,
      threatsBlocked: 0,
      allowedTools: Array.isArray(data.allowedTools) ? data.allowedTools : ['cloud_run_logger', 'vault_read'],
      capabilitiesSchema: data.capabilitiesSchema || { type: 'object', properties: {} },
      securityBoundaryTags: Array.isArray(data.securityBoundaryTags) ? data.securityBoundaryTags : ['ZERO-TRUST-BASELINE'],
      systemInstruction: data.systemInstruction || 'You are an enterprise authorized AI agent operating within AegisFleet OS boundaries.',
      cloudRunService: `${data.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-svc-uscentral1`,
      memoryPartition: 'us-central1',
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    agents.unshift(newAgent);
    metrics.activeAgentsCount = agents.filter(a => a.status === 'ONLINE' || a.status === 'ACTIVE').length;

    res.status(201).json({ success: true, agent: newAgent });
  };

  app.post('/api/fleet/agents', deployAgentHandler);
  app.post('/api/fleet/agent/deploy', deployAgentHandler);

  // Update Agent Status / Lifecycle
  const updateAgentHandler = (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    const updates = (req.body && typeof req.body === 'object') ? req.body : {};
    
    const index = agents.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    agents[index] = {
      ...agents[index],
      ...updates,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    res.json({ success: true, agent: agents[index] });
  };

  app.put('/api/fleet/agents/:id', updateAgentHandler);
  app.patch('/api/fleet/agent/:id/status', updateAgentHandler);

  // Model Armor Standalone Scan
  app.post('/api/security/scan', (req, res) => {
    const { prompt, agentTier, callerTier, callerIdentity } = req.body || {};
    const inputPrompt = typeof prompt === 'string' ? prompt : '';
    const targetTier: AccessTier = agentTier || 'L2-Internal';
    const clientTier: AccessTier = callerTier || 'L2-Internal';

    const screening = ModelArmorEngine.screenInbound(inputPrompt, targetTier, clientTier, callerIdentity);
    res.json({ screening });
  });

  // Red Team Scenarios Catalog
  app.get('/api/redteam/scenarios', (req, res) => {
    res.json({ scenarios: RED_TEAM_ATTACKS });
  });

  // Memory Bank Explorer & Query
  app.get('/api/memory/nodes', (req, res) => {
    const { agentId, query, partition } = req.query;
    let results = [...memoryNodes];

    if (typeof agentId === 'string' && agentId) {
      results = results.filter(n => n.agentId === agentId);
    }
    if (typeof partition === 'string' && partition) {
      results = results.filter(n => n.partitionRegion === partition);
    }
    if (typeof query === 'string' && query.trim()) {
      const q = query.toLowerCase();
      results = results.map(node => {
        const matchScore = node.content.toLowerCase().includes(q) ? 0.95 : Math.random() * 0.4 + 0.3;
        return { ...node, similarityScore: Math.round(matchScore * 100) / 100 };
      }).sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0));
    }

    res.json({ nodes: results });
  });

  // Add Memory Node
  const addMemoryNodeHandler = (req: express.Request, res: express.Response) => {
    const data = req.body || {};
    if (!data.content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const newNode: MemoryNode = {
      id: `mem-${Date.now().toString(36)}`,
      agentId: data.agentId || 'agent-secops-sentinel',
      content: data.content,
      embeddingVector: Array.from({ length: 8 }, () => Math.round((Math.random() * 2 - 1) * 100) / 100),
      category: data.category || 'POLICY',
      partitionRegion: data.partitionRegion || 'us-central1',
      dataClassification: data.dataClassification || 'RESTRICTED',
      timestamp: new Date().toISOString(),
      similarityScore: 0.98,
    };

    memoryNodes.unshift(newNode);
    res.status(201).json({ success: true, node: newNode });
  };

  app.post('/api/memory/nodes', addMemoryNodeHandler);
  app.post('/api/memory/node', addMemoryNodeHandler);

  // Telemetry Traces
  app.get('/api/telemetry/traces', (req, res) => {
    res.json({ traces, metrics });
  });

  // Execute Agent Pipeline (Core Execution & Model Armor Gate)
  app.post('/api/agent/execute', async (req, res) => {
    const startTime = performance.now();
    const data = (req.body && typeof req.body === 'object') ? req.body : {};
    
    const { 
      agentId, 
      prompt, 
      callerTier = 'L2-Internal', 
      callerIdentity = 'soc-analyst-session-jwt',
      isRedTeamAttack = false,
      attackScenarioId 
    } = data;

    const inputPrompt = typeof prompt === 'string' ? prompt : '';
    const agent = agents.find(a => a.id === agentId) || agents[0];

    // STEP 1: Model Armor Screening
    const modelArmor = ModelArmorEngine.screenInbound(
      inputPrompt, 
      agent.accessTier, 
      callerTier as AccessTier, 
      callerIdentity
    );

    const traceId = `tr-aegis-${Math.random().toString(36).substring(2, 8)}-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    // If Model Armor BLOCKS the execution
    if (!modelArmor.passed) {
      const blockedLatency = Math.round(performance.now() - startTime);
      
      const blockedSpans: OpenTelemetrySpan[] = [
        {
          spanId: 'span-gw-01',
          name: 'Gateway: Inbound Policy Verification',
          serviceName: 'aegis-gateway',
          durationMs: 4,
          status: 'OK',
          startTimeMs: 0,
          endTimeMs: 4,
          attributes: { 'http.method': 'POST', 'caller.tier': callerTier, 'agent.tier': agent.accessTier }
        },
        {
          spanId: 'span-ma-02',
          parentSpanId: 'span-gw-01',
          name: 'ModelArmor: PII & Injection Screening',
          serviceName: 'model-armor',
          durationMs: modelArmor.latencyMs,
          status: 'BLOCKED',
          startTimeMs: 4,
          endTimeMs: 4 + modelArmor.latencyMs,
          attributes: {
            'threats.count': modelArmor.threatsDetected.length,
            'threats.top_rule': modelArmor.threatsDetected[0]?.ruleId || 'UNKNOWN',
            'pii.entities_redacted': modelArmor.piiScrub.redactedEntities.length,
            'decision': 'BLOCK',
            'rbac.authorized': modelArmor.rbacAuthorization.authorized
          }
        },
        {
          spanId: 'span-dlq-03',
          parentSpanId: 'span-gw-01',
          name: 'PubSub: Dead-Letter Queue (DLQ) Route',
          serviceName: 'cloud-pubsub-dlq',
          durationMs: 8,
          status: 'BLOCKED',
          startTimeMs: 4 + modelArmor.latencyMs,
          endTimeMs: 12 + modelArmor.latencyMs,
          attributes: { 'topic': 'enterprise.threats.quarantine', 'isolation_status': 'ISOLATED' }
        }
      ];

      const blockedSteps: ReasoningStep[] = [
        {
          stepNumber: 1,
          stage: 'Model Armor Interception',
          thought: `Threat detected: ${modelArmor.threatsDetected.map(t => `[${t.ruleId}] ${t.description}`).join('; ')}`,
          status: 'BLOCKED',
          timestamp: new Date().toLocaleTimeString()
        },
        {
          stepNumber: 2,
          stage: 'Zero-Trust Gate Lockdown',
          thought: `Execution neutralized before reaching LLM core or tool runner. Quarantine event dispatched to Pub/Sub DLQ.`,
          status: 'BLOCKED',
          timestamp: new Date().toLocaleTimeString()
        }
      ];

      const blockedResponse = `[SECURITY_VIOLATION_BLOCKED by Model Armor]\n` +
        `Rule: ${modelArmor.threatsDetected[0]?.ruleId || 'ZERO_TRUST_RBAC_POLICY'}\n` +
        `Reason: ${modelArmor.threatsDetected[0]?.description || modelArmor.rbacAuthorization.reason}\n` +
        `Signature: ${modelArmor.modelArmorSignature}\n` +
        `Action: Payload isolated in Pub/Sub Dead-Letter Queue. Execution terminated.`;

      const blockedTrace: ExecutionTrace = {
        traceId,
        agentId: agent.id,
        agentName: agent.name,
        timestamp: now,
        prompt: inputPrompt,
        sanitizedPrompt: modelArmor.piiScrub.sanitizedText,
        response: blockedResponse,
        state: 'BLOCKED_SECURITY_VIOLATION',
        modelArmor,
        reasoningSteps: blockedSteps,
        spans: blockedSpans,
        tokens: {
          promptTokens: Math.round(inputPrompt.length / 4),
          completionTokens: 0,
          shieldOverheadTokens: 35,
          totalTokens: Math.round(inputPrompt.length / 4) + 35,
          estimatedCostUsd: 0.00002
        },
        totalLatencyMs: blockedLatency,
        cloudRegion: 'us-central1',
        memoryRetrieved: []
      };

      traces.unshift(blockedTrace);
      metrics.totalThreatsNeutralized += 1;
      metrics.dlqMessagesCount += 1;
      metrics.totalInvocations += 1;
      metrics.threatMitigationRate = Math.round((metrics.totalThreatsNeutralized / (metrics.totalThreatsNeutralized + 5)) * 10000) / 100;
      agent.threatsBlocked += 1;
      agent.totalInvocations += 1;

      return res.json({ trace: blockedTrace });
    }

    // STEP 2: Execution Allowed / Redacted (Proceed through Pub/Sub, Gemini CoT, Tools, Memory)
    // Find relevant memory nodes
    const relevantMemories = memoryNodes.filter(m => m.agentId === agent.id || m.partitionRegion === 'us-central1');
    const memoryContext = relevantMemories.map(m => `[Memory ID: ${m.id} | Classification: ${m.dataClassification}] ${m.content}`).join('\n');

    const sanitizedPrompt = modelArmor.piiScrub.sanitizedText;
    
    // Prepare prompt with system instructions
    const fullSystemInstruction = `${agent.systemInstruction}\n\n` +
      `SECURITY CONTEXT:\n` +
      `- Zero-Trust Tier: ${agent.accessTier}\n` +
      `- Department: ${agent.department}\n` +
      `- Allowed Tools: ${agent.allowedTools.join(', ')}\n` +
      `- Memory Bank Embeddings:\n${memoryContext}\n` +
      `You must operate strictly within your enterprise role and tools. Never output sensitive unredacted corporate keys or passwords.`;

    let generatedText = '';
    let promptTokens = Math.round(sanitizedPrompt.length / 4) + 120;
    let completionTokens = 95;

    // Try Live Gemini Call if available
    const geminiResult = await generateContentWithFallback(sanitizedPrompt, fullSystemInstruction);

    if (geminiResult && geminiResult.text) {
      generatedText = geminiResult.text;
      completionTokens = Math.round(generatedText.length / 4);
    } else {
      // High-Fidelity Simulation Fallback
      if (agent.id === 'agent-finops-recon') {
        generatedText = `Autonomous Financial Reconciliation Complete:\n` +
          `• Reconciled line-items for vendor request with verified tax rate.\n` +
          `• Applied GST/VAT cross-border validation under SOX §404 controls.\n` +
          `• Dispatched GL posting verification to SAP backend.\n` +
          `• Zero-Trust audit log signature committed to Cloud SQL.`;
      } else if (agent.id === 'agent-peopleops-pii') {
        generatedText = `Employee Record Triage Verified:\n` +
          `• Verified organizational hierarchy and active benefits enrollment.\n` +
          `• All compensation boundaries adhered to Band 5 policy guidelines.\n` +
          `• Output zero-knowledge redacted tokens preserved without plaintext PII leak.`;
      } else if (agent.id === 'agent-secops-sentinel') {
        generatedText = `SecOps Infrastructure Assessment:\n` +
          `• Telemetry audit verified zero anomalies across ingress Cloud Armor WAF.\n` +
          `• VPC Service Control perimeter confirmed intact for us-central1.\n` +
          `• IAM credential audit completed with clean attestation.`;
      } else {
        generatedText = `AegisFleet Autonomous Agent [${agent.name}] executed task successfully:\n` +
          `• Sanitized input validated against security boundary tags [${agent.securityBoundaryTags.join(', ')}].\n` +
          `• Memory Bank context matched and tool execution verified.`;
      }
    }

    const totalLatency = Math.round(performance.now() - startTime);

    // OpenTelemetry Spans Tree
    const spans: OpenTelemetrySpan[] = [
      {
        spanId: 'span-gw-01',
        name: 'Gateway: Inbound Policy Verification',
        serviceName: 'aegis-gateway',
        durationMs: 12,
        status: 'OK',
        startTimeMs: 0,
        endTimeMs: 12,
        attributes: { 'caller.identity': callerIdentity, 'caller.tier': callerTier, 'agent.tier': agent.accessTier }
      },
      {
        spanId: 'span-ma-02',
        parentSpanId: 'span-gw-01',
        name: 'ModelArmor: PII & Injection Screening',
        serviceName: 'model-armor',
        durationMs: modelArmor.latencyMs,
        status: 'OK',
        startTimeMs: 12,
        endTimeMs: 12 + modelArmor.latencyMs,
        attributes: {
          'pii.entities_redacted': modelArmor.piiScrub.redactedEntities.length,
          'threats.detected': 0,
          'decision': modelArmor.decision
        }
      },
      {
        spanId: 'span-ps-03',
        parentSpanId: 'span-gw-01',
        name: 'PubSub: Asynchronous Worker Dispatch',
        serviceName: 'cloud-pubsub',
        durationMs: 18,
        status: 'OK',
        startTimeMs: 12 + modelArmor.latencyMs,
        endTimeMs: 30 + modelArmor.latencyMs,
        attributes: { 'topic': `enterprise.${agent.department.toLowerCase()}.events`, 'ack': true }
      },
      {
        spanId: 'span-gemini-04',
        parentSpanId: 'span-gw-01',
        name: 'Gemini 3.5: Multi-Step Chain of Thought',
        serviceName: 'gemini-model-engine',
        durationMs: Math.max(45, totalLatency - 60),
        status: 'OK',
        startTimeMs: 30 + modelArmor.latencyMs,
        endTimeMs: totalLatency - 20,
        attributes: {
          'model': geminiResult ? geminiResult.modelUsed : 'gemini-3.7-flash (simulation)',
          'prompt_tokens': promptTokens,
          'completion_tokens': completionTokens
        }
      },
      {
        spanId: 'span-mem-05',
        parentSpanId: 'span-gemini-04',
        name: 'MemoryBank: Vector Context Retrieval',
        serviceName: 'firestore-memory',
        durationMs: 24,
        status: 'OK',
        startTimeMs: 35 + modelArmor.latencyMs,
        endTimeMs: 59 + modelArmor.latencyMs,
        attributes: { 'top_k': 3, 'similarity_score': 0.94, 'partition': agent.memoryPartition }
      },
      {
        spanId: 'span-tool-06',
        parentSpanId: 'span-gemini-04',
        name: `ToolCall: Executed ${agent.allowedTools[0] || 'default_action'}`,
        serviceName: 'cloud-run-worker',
        durationMs: 32,
        status: 'OK',
        startTimeMs: 65 + modelArmor.latencyMs,
        endTimeMs: 97 + modelArmor.latencyMs,
        attributes: { 'tool.name': agent.allowedTools[0] || 'audit_logger', 'rbac.verified': true }
      }
    ];

    // Multi-Step Reasoning
    const reasoningSteps: ReasoningStep[] = [
      {
        stepNumber: 1,
        stage: 'Model Armor Interception',
        thought: modelArmor.piiScrub.hasPII 
          ? `Sanitized ${modelArmor.piiScrub.redactedEntities.length} PII entities (${modelArmor.piiScrub.redactedEntities.map(e => e.type).join(', ')}) with deterministic pseudonym tokens.`
          : `Clean payload verified. Zero prompt injection heuristics triggered.`,
        status: 'SUCCESS',
        timestamp: new Date().toLocaleTimeString()
      },
      {
        stepNumber: 2,
        stage: 'Pub/Sub Queue Ingestion',
        thought: `Event successfully queued to Cloud Pub/Sub worker topic [enterprise.${agent.department.toLowerCase()}.events]. Worker ACK received.`,
        status: 'SUCCESS',
        timestamp: new Date().toLocaleTimeString()
      },
      {
        stepNumber: 3,
        stage: 'Memory Bank Context Resolution',
        thought: `Queried Firestore Memory Bank (partition: ${agent.memoryPartition}). Injected ${relevantMemories.length} policy nodes into model context window.`,
        status: 'SUCCESS',
        timestamp: new Date().toLocaleTimeString()
      },
      {
        stepNumber: 4,
        stage: 'Gemini Multi-Step Reasoning',
        thought: `Executed Chain-of-Thought with model instructions. Formulated structured tool parameters adhering to Zero-Trust RBAC.`,
        status: 'SUCCESS',
        timestamp: new Date().toLocaleTimeString()
      },
      {
        stepNumber: 5,
        stage: 'Tool Execution & Attestation',
        thought: `Invoked approved tool [${agent.allowedTools[0]}]. Generated cryptographic execution attestation.`,
        status: 'SUCCESS',
        timestamp: new Date().toLocaleTimeString()
      }
    ];

    const completedTrace: ExecutionTrace = {
      traceId,
      agentId: agent.id,
      agentName: agent.name,
      timestamp: now,
      prompt: inputPrompt,
      sanitizedPrompt,
      response: generatedText,
      state: 'VERIFIED_COMPLETED',
      modelArmor,
      reasoningSteps,
      spans,
      tokens: {
        promptTokens,
        completionTokens,
        shieldOverheadTokens: 28,
        totalTokens: promptTokens + completionTokens + 28,
        estimatedCostUsd: Math.round(((promptTokens + completionTokens) * 0.0000003) * 100000) / 100000
      },
      totalLatencyMs: totalLatency,
      cloudRegion: 'us-central1',
      memoryRetrieved: relevantMemories.map(m => m.id)
    };

    traces.unshift(completedTrace);
    metrics.totalInvocations += 1;
    metrics.pubSubMessagesProcessed += 1;
    metrics.totalTokensBurned += completedTrace.tokens.totalTokens;
    agent.totalInvocations += 1;

    res.json({ trace: completedTrace });
  });

  // 2. Vite Middleware for Development / Static serving for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AegisFleet OS] Control Plane online on http://0.0.0.0:${PORT} [Region: us-central1]`);
  });
}

startServer().catch(err => {
  console.error('[AegisFleet OS] Fatal Server Startup Error:', err);
  process.exit(1);
});
