import type { Answer, Prompt, TierId } from '../data/types'
import { matchAnswer } from './match'
import { TIERS, pointsFor } from './tiers'

export type RoundStatus = 'hit' | 'miss' | 'timeout' | 'skip'

export interface RoundResult {
  promptId: string
  input: string
  answer: Answer | null
  tier: TierId | null
  points: number
  status: RoundStatus
}

export function scoreRound(prompt: Prompt, input: string, status: Exclude<RoundStatus, 'hit' | 'miss'> | null = null): RoundResult {
  const answer = status ? null : matchAnswer(prompt, input)
  const tier = answer?.tier ?? null
  return {
    promptId: prompt.id,
    input: input.trim(),
    answer,
    tier,
    points: pointsFor(tier),
    status: status ?? (answer ? 'hit' : 'miss'),
  }
}

export function totalPoints(results: RoundResult[]): number {
  return results.reduce((sum, r) => sum + r.points, 0)
}

const RANK = Object.fromEntries(TIERS.map((t, i) => [t.id, i])) as Record<TierId, number>

/** Rarer answers than the one given, rarest first, to show what was down there. */
export function deeperAnswers(prompt: Prompt, tier: TierId | null, limit = 3): Answer[] {
  const floor = tier ? RANK[tier] : -1
  return prompt.answers
    .filter((a) => RANK[a.tier] > floor)
    .sort((x, y) => RANK[y.tier] - RANK[x.tier])
    .slice(0, limit)
}
