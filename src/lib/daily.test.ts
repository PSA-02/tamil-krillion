import { describe, expect, it } from 'vitest'
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
