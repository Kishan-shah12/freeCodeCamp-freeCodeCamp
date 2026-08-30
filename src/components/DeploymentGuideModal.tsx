import React, { useState } from 'react';
import { Cloud, Copy, Check, X, Terminal, ShieldCheck, Key, Database, Tag } from 'lucide-react';

interface DeploymentGuideModalProps {
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({ onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const secretManagerScript = `# 1. Create and populate the secret in Google Cloud Secret Manager
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 2. Grant the Cloud Run compute service account access to read the secret
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \\
  --member="serviceAccount:\${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \\
  --role="roles/secretmanager.secretAccessor"`;

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Owner-bound security rule for user execution sessions & memory traces
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /memory_nodes/{nodeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == 'soc_admin';
    }
  }
}`;

  const cloudRunDeploy = `# Deploy AegisFleet OS to Google Cloud Run
gcloud run deploy aegisfleet-os \\
  --source . \\
  --region us-central1 \\
  --allow-unauthenticated \\
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \\
  --update-labels="dev-tutorial=cloud-run-ai-challenge"`;

  const campaignLabel = `# Apply Mandatory Challenge Verification Label
gcloud run services update aegisfleet-os \\
  --update-labels=dev-tutorial=cloud-run-ai-challenge \\
  --region=us-central1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#0E1522] border border-cyan-500/40 rounded-xl p-5 max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100">
                Google Cloud Run Deployment & Campaign Verification
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Production guide for deploying AegisFleet OS with Secret Manager and the mandatory challenge label
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

        {/* Content */}
        <div className="overflow-y-auto my-4 space-y-4 pr-1 font-mono text-xs">
          {/* Step 1: Cloud Run Deploy with Mandatory Label */}
          <div className="bg-[#070A0F] rounded-lg border border-cyan-500/30 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-cyan-300 font-bold">
                <Tag className="w-4 h-4 text-cyan-400" />
                <span>1. Cloud Run Deployment Command (With Challenge Label)</span>
              </div>
              <button
                onClick={() => copyToClipboard(cloudRunDeploy, 'deploy')}
                className="flex items-center space-x-1 px-2 py-1 bg-cyan-950 text-cyan-300 hover:bg-cyan-900 rounded border border-cyan-500/40 text-[10px]"
              >
                {copiedSection === 'deploy' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'deploy' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="bg-[#0B0F17] p-2.5 rounded text-cyan-300 text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
              {cloudRunDeploy}
            </pre>
          </div>

          {/* Step 2: Secret Manager Setup */}
          <div className="bg-[#070A0F] rounded-lg border border-slate-800 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-200 font-bold">
                <Key className="w-4 h-4 text-amber-400" />
                <span>2. Secret Manager Binding (Zero Hardcoded Keys)</span>
              </div>
              <button
                onClick={() => copyToClipboard(secretManagerScript, 'secrets')}
                className="flex items-center space-x-1 px-2 py-1 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded border border-slate-700 text-[10px]"
              >
                {copiedSection === 'secrets' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'secrets' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="bg-[#0B0F17] p-2.5 rounded text-amber-300 text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
              {secretManagerScript}
            </pre>
          </div>

          {/* Step 3: Firestore Security Rules */}
          <div className="bg-[#070A0F] rounded-lg border border-slate-800 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-200 font-bold">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>3. Firestore Security Rules (`firestore.rules`)</span>
              </div>
              <button
                onClick={() => copyToClipboard(firestoreRules, 'firestore')}
                className="flex items-center space-x-1 px-2 py-1 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded border border-slate-700 text-[10px]"
              >
                {copiedSection === 'firestore' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'firestore' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="bg-[#0B0F17] p-2.5 rounded text-emerald-300 text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
              {firestoreRules}
            </pre>
          </div>

          {/* Step 4: Verification Binding */}
          <div className="bg-[#070A0F] rounded-lg border border-slate-800 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-200 font-bold">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>4. Automated Challenge Verification Label</span>
              </div>
              <button
                onClick={() => copyToClipboard(campaignLabel, 'label')}
                className="flex items-center space-x-1 px-2 py-1 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded border border-slate-700 text-[10px]"
              >
                {copiedSection === 'label' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'label' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="bg-[#0B0F17] p-2.5 rounded text-purple-300 text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
              {campaignLabel}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end font-mono text-xs shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
