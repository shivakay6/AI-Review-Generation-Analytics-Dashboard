import * as XLSX from 'xlsx';
import { Visit } from '../types';

function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}

export function formatIST(date: Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  const day = padZero(d.getDate());
  const month = padZero(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = padZero(d.getHours());
  const minutes = padZero(d.getMinutes());
  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function exportVisitsToExcel(
  visits: Visit[],
  branchLabel: string,
  startDateStr: string,
  endDateStr: string
) {
  // Sort oldest first
  const sorted = [...visits].sort((a, b) => a.scannedAt.getTime() - b.scannedAt.getTime());

  const rows = sorted.map(v => {
    const scanDate = new Date(v.scannedAt);
    const month = MONTH_NAMES[scanDate.getMonth()];
    const day = scanDate.getDate();

    let postedToGoogleVal = '';
    if (v.sentiment !== null) {
      postedToGoogleVal = v.postedToGoogle ? '1' : '0';
    }

    const reviewCharLength =
      v.sentiment === 'positive'
        ? v.positiveReviewText
          ? v.positiveReviewText.length
          : 432
        : '';

    return {
      'Branch Name': v.branchName || v.storeName,
      'QR Source': v.qrSource === 'manager' ? 'Branch Manager QR' : 'Branch QR',
      'Branch Manager': v.managerName,
      'scanned_at_ist': formatIST(v.scannedAt),
      'Month': month,
      'Day': day,
      'action_at_ist': v.actionAt ? formatIST(v.actionAt) : '',
      'secs_scan_to_action': v.secsScanToAction !== null ? v.secsScanToAction : '',
      'sentiment': v.sentiment || '',
      'posted_to_google': postedToGoogleVal,
      'review_char_length': reviewCharLength,
      'selected_keywords': v.keywords && v.keywords.length > 0 ? v.keywords.join('; ') : '',
      'positive_review_text': v.sentiment === 'positive' && v.positiveReviewText ? v.positiveReviewText : '',
      'negative_feedback': v.sentiment === 'negative' && v.negativeFeedback ? v.negativeFeedback : '',
      'contact_name': v.sentiment === 'negative' && v.contactName ? v.contactName : '',
      'phone_number': v.sentiment === 'negative' && v.phoneNumber ? v.phoneNumber : '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: [
      'Branch Name',
      'QR Source',
      'Branch Manager',
      'scanned_at_ist',
      'Month',
      'Day',
      'action_at_ist',
      'secs_scan_to_action',
      'sentiment',
      'posted_to_google',
      'review_char_length',
      'selected_keywords',
      'positive_review_text',
      'negative_feedback',
      'contact_name',
      'phone_number',
    ],
  });

  // Adjust column widths for readability
  worksheet['!cols'] = [
    { wch: 28 }, // Branch Name
    { wch: 20 }, // QR Source
    { wch: 20 }, // Branch Manager
    { wch: 18 }, // scanned_at_ist
    { wch: 12 }, // Month
    { wch: 6 },  // Day
    { wch: 18 }, // action_at_ist
    { wch: 18 }, // secs_scan_to_action
    { wch: 12 }, // sentiment
    { wch: 16 }, // posted_to_google
    { wch: 18 }, // review_char_length
    { wch: 36 }, // selected_keywords
    { wch: 50 }, // positive_review_text
    { wch: 45 }, // negative_feedback
    { wch: 20 }, // contact_name
    { wch: 15 }, // phone_number
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Branch Review Funnel');

  const cleanBranch = branchLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const cleanStart = startDateStr.replace(/[^0-9]/g, '');
  const cleanEnd = endDateStr.replace(/[^0-9]/g, '');
  const fileName = `review_funnel_${cleanBranch || 'all-branches'}_${cleanStart}_${cleanEnd}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}
