import type { Answer, TierId } from '../types'

export const C: TierId = 'common'
export const U: TierId = 'uncommon'
export const R: TierId = 'rare'
export const D: TierId = 'deep'
export const K: TierId = 'krillion'

/** Builds an answer. Extra strings are romanised aliases. */
export function a(ta: string, en: string, tier: TierId, ...aliases: string[]): Answer {
  return { ta, en, tier, aliases }
}

/** Adds Tamil-script alternative spellings to an answer. */
export function withTa(answer: Answer, ...taAliases: string[]): Answer {
  return { ...answer, taAliases }
}
