export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type SecurityChannel = 'message' | 'email' | 'url' | 'image';

export interface MLDetails {
  ml_probability: number;
  ml_class: 'spam' | 'ham';
  ml_confidence: number;
  model_used: string;
}

export interface EvidenceItem {
  phrase: string;
  label: string;
  rationale: string;
}

export interface AnalysisResult {
  risk: RiskLevel;
  score?: number;
  classification?: string;
  category?: string;
  signals: string[];
  evidence?: EvidenceItem[];
  explanation?: string;
  recommendedAction?: string;
  recommendation?: string;
  mlDetails?: MLDetails | null;
  channel?: SecurityChannel;
  hostname?: string;
  url?: string;
  sender?: string;
  subject?: string;
  urlsAnalyzed?: number;
  extractedText?: string;
  ocrActive?: boolean;
  scan_id?: number;
  threat_feed_match?: boolean;
  threat_feed_source?: string | null;
}
