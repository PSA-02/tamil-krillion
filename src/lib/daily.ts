import { PROMPTS } from '../data/prompts'
import type { Prompt } from '../data/types'
import { ROUNDS } from './tiers'

/** Dive #1 was played on this date (India Standard Time). */
export const LAUNCH_DATE = '2026-10-28'
const TIME_ZONE = 'Asia/Kolkata'
const DAY_MS = 86_400_000

/** Today's date as YYYY-MM-DD in India Standard Time, so everyone shares a dive. */
export function dateKey(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function addDays(key: string, days: number): string {
  const date = new Date(`${key}T00:00:00Z`)
  return new Date(date.getTime() + days * DAY_MS).toISOString().slice(0, 10)
}

export function diveNumber(key: string): number {
  const diff = Date.parse(`${key}T00:00:00Z`) - Date.parse(`${LAUNCH_DATE}T00:00:00Z`)
  return Math.floor(diff / DAY_MS) + 1
}

/** FNV-1a: a small, stable string hash for seeding. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** mulberry32: a seeded PRNG returning floats in [0, 1). */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pickPrompts(random: () => number, pool: Prompt[] = PROMPTS, count = ROUNDS): Prompt[] {
  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}

export function dailyPrompts(key: string): Prompt[] {
  return pickPrompts(seededRandom(hashString(`krillion-tamil:${key}`)))
}
