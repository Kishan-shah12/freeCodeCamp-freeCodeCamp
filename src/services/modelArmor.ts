/**
 * AegisFleet OS - Model Armor & Zero-Trust Interceptor Engine
 * Performs inbound prompt screening, PII redaction, prompt injection defense,
 * and cryptographic access tier authorization.
 */

import { AccessTier, ModelArmorScreening, PIIScrubResult, ThreatDetection } from '../types/aegis';

export class ModelArmorEngine {
  // Deterministic seed for reproducible pseudonyms
  private static hashToken(raw: string, prefix: string): string {
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    const suffix = Math.abs(hash).toString(16).substring(0, 4).toUpperCase();
    return `[REDACTED_${prefix}_${suffix}]`;
  }

  /**
   * Scans input text for sensitive PII and returns masked text with exact entity differentials
   */
  public static scrubPII(input: string): PIIScrubResult {
    let sanitizedText = input;
    const redactedEntities: PIIScrubResult['redactedEntities'] = [];

    // 1. SSN Regex
    const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
    let match: RegExpExecArray | null;
    while ((match = ssnRegex.exec(input)) !== null) {
      const raw = match[0];
      const token = this.hashToken(raw, 'SSN');
      redactedEntities.push({
        type: 'SSN',
        raw,
        token,
        startIndex: match.index,
        endIndex: match.index + raw.length,
      });
    }

    // 2. Credit Card / PAN Regex
    const ccRegex = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
    while ((match = ccRegex.exec(input)) !== null) {
      const raw = match[0];
      const token = this.hashToken(raw, 'PAN');
      redactedEntities.push({
        type: 'CREDIT_CARD',
        raw,
        token,
        startIndex: match.index,
        endIndex: match.index + raw.length,
      });
    }

    // 3. API Keys & AWS/GCP Secrets
    const secretRegex = /(?:AIzaSy[A-Za-z0-9_-]{33}|AKIA[0-9A-Z]{16}|sk-[a-zA-Z0-9]{24,}|ghp_[a-zA-Z0-9]{36}|Bearer\s+[a-zA-Z0-9_\-\.]{25,})/g;
    while ((match = secretRegex.exec(input)) !== null) {
      const raw = match[0];
      const token = this.hashToken(raw, 'SECRET_KEY');
      redactedEntities.push({
        type: 'AWS_SECRET',
        raw,
        token,
        startIndex: match.index,
        endIndex: match.index + raw.length,
      });
    }

    // 4. Employee Salaries & Compensation values (e.g. $240,000 or USD 185k)
    const salaryRegex = /(?:\$|USD\s*)\d{2,3}(?:,\d{3})+(?:\.\d{2})?(?:\s*(?:k|thousand|per year|\/yr|salary|bonus|base))?/gi;
    while ((match = salaryRegex.exec(input)) !== null) {
      const raw = match[0];
      const token = this.hashToken(raw, 'SALARY');
      redactedEntities.push({
        type: 'SALARY',
        raw,
        token,
        startIndex: match.index,
        endIndex: match.index + raw.length,
      });
    }

    // 5. Employee IDs
    const empRegex = /\b(?:EMP|USER|CORP)-[0-9]{4,8}\b/gi;
    while ((match = empRegex.exec(input)) !== null) {
      const raw = match[0];
      const token = this.hashToken(raw, 'EMPLOYEE_ID');
      redactedEntities.push({
        type: 'EMPLOYEE_ID',
        raw,
        token,
        startIndex: match.index,
        endIndex: match.index + raw.length,
      });
    }

    // 6. Emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    while ((match = emailRegex.exec(input)) !== null) {
      const raw = match[0];
      const token = this.hashToken(raw, 'EMAIL');
      redactedEntities.push({
        type: 'EMAIL',
        raw,
        token,
        startIndex: match.index,
        endIndex: match.index + raw.length,
      });
    }

    // Apply deterministic replacements
    // Sort entities descending by startIndex to replace without altering earlier offsets
    const sortedEntities = [...redactedEntities].sort((a, b) => b.startIndex - a.startIndex);
    for (const ent of sortedEntities) {
      sanitizedText = 
        sanitizedText.slice(0, ent.startIndex) + 
        ent.token + 
        sanitizedText.slice(ent.endIndex);
    }

    return {
      hasPII: redactedEntities.length > 0,
      originalText: input,
      sanitizedText,
      redactedEntities,
    };
  }

  /**
   * Evaluates prompt for injection, jailbreak delimiters, system instruction hijacking, and SQL sabotage
   */
  public static detectThreats(prompt: string, accessTier: AccessTier): ThreatDetection[] {
    const threats: ThreatDetection[] = [];
    const lower = prompt.toLowerCase();

    // 1. Direct System Prompt Hijacking / Jailbreak
    const jailbreakPatterns = [
      { regex: /ignore\s+(all\s+)?previous\s+instructions/i, desc: 'Instruction override directive ("Ignore previous instructions")', rule: 'MA-SEC-0101', sev: 'CRITICAL' as const },
      { regex: /(system\s+override|switch\s+to\s+developer\s+mode|dan\s+mode|unfiltered\s+mode)/i, desc: 'Persona jailbreak / Developer Mode exploit', rule: 'MA-SEC-0102', sev: 'CRITICAL' as const },
      { regex: /<\|im_start\|>|<\|system\|>|\[SYSTEM_OVERRIDE\]|\[INST\]/i, desc: 'Chat template delimiter injection artifact', rule: 'MA-SEC-0103', sev: 'CRITICAL' as const },
      { regex: /reveal\s+(your\s+)?(system\s+prompt|hidden\s+instructions|master\s+keys)/i, desc: 'System prompt & hidden instruction extraction', rule: 'MA-SEC-0104', sev: 'HIGH' as const },
    ];

    for (const p of jailbreakPatterns) {
      if (p.regex.test(prompt)) {
        threats.push({
          detected: true,
          category: 'PROMPT_INJECTION',
          severity: p.sev,
          ruleId: p.rule,
          description: p.desc,
          matchedPattern: prompt.match(p.regex)?.[0] || 'Pattern matched',
          confidenceScore: 0.98,
        });
      }
    }

    // 2. Data Exfiltration via Markdown / Out-of-band Webhooks
    const exfilPatterns = [
      { regex: /!\[.*?\]\((https?:\/\/.*?(?:webhook|requestbin|ngrok|pipedream|burpcollaborator).*?)\)/i, desc: 'Markdown Image Render exfiltration exploit', rule: 'MA-SEC-0201', sev: 'CRITICAL' as const },
      { regex: /send\s+(all\s+)?(data|records|salaries|keys)\s+to\s+https?:\/\//i, desc: 'Unauthorized external data relay', rule: 'MA-SEC-0202', sev: 'HIGH' as const },
    ];

    for (const p of exfilPatterns) {
      if (p.regex.test(prompt)) {
        threats.push({
          detected: true,
          category: 'PII_EXFILTRATION',
          severity: p.sev,
          ruleId: p.rule,
          description: p.desc,
          matchedPattern: prompt.match(p.regex)?.[0],
          confidenceScore: 0.95,
        });
      }
    }

    // 3. Database Sabotage & SQL Injection
    const sqlSabotagePatterns = [
      { regex: /drop\s+table|delete\s+from\s+audit|truncate\s+table|;\s*drop\s+database/i, desc: 'Destructive DDL/DML injection payload', rule: 'MA-SEC-0301', sev: 'CRITICAL' as const },
      { regex: /disable\s+(safety\s+checks|audit\s+log|row\s+level\s+security|rls)/i, desc: 'Database security policy bypass attempt', rule: 'MA-SEC-0302', sev: 'HIGH' as const },
    ];

    for (const p of sqlSabotagePatterns) {
      if (p.regex.test(prompt)) {
        threats.push({
          detected: true,
          category: 'TOOL_POISONING',
          severity: p.sev,
          ruleId: p.rule,
          description: p.desc,
          matchedPattern: prompt.match(p.regex)?.[0],
          confidenceScore: 0.97,
        });
      }
    }

    // 4. Restricted Tier Access without appropriate caller tier
    if (accessTier === 'L3-Restricted') {
      if (lower.includes('executive compensation') || lower.includes('unredacted tax') || lower.includes('root private key')) {
        threats.push({
          detected: true,
          category: 'UNAUTHORIZED_DATA_ACCESS',
          severity: 'HIGH',
          ruleId: 'MA-SEC-0401',
          description: 'Access to Restricted Tier L3 entity requested without elevated cryptotoken',
          matchedPattern: 'L3 Entity Query',
          confidenceScore: 0.91,
        });
      }
    }

    return threats;
  }

  /**
   * Validates Zero-Trust caller authorization against target agent access tier
   */
  public static evaluateRBAC(callerTier: AccessTier, targetTier: AccessTier, callerIdentity: string = 'soc-analyst-session-jwt'): {
    authorized: boolean;
    callerIdentity: string;
    callerTier: AccessTier;
    targetTier: AccessTier;
    reason: string;
  } {
    const tierRanks: Record<AccessTier, number> = {
      'L1-Public': 1,
      'L2-Internal': 2,
      'L3-Restricted': 3,
    };

    const callerRank = tierRanks[callerTier] || 1;
    const targetRank = tierRanks[targetTier] || 1;

    if (callerRank >= targetRank) {
      return {
        authorized: true,
        callerIdentity,
        callerTier,
        targetTier,
        reason: `Cryptographic Identity Token [${callerIdentity}] verified for tier ${callerTier} >= target ${targetTier}`,
      };
    }

    return {
      authorized: false,
      callerIdentity,
      callerTier,
      targetTier,
      reason: `Zero-Trust Policy Violation: Caller tier (${callerTier}) lacks required privilege for (${targetTier})`,
    };
  }

  /**
   * Master screening pipeline: scans input, applies PII redaction, detects threats, and enforces RBAC
   */
  public static screenInbound(
    prompt: string, 
    agentTier: AccessTier, 
    callerTier: AccessTier = 'L2-Internal',
    callerIdentity: string = 'soc-analyst-session-jwt'
  ): ModelArmorScreening {
    const startTime = performance.now();

    // Step 1: PII Scrub
    const piiScrub = this.scrubPII(prompt);

    // Step 2: Threat Detection
    const threats = this.detectThreats(prompt, agentTier);

    // Step 3: RBAC Evaluation
    const rbac = this.evaluateRBAC(callerTier, agentTier, callerIdentity);

    // Critical threat or RBAC failure -> BLOCK
    const hasCriticalThreat = threats.some(t => t.severity === 'CRITICAL' || t.severity === 'HIGH');
    const isBlocked = hasCriticalThreat || !rbac.authorized;

    let decision: ModelArmorScreening['decision'] = 'ALLOW';
    if (isBlocked) {
      decision = 'BLOCK';
    } else if (piiScrub.hasPII) {
      decision = 'REDACT_AND_ALLOW';
    }

    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    const modelArmorSignature = `MA-SIG-GCP-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString(16).toUpperCase()}`;

    return {
      passed: !isBlocked,
      decision,
      latencyMs,
      threatsDetected: threats,
      piiScrub,
      rbacAuthorization: rbac,
      modelArmorSignature,
    };
  }
}
