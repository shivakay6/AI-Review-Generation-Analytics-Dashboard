export type Visit = {
  id: string;
  branchName: string;
  storeName: string; // maintained for backward compatibility
  city: string;
  state: string;
  managerName: string;
  qrSource: 'branch' | 'manager'; // 'branch' = Store/Branch Counter QR, 'manager' = Branch Manager Personal QR
  scannedAt: Date;
  sentiment: 'positive' | 'negative' | null;
  actionAt: Date | null;
  secsScanToAction: number | null;
  regenerations: number;
  keywords: string[];
  positiveReviewText: string | null;
  proceededToGoogle: boolean;
  postedToGoogle: boolean;
  negativeFeedback: string | null;
  contactName: string | null;
  phoneNumber: string | null;
};

export type BranchInfo = {
  name: string;
  city: string;
  state: string;
  tier: 'strong' | 'medium' | 'weak';
  managerName: string;
};

export type StoreInfo = BranchInfo; // backward compatibility alias

export type DateRangePreset =
  | 'this_month'
  | 'last_month'
  | 'last_7_days'
  | 'last_30_days'
  | 'last_90_days'
  | 'custom';

export type ComparisonMode = 'MoM' | 'YoY';

export type TabType =
  | 'overview'
  | 'dropoffs'
  | 'positive'
  | 'negative'
  | 'stores'
  | 'managers';

export type MetricSummary = {
  s: number;         // QR Scans
  sel: number;       // Sentiment Selections
  p: number;         // Positive Selections
  ng: number;        // Negative Selections
  g: number;         // Proceeded to Google
  r: number;         // Reviews Generated
  fb: number;        // Feedback Received
  withPhone: number; // Negatives with phone number
  selectionRate: number;
  positiveSentimentRate: number;
  proceedRate: number;
  postingRate: number;
  conversionRate: number;
  feedbackRate: number;
  contactCaptureRate: number;
  avgPositiveReviewLength: number;
  regenerationRate: number;
  multipleRegenerationsRate: number;
  positiveSecsMedian: number;
  positiveSecsAvg: number;
  negativeSecsMedian: number;
  negativeSecsAvg: number;
};
