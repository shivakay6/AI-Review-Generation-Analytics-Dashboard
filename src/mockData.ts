import { Visit, BranchInfo, StoreInfo } from './types';

// Deterministic Pseudo-Random Number Generator (Mulberry32)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const BRANCHES: BranchInfo[] = [
  // Required 9 branches
  { name: 'Jadavpur - Kolkata', city: 'Kolkata', state: 'West Bengal', tier: 'strong', managerName: 'Rajesh Sen' },
  { name: 'KONNI', city: 'Konni', state: 'Kerala', tier: 'strong', managerName: 'Thomas Kurian' },
  { name: 'Jasdan - GU', city: 'Jasdan', state: 'Gujarat', tier: 'medium', managerName: 'Sanjay Mehta' },
  { name: 'Chandipur, WB', city: 'Chandipur', state: 'West Bengal', tier: 'strong', managerName: 'Subrata Pal' },
  { name: 'Tollygunge', city: 'Kolkata', state: 'West Bengal', tier: 'medium', managerName: 'Debanjan Roy' },
  { name: 'PALANI- GANDHI MARKET', city: 'Palani', state: 'Tamil Nadu', tier: 'strong', managerName: 'R. Muthukrishnan' },
  { name: 'Nager Bazar-Kolkatta', city: 'Kolkata', state: 'West Bengal', tier: 'medium', managerName: 'Anirban Ganguly' },
  { name: 'Tamluk - WB', city: 'Tamluk', state: 'West Bengal', tier: 'medium', managerName: 'Suman Das' },
  { name: 'Kotdwara - Uttrakhand', city: 'Kotdwar', state: 'Uttarakhand', tier: 'weak', managerName: 'Virender Negi' },
  // 28 additional Indian branch names
  { name: 'Andheri East - Mumbai', city: 'Mumbai', state: 'Maharashtra', tier: 'medium', managerName: 'Nilesh Sawant' },
  { name: 'Connaught Place - New Delhi', city: 'New Delhi', state: 'Delhi', tier: 'strong', managerName: 'Vikram Singhal' },
  { name: 'Koramangala - Bangalore', city: 'Bengaluru', state: 'Karnataka', tier: 'medium', managerName: 'Arvind Kulkarni' },
  { name: 'Anna Nagar - Chennai', city: 'Chennai', state: 'Tamil Nadu', tier: 'medium', managerName: 'Suresh Kumar' },
  { name: 'Banjara Hills - Hyderabad', city: 'Hyderabad', state: 'Telangana', tier: 'strong', managerName: 'K. Venkatraman' },
  { name: 'Viman Nagar - Pune', city: 'Pune', state: 'Maharashtra', tier: 'medium', managerName: 'Rohit Deshmukh' },
  { name: 'Salt Lake Sector V - Kolkata', city: 'Kolkata', state: 'West Bengal', tier: 'medium', managerName: 'Alok Mukherjee' },
  { name: 'MG Road - Kochi', city: 'Kochi', state: 'Kerala', tier: 'medium', managerName: 'Pradeep Varma' },
  { name: 'Alkapuri - Vadodara', city: 'Vadodara', state: 'Gujarat', tier: 'medium', managerName: 'Harish Trivedi' },
  { name: 'C-Scheme - Jaipur', city: 'Jaipur', state: 'Rajasthan', tier: 'medium', managerName: 'Amit Choudhary' },
  { name: 'Hazratganj - Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', tier: 'weak', managerName: 'Vivek Saxena' },
  { name: 'Bistupur - Jamshedpur', city: 'Jamshedpur', state: 'Jharkhand', tier: 'medium', managerName: 'Manish Agrawal' },
  { name: 'Paltan Bazaar - Guwahati', city: 'Guwahati', state: 'Assam', tier: 'weak', managerName: 'Dipankar Baruah' },
  { name: 'Boring Road - Patna', city: 'Patna', state: 'Bihar', tier: 'weak', managerName: 'Rakesh Tiwary' },
  { name: 'Arera Colony - Bhopal', city: 'Bhopal', state: 'Madhya Pradesh', tier: 'medium', managerName: 'Sunil Solanki' },
  { name: 'Sector 17 - Chandigarh', city: 'Chandigarh', state: 'Punjab', tier: 'medium', managerName: 'Jaspreet Singh' },
  { name: 'Thampanoor - Trivandrum', city: 'Thiruvananthapuram', state: 'Kerala', tier: 'medium', managerName: 'G. Nair' },
  { name: 'Rani Bazaar - Bikaner', city: 'Bikaner', state: 'Rajasthan', tier: 'weak', managerName: 'Bhanwar Singh' },
  { name: 'Dharampeth - Nagpur', city: 'Nagpur', state: 'Maharashtra', tier: 'medium', managerName: 'Satish Joshi' },
  { name: 'Navrangpura - Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', tier: 'medium', managerName: 'Mehul Patel' },
  { name: 'Town Hall - Coimbatore', city: 'Coimbatore', state: 'Tamil Nadu', tier: 'medium', managerName: 'C. Selvaraj' },
  { name: 'Residency Road - Srinagar', city: 'Srinagar', state: 'Jammu and Kashmir', tier: 'medium', managerName: 'Farooq Lone' },
  { name: 'Saheed Nagar - Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha', tier: 'medium', managerName: 'Soumya Mohanty' },
  { name: 'Pandri - Raipur', city: 'Raipur', state: 'Chhattisgarh', tier: 'weak', managerName: 'Manoj Dewangan' },
  { name: 'Sayajigunj - Vadodara', city: 'Vadodara', state: 'Gujarat', tier: 'medium', managerName: 'Paresh Shah' },
  { name: 'Civil Lines - Allahabad', city: 'Prayagraj', state: 'Uttar Pradesh', tier: 'medium', managerName: 'Anand Tripathi' },
  { name: 'Kanke Road - Ranchi', city: 'Ranchi', state: 'Jharkhand', tier: 'medium', managerName: 'Birsa Munda' },
  { name: 'The Mall - Shimla', city: 'Shimla', state: 'Himachal Pradesh', tier: 'medium', managerName: 'Rajeev Thakur' },
];

export const STORES: StoreInfo[] = BRANCHES;

export const POSITIVE_KEYWORDS = [
  'Documentation & Paperwork',
  'Interest Rates & Charges',
  'Transparency & Communication',
  'Overall Service Experience',
  'Staff assistance & Guidance',
  'Loan Processing Time',
];

export const NEGATIVE_KEYWORDS = [
  'Staff Support',
  'Waiting Time',
  'Interest & EMI',
  'Loan Approval',
  'Process / Documentation',
  'Others',
];

const POSITIVE_KEYWORD_SENTENCES: Record<string, string[]> = {
  'Documentation & Paperwork': [
    'The documentation and paperwork was completely hassle-free with minimal formalities required.',
    'I was pleasantly surprised at how smooth and paperless the verification steps were conducted.',
    'All KYC and pledge documentation were wrapped up in under ten minutes without unnecessary forms.',
  ],
  'Interest Rates & Charges': [
    'The interest rates and processing charges were very competitive and clearly itemized upfront.',
    'I appreciated the transparent rate structure with zero hidden penalty charges or surprises.',
    'Compared to other NBFCs and banks, their gold loan interest slabs offered remarkable value.',
  ],
  'Transparency & Communication': [
    'Complete transparency in weighing the ornaments right in front of me with high precision digital scales.',
    'The team communicated every stage of evaluation openly, ensuring complete peace of mind.',
    'Clear breakdown of valuation, purity testing, and repayment tenure was explained patiently.',
  ],
  'Overall Service Experience': [
    'Overall service experience was welcoming, respectful, and thoroughly professional throughout.',
    'From stepping in to disbursement, the branch maintained an exceptional standard of hospitality.',
    'Easily one of the most reassuring branch experiences I have encountered for personal financing.',
  ],
  'Staff assistance & Guidance': [
    'The branch staff provided courteous guidance and answered all my queries with great patience.',
    'Special thanks to the front desk team for their attentive assistance and warm conduct.',
    'Staff members guided me through digital app access and flexible repayment schedules smoothly.',
  ],
  'Loan Processing Time': [
    'Disbursement happened directly into my bank account within 15 minutes of ornament verification.',
    'Incredibly fast processing time that resolved my urgent business funding requirement immediately.',
    'The rapid turnaround time from entry to loan sanction was truly commendable.',
  ],
};

const MANAGER_SPECIFIC_POSITIVE_SENTENCES: Record<string, string[]> = {
  'Staff assistance & Guidance': [
    'Branch Manager personally explained the loan terms and ensured my documentation was prioritized.',
    'I was directly assisted by the Branch Manager whose guidance on interest schemes saved me significant fees.',
    'The Branch Manager attended to our pledge request immediately with utmost humility and professionalism.',
  ],
  'Transparency & Communication': [
    'The Branch Manager ensured full transparency in jewelry appraisal and gave a clear written breakdown.',
    'Discussed valuation directly with the Branch Manager who clarified every query with patience.',
  ],
  'Loan Processing Time': [
    'Branch Manager expedited the sanction approval within 10 minutes directly from his desk.',
    'Personal attention from the Branch Manager made the entire loan disbursement exceptionally swift.',
  ],
  'Overall Service Experience': [
    'Outstanding branch leadership! The Branch Manager maintains a welcoming and efficient atmosphere.',
    'My interaction with the Branch Manager was polite, highly professional, and reassuring.',
  ],
  'Documentation & Paperwork': [
    'Branch Manager completed our verification swiftly on the portal with zero redundant paperwork.',
  ],
  'Interest Rates & Charges': [
    'Branch Manager offered the most suitable interest slab suited for our short-term working capital need.',
  ],
};

const NEGATIVE_COMPLAINTS: Record<string, string[]> = {
  'Staff Support': [
    'Staff was dismissive and inattentive during my visit. Need better training in courteous customer care.',
    'Only two counters were operational despite a crowded floor. Staff seemed reluctant to answer queries.',
  ],
  'Waiting Time': [
    'Waiting time exceeded 45 minutes just for initial gold weighing. Kindly streamline the token management.',
    'Too much queue delay even on a weekday morning. The waiting lounge was crowded with no water or seating.',
  ],
  'Interest & EMI': [
    'Confusion regarding the monthly interest calculation slab. Terms differed from what was advertised.',
    'High processing fees deducted directly without prior notice before loan disbursement.',
  ],
  'Loan Approval': [
    'The loan approval process took over 2 hours due to system server lag. Very frustrating delay.',
    'Valuation seemed significantly lower than current market rates. Better appraisal parity needed.',
  ],
  'Process / Documentation': [
    'Excessive repetitive physical forms requested despite complete DigiLocker KYC verification.',
    'The documentation workflow felt chaotic and unorganized. Need a digitized tablet workflow.',
  ],
  'Others': [
    'Branch air conditioning was not working and cash counter had a broken biometric scanner.',
    'Parking facility was blocked and branch signage from the main road is very hard to locate.',
  ],
};

const MANAGER_NEGATIVE_COMPLAINTS: Record<string, string[]> = {
  'Staff Support': [
    'Requested an audience with the Branch Manager regarding gold valuation, but manager was unavailable.',
    'Branch Manager seemed hurried and did not provide adequate time to discuss repayment tenures.',
  ],
  'Waiting Time': [
    'Had an appointment at the Branch Manager desk, but waited 35 minutes before consultation began.',
    'Token sequence at the manager cabin was uncoordinated with general queue numbers.',
  ],
  'Interest & EMI': [
    'Branch Manager was unable to approve the promotional rate slab advertised in the flyer.',
  ],
  'Loan Approval': [
    'Appraisal sanction took longer than committed during my discussion with the Branch Manager.',
  ],
  'Process / Documentation': [
    'Additional guarantor verification demanded by branch manager after initial portal sanction.',
  ],
  'Others': [
    'Branch Manager desk had no visitor seating available during peak lunch hour.',
  ],
};

const INDIAN_FIRST_NAMES = [
  'Aarav', 'Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Ananya', 'Rohan', 'Sunita', 'Rahul',
  'Deepa', 'Suresh', 'Pooja', 'Karan', 'Meera', 'Manoj', 'Kavita', 'Arjun', 'Swati', 'Devendra',
  'Shalini', 'Girish', 'Bhavna', 'Santosh', 'Nandini', 'Pradeep', 'Rekha', 'Ashok', 'Vidya', 'Harish'
];
const INDIAN_LAST_NAMES = [
  'Sharma', 'Mukherjee', 'Patel', 'Nair', 'Verma', 'Chatterjee', 'Gupta', 'Iyer', 'Singh', 'Banerjee',
  'Joshi', 'Menon', 'Reddy', 'Deshmukh', 'Mishra', 'Bose', 'Rathore', 'Choudhury', 'Pillai', 'Ghosh'
];

function generateReviewText(
  branchName: string,
  managerName: string,
  selectedKeywords: string[],
  isManagerQR: boolean,
  rng: () => number
): string {
  let intro = '';
  if (isManagerQR) {
    intro = `I visited the ${branchName} branch and consulted directly with Branch Manager ${managerName}. `;
  } else {
    intro = `I visited the ${branchName} branch for a Gold Loan and found the overall experience very reliable. `;
  }

  let body = '';
  selectedKeywords.forEach(kw => {
    if (isManagerQR && MANAGER_SPECIFIC_POSITIVE_SENTENCES[kw] && rng() < 0.6) {
      const sentences = MANAGER_SPECIFIC_POSITIVE_SENTENCES[kw];
      const idx = Math.floor(rng() * sentences.length);
      body += sentences[idx] + ' ';
    } else {
      const sentences = POSITIVE_KEYWORD_SENTENCES[kw];
      if (sentences && sentences.length > 0) {
        const idx = Math.floor(rng() * sentences.length);
        body += sentences[idx] + ' ';
      }
    }
  });

  const outro = isManagerQR
    ? `Special thanks to ${managerName} and the branch team for delivering a prompt, stress-free customer experience.`
    : `I would definitely recommend this branch to friends and family in need of quick, secure financial support.`;

  const fullText = (intro + body + outro).trim();
  if (fullText.length > 650) {
    return fullText.slice(0, 647) + '...';
  }
  return fullText;
}

function generateDataset(): Visit[] {
  const rng = mulberry32(133742);
  const visits: Visit[] = [];

  // Date range from 2026-07-01 to 2026-10-31
  const startDate = new Date(2026, 6, 1, 8, 0, 0); // 1 July 2026
  const endDate = new Date(2026, 9, 31, 21, 0, 0); // 31 Oct 2026
  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Branch weights
  const branchWeights = BRANCHES.map(b => {
    if (b.tier === 'strong') return { branch: b, weight: 1.6, posChance: 0.94, proceedChance: 0.89, postChance: 0.91 };
    if (b.tier === 'weak') return { branch: b, weight: 0.6, posChance: 0.68, proceedChance: 0.55, postChance: 0.62 };
    return { branch: b, weight: 1.0, posChance: 0.88, proceedChance: 0.80, postChance: 0.85 };
  });

  const totalBranchWeight = branchWeights.reduce((a, b) => a + b.weight, 0);

  // Generate ~3,600 visits across 4 months:
  // ~68% are Branch QR scans (Store QR), ~32% are Manager Personal QR scans (Desk QR)
  const targetVisits = 3650;

  for (let i = 0; i < targetVisits; i++) {
    const dayRatio = rng();
    const biasedRatio = Math.pow(dayRatio, 0.7);
    const dayOffset = Math.floor(biasedRatio * totalDays);
    const currentDate = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);

    const isSunday = currentDate.getDay() === 0;
    if (isSunday && rng() < 0.55) {
      continue;
    }

    let hour = 11;
    const hourRoll = rng();
    if (hourRoll < 0.40) {
      hour = 10 + Math.floor(rng() * 4);
    } else if (hourRoll < 0.75) {
      hour = 16 + Math.floor(rng() * 4);
    } else {
      const otherHours = [8, 9, 13, 14, 15, 19, 20];
      hour = otherHours[Math.floor(rng() * otherHours.length)];
    }

    const minute = Math.floor(rng() * 60);
    const second = Math.floor(rng() * 60);
    const scannedAt = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hour, minute, second);

    // Pick branch
    let branchRoll = rng() * totalBranchWeight;
    let selectedBranchConfig = branchWeights[0];
    for (const bw of branchWeights) {
      if (branchRoll <= bw.weight) {
        selectedBranchConfig = bw;
        break;
      }
      branchRoll -= bw.weight;
    }

    const branch = selectedBranchConfig.branch;

    // Determine QR source: Branch QR vs Manager QR
    // Branch manager has a separate desk QR code
    const isManagerQR = rng() < 0.32;
    const qrSource: 'branch' | 'manager' = isManagerQR ? 'manager' : 'branch';

    // Different conversion dynamics for Manager QR:
    // Customers scanning the Branch Manager QR had direct executive engagement,
    // so selection rate and conversion can be higher or distinct from general walk-in branch QR.
    const selectionThreshold = isManagerQR ? 0.85 : 0.76;
    const choosesSentiment = rng() < selectionThreshold;

    let sentiment: 'positive' | 'negative' | null = null;
    let actionAt: Date | null = null;
    let secsScanToAction: number | null = null;
    let regenerations = 0;
    let keywords: string[] = [];
    let positiveReviewText: string | null = null;
    let proceededToGoogle = false;
    let postedToGoogle = false;
    let negativeFeedback: string | null = null;
    let contactName: string | null = null;
    let phoneNumber: string | null = null;

    if (choosesSentiment) {
      // Positive chance differs slightly for manager QR based on branch tier
      const posChance = isManagerQR
        ? Math.min(0.98, selectedBranchConfig.posChance + 0.05)
        : selectedBranchConfig.posChance;

      const isPositive = rng() < posChance;
      sentiment = isPositive ? 'positive' : 'negative';

      if (isPositive) {
        // Positive path
        secsScanToAction = Math.floor(
          (isManagerQR ? 5 : 7) + rng() * (isManagerQR ? 40 : 55) + (rng() < 0.1 ? rng() * 50 : 0)
        );
        actionAt = new Date(scannedAt.getTime() + secsScanToAction * 1000);

        const regenRoll = rng();
        if (regenRoll < 0.78) {
          regenerations = 0;
        } else if (regenRoll < 0.93) {
          regenerations = 1;
        } else {
          regenerations = 2 + Math.floor(rng() * 2);
        }

        const numKw = 2 + Math.floor(rng() * 3);
        const shuffled = [...POSITIVE_KEYWORDS].sort(() => rng() - 0.5);
        keywords = shuffled.slice(0, numKw);

        positiveReviewText = generateReviewText(branch.name, branch.managerName, keywords, isManagerQR, rng);

        const proceedChance = isManagerQR
          ? Math.min(0.96, selectedBranchConfig.proceedChance + 0.07)
          : selectedBranchConfig.proceedChance;
        proceededToGoogle = rng() < proceedChance;

        if (proceededToGoogle) {
          const postChance = isManagerQR
            ? Math.min(0.96, selectedBranchConfig.postChance + 0.06)
            : selectedBranchConfig.postChance;
          postedToGoogle = rng() < postChance;
        }
      } else {
        // Negative path
        secsScanToAction = Math.floor(12 + rng() * 140);
        actionAt = new Date(scannedAt.getTime() + secsScanToAction * 1000);

        const numKw = 1 + (rng() < 0.3 ? 1 : 0);
        const shuffled = [...NEGATIVE_KEYWORDS].sort(() => rng() - 0.5);
        keywords = shuffled.slice(0, numKw);

        const submitsFeedback = rng() < (isManagerQR ? 0.94 : 0.88);
        if (submitsFeedback) {
          const primaryKw = keywords[0] || 'Staff Support';
          if (isManagerQR && MANAGER_NEGATIVE_COMPLAINTS[primaryKw] && rng() < 0.65) {
            const list = MANAGER_NEGATIVE_COMPLAINTS[primaryKw];
            negativeFeedback = `${primaryKw} — ${list[Math.floor(rng() * list.length)]}`;
          } else {
            const list = NEGATIVE_COMPLAINTS[primaryKw] || NEGATIVE_COMPLAINTS['Others'];
            negativeFeedback = `${primaryKw} — ${list[Math.floor(rng() * list.length)]}`;
          }

          if (rng() < 0.72) {
            const fn = INDIAN_FIRST_NAMES[Math.floor(rng() * INDIAN_FIRST_NAMES.length)];
            const ln = INDIAN_LAST_NAMES[Math.floor(rng() * INDIAN_LAST_NAMES.length)];
            contactName = `${fn} ${ln}`;
            const prefix = Math.floor(7 + rng() * 3);
            const rest = Math.floor(100000000 + rng() * 900000000);
            phoneNumber = `${prefix}${rest}`.slice(0, 10);
          }
        }
      }
    }

    visits.push({
      id: `vis_${(i + 1).toString().padStart(5, '0')}`,
      branchName: branch.name,
      storeName: branch.name,
      managerName: branch.managerName,
      city: branch.city,
      state: branch.state,
      qrSource,
      scannedAt,
      sentiment,
      actionAt,
      secsScanToAction,
      regenerations,
      keywords,
      positiveReviewText,
      proceededToGoogle,
      postedToGoogle,
      negativeFeedback,
      contactName,
      phoneNumber,
    });
  }

  return visits.sort((a, b) => a.scannedAt.getTime() - b.scannedAt.getTime());
}

export const ALL_VISITS: Visit[] = generateDataset();
