import type { TierId } from '../data/types'

/**
 * Chiptune-style cues synthesised with the Web Audio API, so the game ships
 * no audio files. Every call is a no-op when muted or when audio is
 * unavailable.
 */

export type Cue = 'tick' | 'miss' | 'timeout' | 'finish' | 'whistle' | 'secret' | 'click'

const MUTE_KEY = 'krillion-tamil:muted'
const TIER_STEPS: Record<TierId, number> = { common: 1, uncommon: 2, rare: 3, deep: 4, krillion: 5 }
// A pentatonic run (C D E G A C' D') keeps every arpeggio consonant.
const SCALE = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66]

let context: AudioContext | null = null
let muted = readMuted()
let waves: { source: AudioBufferSourceNode; gain: GainNode } | null = null

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export function isMuted(): boolean {
  return muted
}

export function setMuted(value: boolean): void {
  muted = value
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0')
  } catch {
    // Preference just won't persist.
  }
  if (value) stopWaves()
}

function audio(): AudioContext | null {
  if (muted || typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  context ??= new Ctor()
  if (context.state === 'suspended') void context.resume()
  return context
}

function blip(ctx: AudioContext, freq: number, start: number, length: number, type: OscillatorType = 'square', volume = 0.06) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  gain.gain.setValueAtTime(volume, start)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length)
  osc.connect(gain).connect(ctx.destination)
  osc.start(start)
  osc.stop(start + length + 0.02)
}

/** A rising arpeggio: rarer tiers climb higher. */
export function playTier(tier: TierId): void {
  const ctx = audio()
  if (!ctx) return
  const now = ctx.currentTime
  const steps = TIER_STEPS[tier] + 1
  for (let i = 0; i < steps; i++) blip(ctx, SCALE[i], now + i * 0.07, 0.16)
  if (tier === 'krillion') blip(ctx, SCALE[6] * 2, now + steps * 0.07, 0.4, 'triangle', 0.08)
}

export function play(cue: Cue): void {
  const ctx = audio()
  if (!ctx) return
  const now = ctx.currentTime
  switch (cue) {
    case 'click':
      blip(ctx, 880, now, 0.04, 'square', 0.03)
      break
    case 'tick':
      blip(ctx, 1200, now, 0.05, 'square', 0.035)
      break
    case 'miss':
      blip(ctx, 220, now, 0.18, 'sawtooth', 0.05)
      blip(ctx, 165, now + 0.12, 0.25, 'sawtooth', 0.05)
      break
    case 'timeout':
      ;[392, 330, 262].forEach((f, i) => blip(ctx, f, now + i * 0.12, 0.2, 'triangle', 0.08))
      break
    case 'finish':
      ;[523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5].forEach((f, i) => blip(ctx, f, now + i * 0.1, 0.2, 'square', 0.05))
      break
    case 'secret':
      ;[1046.5, 1318.5, 1568, 2093].forEach((f, i) => blip(ctx, f, now + i * 0.06, 0.3, 'triangle', 0.07))
      break
    case 'whistle': {
      // Two short referee-style whistles: "whistle podu!"
      for (const offset of [0, 0.32]) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const lfo = ctx.createOscillator()
        const depth = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(2600, now + offset)
        lfo.frequency.value = 38
        depth.gain.value = 120
        lfo.connect(depth).connect(osc.frequency)
        gain.gain.setValueAtTime(0.0001, now + offset)
        gain.gain.exponentialRampToValueAtTime(0.09, now + offset + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.26)
        osc.connect(gain).connect(ctx.destination)
        osc.start(now + offset)
        lfo.start(now + offset)
        osc.stop(now + offset + 0.3)
        lfo.stop(now + offset + 0.3)
      }
      break
    }
  }
}

/** Soft surf: low-passed noise whose volume swells like waves on the shore. */
export function startWaves(): void {
  const ctx = audio()
  if (!ctx || waves) return
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 500
  const gain = ctx.createGain()
  gain.gain.value = 0.015
  const swell = ctx.createOscillator()
  const swellDepth = ctx.createGain()
  swell.frequency.value = 0.12
  swellDepth.gain.value = 0.012
  swell.connect(swellDepth).connect(gain.gain)
  source.connect(filter).connect(gain).connect(ctx.destination)
  source.start()
  swell.start()
  waves = { source, gain }
}

export function stopWaves(): void {
  if (!waves) return
  try {
    waves.source.stop()
  } catch {
    // Already stopped.
  }
  waves = null
}
