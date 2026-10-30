import type { TierId } from '../data/types'
import { ROUNDS, TIERS } from './tiers'

/** A finished daily dive, packed into a link so a friend can compare. */
export interface Challenge {
  name: string
  dive: number
  score: number
  tiers: (TierId | null)[]
}

export interface DuelDive {
  me?: number
  them?: number
}

export interface Rival {
  name: string
  dives: Record<string, DuelDive>
  updated: number
}

export interface HeadToHead {
  wins: number
  losses: number
  draws: number
  myTotal: number
  theirTotal: number
  myBest: number
  theirBest: number
}

const MAX_NAME = 20

export function cleanName(name: string): string {
  return name
    .replace(/[\p{C}<>]/gu, '')
    .trim()
    .slice(0, MAX_NAME)
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(code: string): string {
  const binary = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)))
}

export function encodeChallenge(challenge: Challenge): string {
  const tiers = challenge.tiers.map((t) => (t ? TIERS.findIndex((x) => x.id === t) + 1 : 0)).join('')
  return toBase64Url(JSON.stringify({ v: 1, n: cleanName(challenge.name), d: challenge.dive, s: challenge.score, t: tiers }))
}

/** Parses a challenge code, rejecting anything malformed or impossible. */
export function decodeChallenge(code: string): Challenge | null {
  try {
    const raw = JSON.parse(fromBase64Url(code)) as Record<string, unknown>
    const name = typeof raw.n === 'string' ? cleanName(raw.n) : ''
    const { d: dive, s: score, t: tiers } = raw
    if (raw.v !== 1 || !name) return null
    if (!Number.isInteger(dive) || (dive as number) < 1) return null
    if (typeof tiers !== 'string' || !new RegExp(`^[0-5]{${ROUNDS}}$`).test(tiers)) return null
    const parsed = [...tiers].map((c) => (c === '0' ? null : TIERS[Number(c) - 1].id))
    const expected = parsed.reduce((sum, t) => sum + (t ? TIERS.find((x) => x.id === t)!.points : 0), 0)
    if (score !== expected) return null
    return { name, dive: dive as number, score: expected, tiers: parsed }
  } catch {
    return null
  }
}

export function challengeUrl(base: string, challenge: Challenge): string {
  return `${base.split('#')[0]}#duel=${encodeChallenge(challenge)}`
}

export function readChallengeFromHash(hash: string): Challenge | null {
  const match = /[#&]duel=([A-Za-z0-9_-]+)/.exec(hash)
  return match ? decodeChallenge(match[1]) : null
}

/** Returns rivals with one side of a dive recorded. Existing scores are kept: the first result counts. */
export function recordDuel(
  rivals: Record<string, Rival>,
  name: string,
  dive: number,
  side: 'me' | 'them',
  score: number,
  now = Date.now(),
): Record<string, Rival> {
  const rival = rivals[name] ?? { name, dives: {}, updated: now }
  const entry = rival.dives[dive] ?? {}
  if (entry[side] !== undefined) return rivals
  return { ...rivals, [name]: { ...rival, updated: now, dives: { ...rival.dives, [dive]: { ...entry, [side]: score } } } }
}

export function headToHead(rival: Rival): HeadToHead {
  const result: HeadToHead = { wins: 0, losses: 0, draws: 0, myTotal: 0, theirTotal: 0, myBest: 0, theirBest: 0 }
  for (const { me, them } of Object.values(rival.dives)) {
    if (me !== undefined) {
      result.myTotal += me
      result.myBest = Math.max(result.myBest, me)
    }
    if (them !== undefined) {
      result.theirTotal += them
      result.theirBest = Math.max(result.theirBest, them)
    }
    if (me === undefined || them === undefined) continue
    if (me > them) result.wins++
    else if (me < them) result.losses++
    else result.draws++
  }
  return result
}

export function latestRival(rivals: Record<string, Rival>): Rival | null {
  return Object.values(rivals).sort((x, y) => y.updated - x.updated)[0] ?? null
}
