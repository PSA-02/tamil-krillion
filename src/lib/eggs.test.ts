import { describe, expect, it } from 'vitest'
import { PROMPTS_BY_ID } from '../data/prompts'
import { answerEgg, KONAMI, konamiStep } from './eggs'
import { matchAnswer } from './match'

describe('answer easter eggs', () => {
  it('finds sundal typed anywhere, in either script', () => {
    expect(answerEgg('rivers', 'Sundal', null)).toBe('sundal')
    expect(answerEgg('rivers', 'சுண்டல்', null)).toBe('sundal')
  })

  it('whistles for a CSK legend', () => {
    const csk = PROMPTS_BY_ID.csk
    expect(answerEgg('csk', 'thala', matchAnswer(csk, 'thala'))).toBe('whistle')
    expect(answerEgg('csk', 'conway', matchAnswer(csk, 'conway'))).toBeNull()
  })

  it("celebrates Marina's landscape", () => {
    const thinai = PROMPTS_BY_ID.thinai
    expect(answerEgg('thinai', 'neithal', matchAnswer(thinai, 'neithal'))).toBe('neithal')
  })

  it('launches a kattumaram', () => {
    expect(answerEgg('films', 'catamaran', null)).toBe('kattumaram')
  })
})

describe('konami code', () => {
  it('completes after the full sequence and resets on a wrong key', () => {
    let progress = 0
    for (const key of KONAMI) progress = konamiStep(progress, key)
    expect(progress).toBe(KONAMI.length)
    expect(konamiStep(3, 'x')).toBe(0)
    expect(konamiStep(5, 'ArrowUp')).toBe(1)
  })
})
