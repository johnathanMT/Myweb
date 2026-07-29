// ============================================================================
//  research.ts — pre-registered, falsifiable prediction store (localStorage).
//  A prediction is written BEFORE its window opens, then cryptographically
//  hash-locked so it cannot be silently edited afterwards. Outcomes are scored
//  later and compared against a stated base rate. No backend, no accounts.
// ============================================================================

export type Valence = 'supportive' | 'demanding' | 'mixed' | 'neutral'
export type Outcome = 'hit' | 'partial' | 'miss'

export interface Prediction {
  id: string
  createdAt: string            // MUST precede windowStart
  windowStart: string          // yyyy-mm-dd
  windowEnd: string
  area: string
  claim: string                // specific + testable
  falsifier: string            // REQUIRED — what would disprove it
  baseRate: number             // 0–1: chance without astrology
  baseRateSource: string
  intensity: 1 | 2 | 3 | 4 | 5
  valence: Valence
  hash: string                 // SHA-256 of the locked fields
  locked: boolean
  outcome?: Outcome
  reviewedAt?: string
  note?: string
}

export interface JournalEntry {
  id: string
  month: string                // yyyy-mm — written WITHOUT looking at predictions
  category: string
  description: string
  magnitude: 1 | 2 | 3
  createdAt: string
}

const PRED_KEY = 'vedin_predictions'
const JOURN_KEY = 'vedin_journal'

function read<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]') as T[] } catch { return [] }
}
function write<T>(key: string, rows: T[]) {
  try { localStorage.setItem(key, JSON.stringify(rows)) } catch { /* quota / private mode */ }
}

export const getPredictions = () => read<Prediction>(PRED_KEY)
export const getJournal = () => read<JournalEntry>(JOURN_KEY)
export const savePredictions = (rows: Prediction[]) => write(PRED_KEY, rows)
export const saveJournal = (rows: JournalEntry[]) => write(JOURN_KEY, rows)

export const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

/** SHA-256 of the immutable fields — proves the claim wasn't changed after locking. */
export async function hashPrediction(p: Pick<Prediction, 'createdAt' | 'windowStart' | 'windowEnd' | 'claim' | 'falsifier' | 'baseRate'>): Promise<string> {
  const payload = `${p.createdAt}|${p.windowStart}|${p.windowEnd}|${p.claim}|${p.falsifier}|${p.baseRate}`
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload))
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return 'hash-unavailable'
  }
}

/** Export the full dataset for independent re-analysis (reproducibility). */
export function exportCsv(preds: Prediction[]): string {
  const head = ['id', 'createdAt', 'windowStart', 'windowEnd', 'area', 'claim', 'falsifier', 'baseRate', 'baseRateSource', 'intensity', 'valence', 'outcome', 'hash']
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = preds.map((p) => [p.id, p.createdAt, p.windowStart, p.windowEnd, p.area, p.claim, p.falsifier, p.baseRate, p.baseRateSource, p.intensity, p.valence, p.outcome ?? '', p.hash].map(esc).join(','))
  return '﻿' + [head.map(esc).join(','), ...rows].join('\r\n')
}
