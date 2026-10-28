import type { TierId } from '../data/types'

export interface Tier {
  id: TierId
  points: number
  emoji: string
  ta: string
  en: string
}

/** Ordered from most common to rarest. Depth in metres is points × 10. */
export const TIERS: Tier[] = [
  { id: 'common', points: 10, emoji: '🐚', ta: 'சிப்பி', en: 'Shell' },
  { id: 'uncommon', points: 30, emoji: '🐟', ta: 'மீன்', en: 'Fish' },
  { id: 'rare', points: 60, emoji: '🪸', ta: 'பவளம்', en: 'Coral' },
  { id: 'deep', points: 85, emoji: '🦪', ta: 'முத்து', en: 'Pearl' },
  { id: 'krillion', points: 100, emoji: '💎', ta: 'கோடியில் ஒன்று', en: 'One in a Crore' },
]

export const TIER_BY_ID = Object.fromEntries(TIERS.map((t) => [t.id, t])) as Record<TierId, Tier>

export const MISS_EMOJI = '⬛'
export const ROUNDS = 7
export const SECONDS_PER_ROUND = 25
export const METRES_PER_POINT = 10
export const MAX_DEPTH = ROUNDS * TIER_BY_ID.krillion.points * METRES_PER_POINT

export function pointsFor(tier: TierId | null): number {
  return tier ? TIER_BY_ID[tier].points : 0
}

export function depthFor(points: number): number {
  return points * METRES_PER_POINT
}
