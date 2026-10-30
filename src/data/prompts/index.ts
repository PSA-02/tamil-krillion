import type { Prompt } from '../types'
import { CHENNAI_PROMPTS } from './chennai'
import { CINEMA_PROMPTS } from './cinema'
import { CORE_PROMPTS } from './core'
import { CULTURE_PROMPTS } from './culture'
import { FOOD_PROMPTS } from './food'
import { HERITAGE_PROMPTS } from './heritage'
import { NATURE_PROMPTS } from './nature'
import { SPORT_PROMPTS } from './sport'

/**
 * The full prompt pool. Rarity tiers are hand-curated: they estimate how few
 * players would think of an answer, not how obscure the thing itself is.
 * Order matters: the daily schedule shuffles by position, so append new
 * prompts at the end of a file rather than reordering.
 */
export const PROMPTS: Prompt[] = [
  ...CORE_PROMPTS,
  ...CHENNAI_PROMPTS,
  ...CULTURE_PROMPTS,
  ...FOOD_PROMPTS,
  ...NATURE_PROMPTS,
  ...HERITAGE_PROMPTS,
  ...CINEMA_PROMPTS,
  ...SPORT_PROMPTS,
]

export const PROMPTS_BY_ID: Record<string, Prompt> = Object.fromEntries(PROMPTS.map((p) => [p.id, p]))
