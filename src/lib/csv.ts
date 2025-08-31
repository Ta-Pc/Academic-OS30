import Papa from 'papaparse';

export type ParsedCSV = { headers: string[]; rows: Record<string, string>[] };

export function parseCsv(text: string): ParsedCSV {
  const parsed = (Papa as unknown as { parse: (t: string, opts: Record<string, unknown>) => { data: unknown[]; errors: Array<{ message: string }>; meta: { fields?: string[] } } }).parse(text, { header: true, skipEmptyLines: true });
  if (parsed.errors.length) {
    throw new Error((parsed.errors as Array<{ message: string }>).map((e) => e.message).join('; '));
  }
  const records = (parsed.data as Record<string, unknown>[]).filter(Boolean);
  if (records.length === 0) return { headers: [], rows: [] };
  const headers = (parsed.meta?.fields || Object.keys(records[0] || {})).map((h: unknown) => String(h).trim());
  const rows = records.map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h: string) => (obj[h] = String((r as Record<string, unknown>)[h] ?? '').trim()));
    return obj;
  });
  return { headers, rows };
}

export function suggestModuleMapping(headers: string[]) {
  const lower = headers.map((h) => h.toLowerCase());
  const find = (...cands: string[]) => {
    for (const c of cands) {
      const idx = lower.findIndex((h) => h.includes(c));
      if (idx >= 0) return headers[idx];
    }
    return null;
  };
  return {
    code: find('code', 'course code', 'module code'),
    title: find('title', 'name'),
    creditHours: find('credit', 'credit hours'),
    targetMark: find('target', 'target mark'),
  } as const;
}

export function suggestAssignmentMapping(headers: string[]) {
  const lower = headers.map((h) => h.toLowerCase());
  const find = (...cands: string[]) => {
    for (const c of cands) {
      const idx = lower.findIndex((h) => h.includes(c));
      if (idx >= 0) return headers[idx];
    }
    return null;
  };
  return {
    moduleCode: find('module_code', 'module code', 'course code', 'code'),
    title: find('assignment', 'title', 'name'),
    weight: find('weight', 'percent'),
    dueDate: find('due_date', 'due', 'date'),
    status: find('status', 'state'),
    score: find('grade', 'score', 'percentage', '%'),
    type: find('type', 'category'),
    description: find('description', 'details', 'notes'),
    effortEstimateMinutes: find('effort_estimate', 'effort', 'minutes', 'mins'),
    component: find('component', 'group'),
  } as const;
}

export function toNumber(value: string | null | undefined): number | null {
  if (!value && value !== '0') return null;
  const n = Number(String(value).replace(/[, ]/g, ''));
  return Number.isFinite(n) ? n : null;
}

export function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function normalizeStatus(value: string | null | undefined): 'PENDING' | 'GRADED' | 'DUE' | 'MISSED' | 'COMPLETE' | undefined {
  if (!value) return undefined;
  const v = value.trim().toLowerCase();
  if (v.startsWith('grad')) return 'GRADED';
  if (v.startsWith('miss')) return 'MISSED';
  if (v.startsWith('comp')) return 'COMPLETE';
  if (v.startsWith('upcom') || v.startsWith('due')) return 'DUE';
  return 'PENDING';
}

export function normalizeType(value: string | null | undefined): 'QUIZ' | 'SEMESTER_TEST' | 'ASSIGNMENT' | 'HOMEWORK' | 'PRACTICAL' | 'EXAM' | 'TUTORIAL' | undefined {
  if (!value) return undefined;
  const v = value.trim().toLowerCase();
  if (v.includes('quiz')) return 'QUIZ';
  if (v.includes('semester test')) return 'SEMESTER_TEST';
  if (v.includes('assignment')) return 'ASSIGNMENT';
  if (v.includes('homework')) return 'HOMEWORK';
  if (v.includes('practical')) return 'PRACTICAL';
  if (v.includes('exam')) return 'EXAM';
  if (v.includes('tutorial')) return 'TUTORIAL';
  if (v.includes('test')) return 'SEMESTER_TEST';
  return 'ASSIGNMENT';
}

