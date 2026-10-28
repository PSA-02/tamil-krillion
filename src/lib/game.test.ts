import { describe, expect, it } from 'vitest'
import { PROMPTS_BY_ID } from '../data/prompts'
import { deeperAnswers, scoreRound, totalPoints } from './game'
import { shareText } from './share'

const epics = PROMPTS_BY_ID.epics

describe('scoreRound', () => {
  it('scores a hit by its tier', () => {
    expect(scoreRound(epics, 'Kundalakesi')).toMatchObject({ status: 'hit', tier: 'deep', points: 85 })
  })

  it('scores a miss, a timeout and a skip as zero', () => {
    expect(scoreRound(epics, 'Ramayanam')).toMatchObject({ status: 'miss', points: 0 })
    expect(scoreRound(epics, 'Manimekalai', 'timeout')).toMatchObject({ status: 'timeout', points: 0 })
    expect(scoreRound(epics, '', 'skip')).toMatchObject({ status: 'skip', points: 0 })
  })

  it('sums a dive', () => {
    expect(totalPoints([scoreRound(epics, 'Manimekalai'), scoreRound(epics, 'Valayapathi')])).toBe(95)
  })
})

describe('deeperAnswers', () => {
  it('lists only rarer answers, rarest first', () => {
    const tiers = deeperAnswers(epics, 'common').map((a) => a.tier)
    expect(tiers).toEqual(['deep', 'deep', 'rare'])
    expect(deeperAnswers(epics, 'deep')).toEqual([])
  })
})

describe('shareText', () => {
  it('summarises depth and tiers without revealing answers', () => {
    const text = shareText(3, 245, ['common', 'krillion', null], 'https://example.com/')
    expect(text).toContain('#3')
    expect(text).toContain('2,450')
    expect(text).toContain('🐚💎⬛')
    expect(text).not.toMatch(/Manimekalai/)
  })
})
