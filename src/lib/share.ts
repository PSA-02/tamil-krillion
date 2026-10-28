import type { TierId } from '../data/types'
import { MISS_EMOJI, TIER_BY_ID, depthFor } from './tiers'

export function shareText(dive: number, score: number, tiers: (TierId | null)[], url: string): string {
  const row = tiers.map((t) => (t ? TIER_BY_ID[t].emoji : MISS_EMOJI)).join('')
  const depth = depthFor(score).toLocaleString('en-IN')
  return `கிரில்லியன் தமிழ் #${dive}\n🌊 ${depth} மீ ஆழம் · ${score} புள்ளிகள்\n${row}\n${url}`
}
