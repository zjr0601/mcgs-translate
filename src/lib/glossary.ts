// 术语库管理 — 用户自定义术语库（localStorage 持久化）

export interface UserTermEntry {
  zh: string;
  en: string;
  source: 'example_file' | 'manual_edit' | 'import_paste' | 'import_file';
  addedAt: number; // timestamp
}

const STORAGE_KEY = 'mcgs-user-glossary';

/**
 * Load user glossary from localStorage.
 */
export function loadUserGlossary(): Map<string, string> {
  if (typeof window === 'undefined') return new Map();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Map();

    const entries: UserTermEntry[] = JSON.parse(raw);
    const map = new Map<string, string>();
    for (const e of entries) {
      map.set(e.zh, e.en);
    }
    return map;
  } catch {
    return new Map();
  }
}

/**
 * Save user glossary to localStorage.
 */
export function saveUserGlossary(entries: UserTermEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/**
 * Load full entries (with metadata) from localStorage.
 */
export function loadUserGlossaryEntries(): UserTermEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UserTermEntry[];
  } catch {
    return [];
  }
}

/**
 * Learn from an already-translated XML: extract zh→en pairs and
 * add to the user glossary. Returns number of new terms learned.
 */
export function learnFromTranslatedXml(
  pairs: { zh: string; en: string }[]
): number {
  const existing = loadUserGlossaryEntries();
  const existingMap = new Map(existing.map((e) => [e.zh, e.en]));

  let added = 0;
  const now = Date.now();

  for (const { zh, en } of pairs) {
    if (!zh || !en) continue;
    if (existingMap.has(zh)) continue;

    existing.push({
      zh,
      en,
      source: 'example_file',
      addedAt: now,
    });
    existingMap.set(zh, en);
    added++;
  }

  saveUserGlossary(existing);
  return added;
}

/**
 * Add or update a single term (from manual edit in the editor).
 */
export function addUserTerm(zh: string, en: string): void {
  const entries = loadUserGlossaryEntries();
  const now = Date.now();

  // Remove existing entry for this zh if present
  const idx = entries.findIndex((e) => e.zh === zh);
  if (idx >= 0) {
    entries.splice(idx, 1);
  }

  entries.push({ zh, en, source: 'manual_edit', addedAt: now });
  saveUserGlossary(entries);
}

/**
 * Import pairs from paste/file import. Returns number of NEW terms added.
 */
export function importPairs(pairs: { zh: string; en: string }[], source: 'import_paste' | 'import_file' = 'import_paste'): number {
  const entries = loadUserGlossaryEntries();
  const existingMap = new Map(entries.map(e => [e.zh, e.en]));
  const now = Date.now();
  let added = 0;

  for (const { zh, en } of pairs) {
    if (!zh || !en) continue;
    // Overwrite if exists — last import wins
    const idx = entries.findIndex(e => e.zh === zh);
    if (idx >= 0) entries.splice(idx, 1);
    entries.push({ zh, en, source, addedAt: now });
    existingMap.set(zh, en);
    added++;
  }

  saveUserGlossary(entries);
  return added;
}

/**
 * Delete a user glossary entry.
 */
export function deleteUserTerm(zh: string): void {
  const entries = loadUserGlossaryEntries();
  const filtered = entries.filter((e) => e.zh !== zh);
  saveUserGlossary(filtered);
}

/**
 * Clear all user glossary entries.
 */
export function clearUserGlossary(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
