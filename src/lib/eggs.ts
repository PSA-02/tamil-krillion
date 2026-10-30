import type { Answer } from '../data/types'
import { latinKey } from './match'

export type EggId = 'night' | 'lighthouse' | 'sundal' | 'whistle' | 'neithal' | 'kattumaram' | 'crore'

/** Every easter egg, in the order the home screen counts them. */
export const EGGS: EggId[] = ['night', 'lighthouse', 'sundal', 'whistle', 'neithal', 'kattumaram', 'crore']

export const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

const SUNDAL = [latinKey('sundal'), 'சுண்டல்']
const KATTUMARAM = [latinKey('kattumaram'), latinKey('catamaran'), 'கட்டுமரம்']
const CSK_HEROES = new Set(['M. S. Dhoni', 'Suresh Raina', 'Ravindra Jadeja'])

function typed(input: string, keys: string[]): boolean {
  const lower = input.trim().toLowerCase()
  return keys.some((k) => lower === k || latinKey(lower) === k)
}

/** Works out whether an answer just typed unlocks an easter egg. */
export function answerEgg(promptId: string, input: string, answer: Answer | null): EggId | null {
  if (typed(input, SUNDAL)) return 'sundal'
  if (typed(input, KATTUMARAM)) return 'kattumaram'
  if (promptId === 'csk' && answer && CSK_HEROES.has(answer.en)) return 'whistle'
  if (promptId === 'thinai' && answer?.en === 'Neithal') return 'neithal'
  return null
}

/** Tracks progress through the Konami code; returns true when it completes. */
export function konamiStep(progress: number, key: string): number {
  const expected = KONAMI[progress]
  if (key.toLowerCase() === expected.toLowerCase()) return progress + 1
  return key === KONAMI[0] ? 1 : 0
}
