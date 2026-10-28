import type { Answer, Prompt } from '../data/types'

const TAMIL_CHAR = /[\u0B80-\u0BFF]/
const NOT_TAMIL = /[^\u0B80-\u0BFF]/g
const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/g

/**
 * Romanised Tamil has no fixed spelling ("Thanjavur", "Tanjavoor"), so latin
 * input is reduced to a phonetic key: aspirates and voiced consonants merge
 * the way Tamil script merges them, long vowels shorten and doubled letters
 * collapse.
 */
const LATIN_RULES: [RegExp, string][] = [
  [/zh/g, 'l'],
  [/sh/g, 's'],
  [/ch/g, 's'],
  [/th/g, 't'],
  [/dh/g, 't'],
  [/ph/g, 'p'],
  [/kh/g, 'k'],
  [/gh/g, 'g'],
  [/bh/g, 'b'],
  [/aa/g, 'a'],
  [/ee/g, 'i'],
  [/oo/g, 'u'],
  [/ou/g, 'u'],
  [/w/g, 'v'],
  [/y/g, 'i'],
  [/[cqg]/g, 'k'],
  [/b/g, 'p'],
  [/d/g, 't'],
  [/[jz]/g, 's'],
  [/x/g, 'ks'],
  [/h/g, ''],
]

export function latinKey(input: string): string {
  let key = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/g, '')
  for (const [pattern, replacement] of LATIN_RULES) {
    key = key.replace(pattern, replacement)
  }
  return key.replace(/(.)\1+/g, '$1')
}

export function tamilKey(input: string): string {
  return input.normalize('NFC').replace(ZERO_WIDTH, '').replace(NOT_TAMIL, '')
}

export function isTamil(input: string): boolean {
  return TAMIL_CHAR.test(input)
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const curr = [i]
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
    }
    prev = curr
  }
  return prev[b.length]
}

/** Typos allowed for a key of this length. Short keys must match exactly. */
export function tolerance(length: number): number {
  if (length < 5) return 0
  if (length < 9) return 1
  return 2
}

export function keysFor(answer: Answer, tamil: boolean): string[] {
  const raw = tamil
    ? [answer.ta, ...(answer.taAliases ?? [])].map(tamilKey)
    : [answer.en, ...(answer.aliases ?? [])].map(latinKey)
  return [...new Set(raw.filter(Boolean))]
}

/**
 * Finds the answer a player meant. Exact key matches win; otherwise the
 * closest answer within the typo tolerance, provided no other answer is
 * equally close.
 */
export function matchAnswer(prompt: Prompt, input: string): Answer | null {
  const tamil = isTamil(input)
  const key = tamil ? tamilKey(input) : latinKey(input)
  if (!key) return null

  let best: Answer | null = null
  let bestDistance = Infinity
  let tied = false

  for (const answer of prompt.answers) {
    for (const candidate of keysFor(answer, tamil)) {
      const distance = levenshtein(key, candidate)
      if (distance === 0) return answer
      if (distance > tolerance(Math.min(key.length, candidate.length))) continue
      if (distance < bestDistance) {
        best = answer
        bestDistance = distance
        tied = false
      } else if (distance === bestDistance && best !== answer) {
        tied = true
      }
    }
  }
  return tied ? null : best
}
