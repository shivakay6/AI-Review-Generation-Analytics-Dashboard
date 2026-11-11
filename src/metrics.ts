import { Visit, MetricSummary } from './types';

export function computeMetrics(visits: Visit[]): MetricSummary {
  const s = visits.length;
  const selVisits = visits.filter(v => v.sentiment !== null);
  const sel = selVisits.length;

  const posVisits = visits.filter(v => v.sentiment === 'positive');
  const p = posVisits.length;

  const negVisits = visits.filter(v => v.sentiment === 'negative');
  const ng = negVisits.length;

  const gVisits = posVisits.filter(v => v.proceededToGoogle);
  const g = gVisits.length;

  const rVisits = gVisits.filter(v => v.postedToGoogle);
  const r = rVisits.length;

  const fbVisits = negVisits.filter(v => v.negativeFeedback !== null || v.actionAt !== null);
  const fb = fbVisits.length;

  const withPhone = fbVisits.filter(v => v.phoneNumber && v.phoneNumber.trim().length > 0).length;

  const selectionRate = s === 0 ? 0 : (sel / s) * 100;
  const positiveSentimentRate = sel === 0 ? 0 : (p / sel) * 100;
  const proceedRate = p === 0 ? 0 : (g / p) * 100;
  const postingRate = g === 0 ? 0 : (r / g) * 100;
  const conversionRate = s === 0 ? 0 : (r / s) * 100;
  const feedbackRate = ng === 0 ? 0 : (fb / ng) * 100;
  const contactCaptureRate = fb === 0 ? 0 : (withPhone / fb) * 100;

  // Review lengths for verified posted reviews
  const reviewLengths = rVisits
    .map(v => v.positiveReviewText?.length || 0)
    .filter(len => len > 0);
  const avgPositiveReviewLength =
    reviewLengths.length === 0
      ? 0
      : Math.round(reviewLengths.reduce((a, b) => a + b, 0) / reviewLengths.length);

  // Regeneration rates for positives
  const regenPositives = posVisits.filter(v => v.regenerations >= 1).length;
  const multiRegenPositives = posVisits.filter(v => v.regenerations >= 2).length;
  const regenerationRate = p === 0 ? 0 : (regenPositives / p) * 100;
  const multipleRegenerationsRate = p === 0 ? 0 : (multiRegenPositives / p) * 100;

  // Scan to action seconds
  const posSecs = posVisits
    .map(v => v.secsScanToAction)
    .filter((sec): sec is number => sec !== null && sec > 0)
    .sort((a, b) => a - b);
  const negSecs = fbVisits
    .map(v => v.secsScanToAction)
    .filter((sec): sec is number => sec !== null && sec > 0)
    .sort((a, b) => a - b);

  const calcMedian = (arr: number[]) => {
    if (arr.length === 0) return 0;
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 !== 0 ? arr[mid] : Math.round((arr[mid - 1] + arr[mid]) / 2);
  };

  const calcAvg = (arr: number[]) => {
    if (arr.length === 0) return 0;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  };

  return {
    s,
    sel,
    p,
    ng,
    g,
    r,
    fb,
    withPhone,
    selectionRate,
    positiveSentimentRate,
    proceedRate,
    postingRate,
    conversionRate,
    feedbackRate,
    contactCaptureRate,
    avgPositiveReviewLength,
    regenerationRate,
    multipleRegenerationsRate,
    positiveSecsMedian: calcMedian(posSecs),
    positiveSecsAvg: calcAvg(posSecs),
    negativeSecsMedian: calcMedian(negSecs),
    negativeSecsAvg: calcAvg(negSecs),
  };
}

/**
 * Format rate percentage: always one decimal, drop ".0" for whole numbers.
 * Examples: 100%, 82.9%, 0%
 */
export function formatPct(val: number): string {
  if (isNaN(val) || !isFinite(val)) return '0%';
  const rounded = Math.round(val * 10) / 10;
  if (rounded % 1 === 0) {
    return `${Math.round(rounded)}%`;
  }
  return `${rounded.toFixed(1)}%`;
}

/**
 * Format count difference: Since this is the first month of operation without
 * previous month/year data, all M-o-M and Y-o-Y changes are set to 0.
 */
export function formatCountChange(
  _current: number,
  _previous: number | null,
  periodLabel: string = 'M-o-M'
): { label: string; direction: 'up' | 'down' | 'neutral'; isAvailable: boolean } {
  return { label: `0% ${periodLabel}`, direction: 'neutral', isAvailable: true };
}

/**
 * Format points change for rates: Since this is the first month of operation without
 * previous month/year data, all M-o-M and Y-o-Y rate updates are set to 0.0 pts.
 */
export function formatRateChangePts(
  _currentRate: number,
  _previousRate: number | null,
  periodLabel?: string
): { label: string; direction: 'up' | 'down' | 'neutral'; isAvailable: boolean } {
  const suffix = periodLabel ? ` ${periodLabel}` : '';
  return { label: `0.0 pts${suffix}`, direction: 'neutral', isAvailable: true };
}

/**
 * Format integer numbers with comma: 10,875
 */
export function formatNumber(val: number): string {
  if (isNaN(val) || !isFinite(val)) return '0';
  return Math.round(val).toLocaleString('en-US');
}
