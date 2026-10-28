import { describe, expect, it } from 'vitest'
import { keysFor } from '../lib/match'
import { ROUNDS } from '../lib/tiers'
import { PROMPTS } from './prompts'

describe('prompt data', () => {
  it('has enough prompts for a dive', () => {
    expect(PROMPTS.length).toBeGreaterThanOrEqual(ROUNDS)
  })

  it('has unique prompt ids', () => {
    expect(new Set(PROMPTS.map((p) => p.id)).size).toBe(PROMPTS.length)
  })

  for (const prompt of PROMPTS) {
    describe(prompt.id, () => {
      it('writes the prompt and every answer in Tamil script', () => {
        expect(prompt.ta).toMatch(/[\u0B80-\u0BFF]/)
        for (const answer of prompt.answers) expect(answer.ta).toMatch(/[\u0B80-\u0BFF]/)
      })

      it('has at least one common answer', () => {
        expect(prompt.answers.some((a) => a.tier === 'common')).toBe(true)
      })

      it.each([true, false])('never gives two answers the same key (tamil=%s)', (tamil) => {
        const owner = new Map<string, string>()
        for (const answer of prompt.answers) {
          for (const key of keysFor(answer, tamil)) {
            const existing = owner.get(key)
            expect(existing === undefined || existing === answer.en, `"${key}" is shared by ${existing} and ${answer.en}`).toBe(true)
            owner.set(key, answer.en)
          }
        }
      })
    })
  }
})
