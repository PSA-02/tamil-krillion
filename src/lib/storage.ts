import { addDays } from './daily'
import type { RoundResult } from './game'

export interface DailyRecord {
  score: number
  results: RoundResult[]
}

export interface Stats {
  played: number
  best: number
  streak: number
  maxStreak: number
  lastDaily: string | null
  history: Record<string, DailyRecord>
}

const STATS_KEY = 'krillion-tamil:stats'
const LANG_KEY = 'krillion-tamil:lang'

export const EMPTY_STATS: Stats = {
  played: 0,
  best: 0,
  streak: 0,
  maxStreak: 0,
  lastDaily: null,
  history: {},
}

/** Browser storage can be missing or throw (private mode, blocked cookies). */
function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Progress just won't persist; the game still works.
  }
}

export function loadStats(): Stats {
  const raw = read(STATS_KEY)
  if (!raw) return EMPTY_STATS
  try {
    return { ...EMPTY_STATS, ...(JSON.parse(raw) as Partial<Stats>) }
  } catch {
    return EMPTY_STATS
  }
}

export function saveStats(stats: Stats): void {
  write(STATS_KEY, JSON.stringify(stats))
}

/** Returns new stats with a finished daily dive recorded. Replays are ignored. */
export function recordDaily(stats: Stats, key: string, record: DailyRecord): Stats {
  if (stats.history[key]) return stats
  const streak = stats.lastDaily === addDays(key, -1) ? stats.streak + 1 : 1
  return {
    played: stats.played + 1,
    best: Math.max(stats.best, record.score),
    streak,
    maxStreak: Math.max(stats.maxStreak, streak),
    lastDaily: key,
    history: { ...stats.history, [key]: record },
  }
}

/** The streak shown today: it lapses once a whole day is skipped. */
export function currentStreak(stats: Stats, today: string): number {
  if (stats.lastDaily === today || stats.lastDaily === addDays(today, -1)) return stats.streak
  return 0
}

export function loadLang(): 'ta' | 'en' {
  return read(LANG_KEY) === 'en' ? 'en' : 'ta'
}

export function saveLang(lang: 'ta' | 'en'): void {
  write(LANG_KEY, lang)
}
