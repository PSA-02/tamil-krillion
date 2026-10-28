export type TierId = 'common' | 'uncommon' | 'rare' | 'deep' | 'krillion'

export interface Answer {
  /** Canonical Tamil spelling, also used for Tamil-script matching. */
  ta: string
  /** Canonical English / transliterated spelling. */
  en: string
  tier: TierId
  /** Extra romanised spellings accepted for this answer. */
  aliases?: string[]
  /** Extra Tamil-script spellings accepted for this answer. */
  taAliases?: string[]
}

export interface Prompt {
  id: string
  ta: string
  en: string
  answers: Answer[]
}
