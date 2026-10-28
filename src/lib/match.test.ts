import { describe, expect, it } from 'vitest'
import { PROMPTS_BY_ID } from '../data/prompts'
import { latinKey, levenshtein, matchAnswer, tamilKey } from './match'

const breakfast = PROMPTS_BY_ID.breakfast
const districts = PROMPTS_BY_ID.districts

describe('latinKey', () => {
  it('merges common romanisation variants', () => {
    expect(latinKey('Idly')).toBe(latinKey('idli'))
    expect(latinKey('Thanjavur')).toBe(latinKey('Tanjavoor'))
    expect(latinKey('Kozhukattai')).toBe(latinKey('kolukatai'))
    expect(latinKey('Vaigasi')).toBe(latinKey('Vaikasi'))
  })

  it('ignores case, spaces and punctuation', () => {
    expect(latinKey('Ven Pongal!')).toBe(latinKey('venpongal'))
  })
})

describe('tamilKey', () => {
  it('strips zero-width joiners and non-Tamil characters', () => {
    expect(tamilKey('இட்\u200Cலி ')).toBe('இட்லி')
  })
})

describe('levenshtein', () => {
  it('counts edits', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3)
    expect(levenshtein('', 'abc')).toBe(3)
    expect(levenshtein('same', 'same')).toBe(0)
  })
})

describe('matchAnswer', () => {
  it('matches Tamil script', () => {
    expect(matchAnswer(breakfast, 'இட்லி')?.en).toBe('Idli')
  })

  it('matches Tamil-script aliases', () => {
    expect(matchAnswer(districts, 'திருச்சி')?.en).toBe('Tiruchirappalli')
  })

  it('matches English names and aliases', () => {
    expect(matchAnswer(districts, 'Trichy')?.en).toBe('Tiruchirappalli')
    expect(matchAnswer(districts, 'madras')?.en).toBe('Chennai')
  })

  it('tolerates small typos in longer words', () => {
    expect(matchAnswer(districts, 'Coimbatre')?.en).toBe('Coimbatore')
    expect(matchAnswer(districts, 'திருநெல்வெலி')?.en).toBe('Tirunelveli')
  })

  it('requires short answers to match exactly', () => {
    expect(matchAnswer(breakfast, 'kalu')).toBeNull()
  })

  it('rejects answers that are not on the list', () => {
    expect(matchAnswer(breakfast, 'pizza')).toBeNull()
    expect(matchAnswer(breakfast, '   ')).toBeNull()
  })

  it('refuses to guess between two equally close answers', () => {
    // "Tiruvalarur" is two edits from both Tiruvallur and Tiruvarur.
    expect(matchAnswer(districts, 'Tiruvalarur')).toBeNull()
  })
})
