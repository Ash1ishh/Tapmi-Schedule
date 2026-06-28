// TAPMI MBA-IB Term 1 — Timetable Data
// Term: June 22, 2026 – September 23, 2026
// Venue: FF 33, K.K. Pai Block
// Last verified against: TERM_1_MBA-IB_TT.xlsx (June 25, 2026)
// Schedule loaded: June 22 – July 11, 2026 (rest of term to be added)

export const TERM = {
  name: "Term 1",
  batch: "MBA-IB 2026–28",
  start: "2026-06-22",
  end: "2026-09-23",
  venue: "FF 33, K.K. Pai Block",
};

export const COURSES = {
  INB4101: { code: "INB 4101", name: "Basics of Accounting",                               faculty: "Prof. Arushi Verma",                   credits: 1 },
  INB4702: { code: "INB 4702", name: "Excel Basics",                                        faculty: "Prof. Sham Ranjan K.C. Shetty",        credits: 1 },
  INB4703: { code: "INB 4703", name: "Learning through AI",                                 faculty: "Prof. Issac K Varghese",               credits: 1 },
  INB4901: { code: "INB 4901", name: "Learning through Alternative Pedagogies (LEAP)",      faculty: "Prof. Issac K Varghese / Prof. Vasanth Kamath", credits: 1 },
  INB5101: { code: "INB 5101", name: "Financial Accounting",                                faculty: "Prof. Salu V Prasad",                  credits: 2 },
  INB5201: { code: "INB 5201", name: "Managerial Economics",                                faculty: "Prof. Gauri Sreekumar",                credits: 3 },
  INB5401: { code: "INB 5401", name: "Marketing Management",                                faculty: "Prof. Satyaki Datta",                  credits: 3 },
  INB5502: { code: "INB 5502", name: "Managerial Statistics",                               faculty: "Prof. Priyanka Laskar",                credits: 3 },
  INB5802: { code: "INB 5802", name: "Managerial Communication – I",                        faculty: "Prof. Aparna Bhat",                    credits: 2 },
  INB5803: { code: "INB 5803", name: "Organizational Behaviour",                            faculty: "Prof. Shruthi J Mayur",                credits: 2 },
  INB5901: { code: "INB 5901", name: "Sustainability, Responsibility & Managerial Ethics",  faculty: "Prof. Issac K Varghese",               credits: 2 },
  INB5902: { code: "INB 5902", name: "Comprehensive Test – 1",                              faculty: "NA",                                   credits: 1 },
};

// Six daily time slots
export const TIME_SLOTS = [
  { id: "T1", label: "8:45 – 10:00",   start: "08:45", end: "10:00" },
  { id: "T2", label: "10:15 – 11:30",  start: "10:15", end: "11:30" },
  { id: "T3", label: "11:45 – 1:00",   start: "11:45", end: "13:00" },
  { id: "T4", label: "2:30 – 3:45",    start: "14:30", end: "15:45" },
  { id: "T5", label: "4:00 – 5:15",    start: "16:00", end: "17:15" },
  { id: "T6", label: "5:45 – 7:00",    start: "17:45", end: "19:00" },
];

// RAW_SCHEDULE: [ISO-date, T1, T2, T3, T4, T5, T6]
// Each slot: "COURSECODE-SESSION" | "INDUCTION" | null
// Double-verified against TERM_1_MBA-IB_TT.xlsx
// NOTE: Jun 29 INB4901-2 is taught by Prof. Vasanth Kamath (VK, 1 session per handbook)
export const RAW_SCHEDULE = [
  ["2026-06-22", "INDUCTION", null,         null,         null,         null,         null        ],
  ["2026-06-23", null,        null,         null,         null,         null,         null        ],
  ["2026-06-24", null,        null,         null,         null,         null,         null        ],
  ["2026-06-25", null,        null,         null,         null,         null,         null        ],
  ["2026-06-26", null,        null,         "INB4101-1",  "INB4702-1",  "INB4901-1",  null        ],
  ["2026-06-27", null,        "INB5802-1",  "INB5803-1",  "INB4101-2",  null,         null        ],
  // 28 Jun = Sunday (Weekly Off — no entry)
  ["2026-06-29", "INB4101-3", null,         null,         "INB5201-1",  "INB4702-2",  "INB4901-2" ],
  ["2026-06-30", "INB5502-1", "INB5802-2",  "INB5401-1",  null,         "INB4101-4",  null        ],
  ["2026-07-01", "INB4101-5", null,         null,         "INB4703-1",  "INB4901-3",  "INB4702-3" ],
  ["2026-07-02", null,        "INB5502-2",  "INB4703-2",  "INB5803-2",  "INB4702-4",  null        ],
  ["2026-07-03", "INB4901-4", "INB4901-5",  "INB4703-3",  "INB5201-2",  "INB5401-2",  null        ],
  ["2026-07-04", "INB4703-4", null,         null,         null,         null,         null        ],
  // 05 Jul = Sunday (Weekly Off — no entry)
  ["2026-07-06", null,        "INB4702-5",  "INB4703-5",  "INB5401-3",  "INB5201-3",  null        ],
  ["2026-07-07", "INB4702-6", "INB4101-6",  "INB4703-6",  "INB4901-6",  "INB4901-7",  null        ],
  ["2026-07-08", "INB4703-7", "INB4702-7",  "INB4901-8",  "INB4101-7",  "INB5502-3",  null        ],
  ["2026-07-09", "INB5502-4", "INB5802-3",  "INB4702-8",  null,         "INB4101-8",  null        ],
  ["2026-07-10", null,        "INB5803-3",  "INB5803-4",  "INB4703-8",  "INB5201-4",  null        ],
  ["2026-07-11", "INB5901-1", "INB5401-4",  null,         null,         null,         null        ],
  // Schedule from Jul 12 onward to be added when released by TAPMI
];

export const COURSE_COLORS = {
  INB4101: "#4F86C6",
  INB4702: "#5BA85A",
  INB4703: "#E07B39",
  INB4901: "#7B68EE",
  INB5101: "#8B6B9E",
  INB5201: "#D4A843",
  INB5401: "#3AADA8",
  INB5502: "#C25B8A",
  INB5802: "#6E7FC2",
  INB5803: "#E86060",
  INB5901: "#4BAE8A",
  INB5902: "#888888",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getSessionsForDate(dateStr) {
  const row = RAW_SCHEDULE.find((r) => r[0] === dateStr);
  if (!row) return [];
  return TIME_SLOTS.map((slot, i) => {
    const raw = row[i + 1];
    if (!raw) return null;
    if (raw === "INDUCTION") return { slot, courseKey: null, session: null, isInduction: true };
    const [courseKey, session] = raw.split("-");
    return { slot, courseKey, session: parseInt(session), isInduction: false };
  }).filter(Boolean);
}

export function getAllScheduledDates() {
  return RAW_SCHEDULE.map((r) => r[0]);
}

/** Returns total session count per course key from currently loaded schedule */
export function getTotalSessionsLoaded() {
  const totals = {};
  RAW_SCHEDULE.forEach((row) => {
    for (let i = 1; i <= 6; i++) {
      const cell = row[i];
      if (!cell || cell === "INDUCTION") continue;
      const [courseKey] = cell.split("-");
      totals[courseKey] = (totals[courseKey] || 0) + 1;
    }
  });
  return totals;
}

/** Returns all unique session numbers per course from currently loaded schedule */
export function getSessionNumbersForCourse(courseKey) {
  const nums = new Set();
  RAW_SCHEDULE.forEach((row) => {
    for (let i = 1; i <= 6; i++) {
      const cell = row[i];
      if (!cell || cell === "INDUCTION") continue;
      const [ck, sn] = cell.split("-");
      if (ck === courseKey && sn) nums.add(parseInt(sn));
    }
  });
  return [...nums].sort((a, b) => a - b);
}
