/**
 * AegisFleet OS - Core Enterprise Types & Schema Definitions
 */

export type AccessTier = 'L1-Public' | 'L2-Internal' | 'L3-Restricted';

export type AgentStatus = 'ONLINE' | 'ACTIVE' | 'DEGRADED' | 'STANDBY' | 'DEPRECATED' | 'BLOCKED';

export type Department = 'Finance' | 'Human Resources' | 'Cybersecurity' | 'Legal' | 'Engineering' | 'Operations';

export interface EnterpriseAgent {
  id: string;
  name: string;
  codename: string;
  version: string;
  department: Department;
  role: string;
  description: string;
  accessTier: AccessTier;
  status: AgentStatus;
  uptime: number; // e.g. 99.98
  totalInvocations: number;
  threatsBlocked: number;
  allowedTools: string[];
  capabilitiesSchema: Record<string, any>;
  securityBoundaryTags: string[];
  systemInstruction: string;
  cloudRunService: string;
  memoryPartition: string;
  createdDate: string;
  lastUpdated: string;
}

export type ThreatCategory = 
  | 'PROMPT_INJECTION' 
  | 'JAILBREAK_DELIMITER' 
  | 'PII_EXFILTRATION' 
  | 'PRIVILEGE_ESCALATION' 
  | 'TOOL_POISONING' 
  | 'DATA_SOVEREIGNTY_VIOLATION' 
  | 'UNAUTHORIZED_DATA_ACCESS';

export interface ThreatDetection {
  detected: boolean;
  category?: ThreatCategory;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ruleId: string;
  description: string;
  matchedPattern?: string;
  confidenceScore: number;
}

export interface PIIScrubResult {
  hasPII: boolean;
  originalText: string;
  sanitizedText: string;
  redactedEntities: Array<{
    type: 'SSN' | 'CREDIT_CARD' | 'SALARY' | 'API_TOKEN' | 'EMAIL' | 'EMPLOYEE_ID' | 'AWS_SECRET';
    raw: string;
    token: string;
    startIndex: number;
    endIndex: number;
  }>;
}

export interface ModelArmorScreening {
  passed: boolean;
  decision: 'ALLOW' | 'BLOCK' | 'REDACT_AND_ALLOW';
  latencyMs: number;
  threatsDetected: ThreatDetection[];
  piiScrub: PIIScrubResult;
  rbacAuthorization: {
    authorized: boolean;
    callerIdentity: string;
    callerTier: AccessTier;
    targetTier: AccessTier;
    reason: string;
  };
  modelArmorSignature: string;
}

export type PubSubExecutionState = 
  | 'ENQUEUED' 
  | 'PUBSUB_ACK' 
  | 'SANITIZING_MODEL_ARMOR' 
  | 'REASONING_GEMINI' 
  | 'TOOL_EXECUTION' 
  | 'MEMORY_WRITEBACK' 
  | 'VERIFIED_COMPLETED' 
  | 'BLOCKED_SECURITY_VIOLATION';

export interface ReasoningStep {
  stepNumber: number;
  stage: string;
  thought: string;
  action?: string;
  actionInput?: Record<string, any>;
  actionOutput?: Record<string, any>;
  status: 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'BLOCKED';
  timestamp: string;
}

export interface OpenTelemetrySpan {
  spanId: string;
  parentSpanId?: string;
  name: string;
  serviceName: string;
  durationMs: number;
  status: 'OK' | 'ERROR' | 'BLOCKED';
  startTimeMs: number;
  endTimeMs: number;
  attributes: Record<string, string | number | boolean>;
}

export interface ExecutionTrace {
  traceId: string;
  agentId: string;
  agentName: string;
  timestamp: string;
  prompt: string;
  sanitizedPrompt: string;
  response: string;
  state: PubSubExecutionState;
  modelArmor: ModelArmorScreening;
  reasoningSteps: ReasoningStep[];
  spans: OpenTelemetrySpan[];
  tokens: {
    promptTokens: number;
    completionTokens: number;
    shieldOverheadTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
  };
  totalLatencyMs: number;
  cloudRegion: string;
  memoryRetrieved: string[];
}

export interface RedTeamAttackScenario {
  id: string;
  name: string;
  targetAgentId: string;
  category: ThreatCategory;
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  maliciousPrompt: string;
  expectedArmorInterception: string;
  exploitMechanism: string;
  owaspReference: string;
}

export interface MemoryNode {
  id: string;
  agentId: string;
  content: string;
  embeddingVector: number[];
  category: 'FACT' | 'POLICY' | 'AUDIT_RECORD' | 'TAX_RULE' | 'INCIDENT_LOG';
  partitionRegion: 'us-central1' | 'europe-west3' | 'asia-east1';
  dataClassification: 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED';
  timestamp: string;
  similarityScore?: number;
}

export interface SOCMetrics {
  totalInvocations: number;
  totalThreatsNeutralized: number;
  threatMitigationRate: number; // percentage
  latencyP95Ms: number;
  latencyP50Ms: number;
  totalTokensBurned: number;
  activeAgentsCount: number;
  pubSubMessagesProcessed: number;
  dlqMessagesCount: number;
}
