import { describe, expect, it } from 'vitest'
import { currentStreak, EMPTY_STATS, recordDaily } from './storage'

const record = (score: number) => ({ score, results: [] })

describe('recordDaily', () => {
  it('builds a streak over consecutive days', () => {
    let stats = recordDaily(EMPTY_STATS, '2026-11-01', record(100))
    stats = recordDaily(stats, '2026-11-02', record(300))
    expect(stats).toMatchObject({ played: 2, best: 300, streak: 2, maxStreak: 2 })
  })

  it('resets the streak after a missed day but keeps the max', () => {
    let stats = recordDaily(EMPTY_STATS, '2026-11-01', record(100))
    stats = recordDaily(stats, '2026-11-02', record(100))
    stats = recordDaily(stats, '2026-11-05', record(50))
    expect(stats).toMatchObject({ streak: 1, maxStreak: 2, best: 100 })
  })

  it('ignores a second attempt on the same day', () => {
    const once = recordDaily(EMPTY_STATS, '2026-11-01', record(100))
    expect(recordDaily(once, '2026-11-01', record(700))).toBe(once)
  })
})

describe('currentStreak', () => {
  it('lapses once a whole day is skipped', () => {
    const stats = recordDaily(EMPTY_STATS, '2026-11-01', record(100))
    expect(currentStreak(stats, '2026-11-02')).toBe(1)
    expect(currentStreak(stats, '2026-11-03')).toBe(0)
  })
})
