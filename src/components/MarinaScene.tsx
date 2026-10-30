import { useEffect, useRef } from 'react'

export interface SceneExtras {
  night?: boolean
  beam?: boolean
  sundal?: boolean
  kattumaram?: boolean
}

interface Props extends SceneExtras {
  /** Short band for in-game screens; tall hero for the home screen. */
  variant?: 'hero' | 'band'
  onLighthouseClick?: () => void
}

const WIDTH = 240
const HEIGHTS = { hero: 104, band: 60 }
const FPS = 12

interface Palette {
  sky: string[]
  sun: string
  sunGlow: string
  cloud: string
  seaFar: string
  seaNear: string
  foam: string
  glint: string
  sand: string
  sandDark: string
  wetSand: string
  ink: string
}

const DAY: Palette = {
  sky: ['#a9d6e5', '#bfe0e6', '#d6e7e1', '#ecdcc9', '#f6cfae', '#f8c39c'],
  sun: '#fff1c9',
  sunGlow: '#fbd9a6',
  cloud: '#fdf6ec',
  seaFar: '#79bfb9',
  seaNear: '#3f8f98',
  foam: '#f4fbf9',
  glint: '#fff4d6',
  sand: '#f1dfbf',
  sandDark: '#e3caa0',
  wetSand: '#d6bb90',
  ink: '#3a3f4b',
}

const NIGHT: Palette = {
  sky: ['#0d1b2e', '#12233a', '#182c46', '#1f3552', '#28405f', '#334c6b'],
  sun: '#f3f0dc',
  sunGlow: '#3d5373',
  cloud: '#3a5070',
  seaFar: '#24486a',
  seaNear: '#16304b',
  foam: '#b9d3e3',
  glint: '#e8ecd8',
  sand: '#8c8296',
  sandDark: '#776f84',
  wetSand: '#655e74',
  ink: '#0b1220',
}

/** Deterministic noise so sand speckles and stars stay put between frames. */
function noise(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return n - Math.floor(n)
}

function draw(ctx: CanvasRenderingContext2D, h: number, t: number, extras: SceneExtras) {
  const p = extras.night ? NIGHT : DAY
  const horizon = Math.round(h * 0.5)
  const shore = Math.round(h * 0.78)
  const px = (x: number, y: number, w = 1, hh = 1, c?: string) => {
    if (c) ctx.fillStyle = c
    ctx.fillRect(Math.round(x), Math.round(y), w, hh)
  }

  // Sky in hard-edged bands, the classic pixel-art gradient.
  const band = Math.ceil(horizon / p.sky.length)
  p.sky.forEach((c, i) => px(0, i * band, WIDTH, band, c))

  if (extras.night) {
    for (let i = 0; i < 70; i++) {
      const x = Math.floor(noise(i, 1) * WIDTH)
      const y = Math.floor(noise(i, 2) * (horizon - 4))
      if (Math.sin(t * 2 + i) > -0.6) px(x, y, 1, 1, i % 7 === 0 ? '#fff6c8' : '#cfe0f5')
    }
  }

  // Sun (or moon), low over the Bay of Bengal.
  const sunX = 58
  const sunY = horizon - Math.round(h * 0.2)
  ctx.fillStyle = p.sunGlow
  for (let dy = -11; dy <= 11; dy++) {
    const span = Math.round(Math.sqrt(121 - dy * dy))
    px(sunX - span, sunY + dy, span * 2, 1)
  }
  ctx.fillStyle = p.sun
  for (let dy = -8; dy <= 8; dy++) {
    const span = Math.round(Math.sqrt(64 - dy * dy))
    px(sunX - span, sunY + dy, span * 2, 1)
  }

  // Drifting clouds.
  ctx.fillStyle = p.cloud
  for (const [i, y, w] of [
    [0, 10, 26],
    [1, 22, 18],
    [2, 6, 14],
  ]) {
    const x = ((i * 97 + t * (3 + i)) % (WIDTH + 40)) - 30
    px(x, y, w, 3)
    px(x + 4, y - 2, w - 10, 2)
    px(x + 8, y - 4, Math.max(4, w - 18), 2)
  }

  // Gulls.
  ctx.fillStyle = p.ink
  for (let i = 0; i < 3; i++) {
    const gx = ((t * (9 + i * 2) + i * 70) % (WIDTH + 20)) - 10
    const gy = 14 + i * 7 + Math.round(Math.sin(t * 3 + i) * 2)
    const flap = Math.sin(t * 8 + i) > 0 ? 0 : 1
    px(gx - 2, gy - 1 + flap, 2, 1)
    px(gx, gy, 1, 1)
    px(gx + 1, gy - 1 + flap, 2, 1)
  }

  // Sea: rows darken toward the shore and carry moving highlights.
  const seaRows = shore - horizon
  for (let row = 0; row < seaRows; row++) {
    const y = horizon + row
    const mix = row / seaRows
    ctx.fillStyle = mix < 0.35 ? p.seaFar : p.seaNear
    px(0, y, WIDTH, 1)
    const speed = 4 + mix * 14
    const spacing = 22 - Math.round(mix * 8)
    const length = 2 + Math.round(mix * 5)
    ctx.fillStyle = row % 3 === 0 ? p.foam : p.glint
    for (let k = -1; k < WIDTH / spacing + 1; k++) {
      const x = (k * spacing + ((row * 7) % spacing) + t * speed * (row % 2 ? 1 : -0.6)) % (WIDTH + spacing)
      if ((row + k) % 3 === 0) px(x, y, length, 1)
    }
  }

  // Sun glitter on the water.
  ctx.fillStyle = p.glint
  for (let row = 1; row < seaRows - 2; row += 2) {
    if (Math.sin(t * 6 + row * 1.7) > 0.1) px(sunX - 6 + Math.round(Math.sin(row + t * 2) * 4), horizon + row, 3 + (row % 4), 1)
  }

  // A cargo ship creeping along the horizon.
  const shipX = WIDTH - ((t * 1.5) % (WIDTH + 30))
  ctx.fillStyle = p.ink
  px(shipX, horizon - 2, 14, 2)
  px(shipX + 3, horizon - 4, 6, 2)
  px(shipX + 10, horizon - 6, 2, 4)

  // Kattumaram bobbing near shore; the easter egg sails one across.
  const bob = Math.round(Math.sin(t * 2.2) * 1)
  const boatX = extras.kattumaram ? ((t * 12) % (WIDTH + 40)) - 30 : 150
  const boatY = horizon + Math.round(seaRows * 0.45) + bob
  px(boatX, boatY, 16, 2, '#7a4b2a')
  px(boatX + 1, boatY + 2, 14, 1, '#5d3820')
  px(boatX + 6, boatY - 9, 1, 9, '#5d3820')
  ctx.fillStyle = extras.kattumaram ? '#e9c46a' : '#f6efe2'
  for (let i = 0; i < 7; i++) px(boatX + 7, boatY - 9 + i, Math.max(1, 6 - Math.abs(i - 3)), 1)
  px(boatX + 9, boatY - 2, 2, 2, p.ink)

  // Shoreline foam laps in and out.
  for (let x = 0; x < WIDTH; x++) {
    const reach = Math.round(Math.sin(x / 13 + t * 1.3) * 1.5 + Math.sin(x / 5 - t * 0.7))
    const y = shore + reach
    px(x, y - 1, 1, 1, p.foam)
    px(x, y, 1, 2, p.wetSand)
    px(x, y + 2, 1, h - y - 2, p.sand)
  }
  for (let i = 0; i < 160; i++) {
    const x = Math.floor(noise(i, 7) * WIDTH)
    const y = shore + 4 + Math.floor(noise(i, 9) * (h - shore - 4))
    px(x, y, 1, 1, p.sandDark)
  }

  // Beach umbrellas and a kite.
  for (const [x, c1, c2] of [
    [26, '#e07a5f', '#f6efe2'],
    [96, '#2f8f8a', '#f6efe2'],
  ] as const) {
    const top = shore + 1
    px(x + 5, top, 1, 9, p.ink)
    for (let i = 0; i < 6; i++) px(x + 5 - i * 1.6, top + i * 0.6, i * 3.2 + 1, 1, i % 2 ? c1 : c2)
  }
  const kiteX = 120 + Math.round(Math.sin(t * 0.9) * 6)
  const kiteY = Math.round(h * 0.16) + Math.round(Math.cos(t * 1.3) * 3)
  ctx.fillStyle = '#e76f51'
  for (let i = 0; i < 4; i++) px(kiteX - i, kiteY + i, i * 2 + 1, 1)
  for (let i = 0; i < 3; i++) px(kiteX - 2 + i, kiteY + 4 + i, 5 - i * 2, 1)
  ctx.fillStyle = p.ink
  for (let i = 1; i < 14; i++) px(kiteX + Math.round(Math.sin(i * 0.5 + t) * 1), kiteY + 7 + i * 2, 1, 1)

  // Sundal vendor (easter egg): a pushcart with a steaming pot.
  if (extras.sundal) {
    const cx = 62
    const cy = shore + 4
    px(cx, cy, 16, 4, '#b5651d')
    px(cx + 2, cy + 4, 2, 2, p.ink)
    px(cx + 12, cy + 4, 2, 2, p.ink)
    px(cx + 4, cy - 3, 6, 3, '#c0c4c8')
    for (let i = 0; i < 3; i++) if (Math.sin(t * 4 + i) > 0) px(cx + 5 + i * 2, cy - 5 - i, 1, 1, '#ffffff')
    px(cx + 18, cy - 6, 3, 3, '#7a4b2a')
    px(cx + 18, cy - 3, 3, 6, '#2f8f8a')
  }

  // The Marina lighthouse.
  const lx = 204
  const base = shore + 6
  const top = Math.round(h * 0.12)
  for (let y = top; y < base; y++) {
    const w = 5 + Math.round(((y - top) / (base - top)) * 5)
    const stripe = Math.floor((y - top) / 6) % 2 === 0
    px(lx - Math.floor(w / 2), y, w, 1, stripe ? '#f2ede4' : '#d1495b')
  }
  px(lx - 4, top - 5, 8, 5, p.ink)
  px(lx - 3, top - 4, 6, 3, extras.beam || extras.night ? '#ffe28a' : '#9fd3c7')
  px(lx - 5, top - 7, 10, 2, '#d1495b')
  px(lx - 7, base - 2, 14, 3, p.sandDark)

  if (extras.beam || extras.night) {
    const angle = t * 1.6
    const dir = Math.cos(angle)
    const len = 90 * Math.abs(dir)
    ctx.fillStyle = 'rgba(255, 236, 160, 0.28)'
    ctx.beginPath()
    ctx.moveTo(lx, top - 3)
    ctx.lineTo(lx + dir * len, top - 3 - 7)
    ctx.lineTo(lx + dir * len, top - 3 + 9)
    ctx.closePath()
    ctx.fill()
  }
}

/**
 * Marina Beach at golden hour, drawn on a tiny canvas and scaled up with
 * nearest-neighbour sampling for a crisp pixel-art look.
 */
export function MarinaScene({ variant = 'hero', onLighthouseClick, ...extras }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const extrasRef = useRef(extras)
  extrasRef.current = extras
  const height = HEIGHTS[variant]

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let last = 0
    const render = (now: number) => {
      if (now - last >= 1000 / FPS) {
        last = now
        draw(ctx, height, now / 1000, extrasRef.current)
      }
      if (!still) frame = requestAnimationFrame(render)
    }
    frame = requestAnimationFrame(render)
    return () => cancelAnimationFrame(frame)
  }, [height])

  function click(event: React.MouseEvent<HTMLCanvasElement>) {
    if (!onLighthouseClick) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * WIDTH
    if (x > 194 && x < 214) onLighthouseClick()
  }

  return (
    <canvas
      ref={ref}
      className={`scene scene-${variant}`}
      width={WIDTH}
      height={height}
      onClick={click}
      role="img"
      aria-label="Pixel-art Marina Beach at sunset: waves, a kattumaram, kites and the lighthouse"
    />
  )
}
