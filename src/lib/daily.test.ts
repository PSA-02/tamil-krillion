import { describe, expect, it } from 'vitest'
import { PROMPTS } from '../data/prompts'
import { addDays, dailyPrompts, dateKey, diveNumber, LAUNCH_DATE } from './daily'
import { ROUNDS } from './tiers'

describe('dateKey', () => {
  it('rolls over at midnight India Standard Time', () => {
    expect(dateKey(new Date('2026-10-28T18:29:00Z'))).toBe('2026-10-28')
    expect(dateKey(new Date('2026-10-28T18:31:00Z'))).toBe('2026-10-29')
  })
})

describe('addDays', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDays('2027-01-01', -1)).toBe('2026-12-31')
  })
})

describe('diveNumber', () => {
  it('starts at 1 on launch day', () => {
    expect(diveNumber(LAUNCH_DATE)).toBe(1)
    expect(diveNumber(addDays(LAUNCH_DATE, 9))).toBe(10)
  })
})

describe('dailyPrompts', () => {
  it('is the same for everyone on the same day', () => {
    expect(dailyPrompts('2026-11-05').map((p) => p.id)).toEqual(dailyPrompts('2026-11-05').map((p) => p.id))
  })

  it('picks distinct prompts for a full dive', () => {
    const ids = dailyPrompts('2026-11-05').map((p) => p.id)
    expect(ids).toHaveLength(ROUNDS)
    expect(new Set(ids).size).toBe(ROUNDS)
  })

  it('changes from day to day', () => {
    const days = Array.from({ length: 10 }, (_, i) => dailyPrompts(addDays(LAUNCH_DATE, i)).map((p) => p.id).join())
    expect(new Set(days).size).toBeGreaterThan(5)
  })
})

describe('daily schedule', () => {
  const days = Array.from({ length: 400 }, (_, i) => dailyPrompts(addDays(LAUNCH_DATE, i)).map((p) => p.id))

  it('never repeats a prompt within the same day', () => {
    for (const ids of days) expect(new Set(ids).size).toBe(ROUNDS)
  })

  it('keeps every prompt away for at least three days', () => {
    const lastSeen = new Map<string, number>()
    days.forEach((ids, day) => {
      for (const id of ids) {
        const previous = lastSeen.get(id)
        if (previous !== undefined) expect(day - previous, `${id} on days ${previous} and ${day}`).toBeGreaterThanOrEqual(3)
        lastSeen.set(id, day)
      }
    })
  })

  it('uses every prompt in the pool within the first deck', () => {
    const firstDeck = new Set(days.slice(0, Math.ceil(PROMPTS.length / ROUNDS)).flat())
    expect(firstDeck.size).toBe(PROMPTS.length)
  })
})
