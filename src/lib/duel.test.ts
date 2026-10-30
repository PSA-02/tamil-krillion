import { describe, expect, it } from 'vitest'
import {
  challengeUrl,
  cleanName,
  decodeChallenge,
  encodeChallenge,
  headToHead,
  latestRival,
  readChallengeFromHash,
  recordDuel,
  type Challenge,
} from './duel'

const challenge: Challenge = {
  name: 'தரணி',
  dive: 4,
  score: 240,
  tiers: ['common', 'krillion', null, 'uncommon', 'rare', 'common', 'uncommon'],
}

describe('challenge links', () => {
  it('round-trips a challenge, including a Tamil name', () => {
    expect(decodeChallenge(encodeChallenge(challenge))).toEqual(challenge)
  })

  it('reads a challenge from the URL hash', () => {
    const url = challengeUrl('https://psa-02.github.io/tamil-krillion/#old', challenge)
    expect(url.startsWith('https://psa-02.github.io/tamil-krillion/#duel=')).toBe(true)
    expect(readChallengeFromHash(new URL(url).hash)).toEqual(challenge)
  })

  it('rejects garbage and scores that do not add up', () => {
    expect(decodeChallenge('not-a-code')).toBeNull()
    const forged = btoa(JSON.stringify({ v: 1, n: 'x', d: 1, s: 700, t: '1111111' }))
    expect(decodeChallenge(forged)).toBeNull()
  })

  it('strips control characters and caps name length', () => {
    expect(cleanName('  <b>Tred</b>\u0000 ')).toBe('bTred/b')
    expect(cleanName('a'.repeat(50))).toHaveLength(20)
  })
})

describe('head to head', () => {
  it('counts wins, losses and draws only for dives both players finished', () => {
    let rivals = recordDuel({}, 'Ravi', 1, 'them', 100, 1)
    rivals = recordDuel(rivals, 'Ravi', 1, 'me', 200, 2)
    rivals = recordDuel(rivals, 'Ravi', 2, 'me', 50, 3)
    rivals = recordDuel(rivals, 'Ravi', 2, 'them', 90, 4)
    rivals = recordDuel(rivals, 'Ravi', 3, 'me', 70, 5)
    rivals = recordDuel(rivals, 'Ravi', 3, 'them', 70, 6)
    rivals = recordDuel(rivals, 'Ravi', 4, 'me', 300, 7)
    expect(headToHead(rivals.Ravi)).toEqual({
      wins: 1,
      losses: 1,
      draws: 1,
      myTotal: 620,
      theirTotal: 260,
      myBest: 300,
      theirBest: 100,
    })
  })

  it('keeps the first score for a dive', () => {
    const once = recordDuel({}, 'Ravi', 1, 'them', 100)
    expect(recordDuel(once, 'Ravi', 1, 'them', 700)).toBe(once)
  })

  it('picks the most recently updated rival', () => {
    let rivals = recordDuel({}, 'Ravi', 1, 'them', 100, 10)
    rivals = recordDuel(rivals, 'Meena', 1, 'them', 100, 20)
    expect(latestRival(rivals)?.name).toBe('Meena')
    expect(latestRival({})).toBeNull()
  })
})
