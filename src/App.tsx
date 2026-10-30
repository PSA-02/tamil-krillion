import { useCallback, useEffect, useRef, useState } from 'react'
import { Footer, Header } from './components/Chrome'
import { Game } from './components/Game'
import { Home } from './components/Home'
import { MarinaScene, type SceneExtras } from './components/MarinaScene'
import { Results } from './components/Results'
import { Toast } from './components/Toast'
import { PROMPTS } from './data/prompts'
import type { Prompt } from './data/types'
import { LangProvider, STRINGS, type Lang, type StringKey } from './i18n'
import { LAUNCH_DATE, addDays, dailyPrompts, dateKey, diveNumber, pickPrompts } from './lib/daily'
import { latestRival, readChallengeFromHash, recordDuel, type Challenge, type Rival } from './lib/duel'
import { answerEgg, konamiStep, type EggId } from './lib/eggs'
import { totalPoints, type RoundResult } from './lib/game'
import { isMuted, play, setMuted, startWaves, stopWaves } from './lib/sound'
import {
  currentStreak,
  loadEggs,
  loadLang,
  loadName,
  loadRivals,
  loadStats,
  recordDaily,
  saveEggs,
  saveLang,
  saveName,
  saveRivals,
  saveStats,
  type Stats,
} from './lib/storage'
import { MAX_DEPTH, depthFor } from './lib/tiers'

type Screen =
  | { name: 'home' }
  | { name: 'game'; daily: boolean; prompts: Prompt[]; round: number }
  | { name: 'results'; results: RoundResult[]; dive: number | null }

const EGG_SCENE: Partial<Record<EggId, keyof SceneExtras>> = {
  lighthouse: 'beam',
  sundal: 'sundal',
  kattumaram: 'kattumaram',
}

function prefersDark(): boolean {
  if (typeof window === 'undefined') return false
  const theme = document.documentElement.dataset.theme
  if (theme) return theme === 'dark'
  return Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches)
}

/** Reads a challenge link once on load, records the friend's score and clears the hash. */
function initialDuel(stats: Stats, myName: string): { rivals: Record<string, Rival>; incoming: Challenge | null } {
  let rivals = loadRivals()
  const incoming = typeof window === 'undefined' ? null : readChallengeFromHash(window.location.hash)
  if (!incoming || incoming.name === myName) return { rivals, incoming: null }
  rivals = recordDuel(rivals, incoming.name, incoming.dive, 'them', incoming.score)
  const mine = stats.history[addDays(LAUNCH_DATE, incoming.dive - 1)]
  if (mine) rivals = recordDuel(rivals, incoming.name, incoming.dive, 'me', mine.score)
  saveRivals(rivals)
  history.replaceState(null, '', window.location.pathname + window.location.search)
  return { rivals, incoming }
}

export default function App() {
  const [lang, setLang] = useState<Lang>(loadLang)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [myName, setMyName] = useState(loadName)
  const [duel, setDuel] = useState(() => initialDuel(stats, myName))
  const [today, setToday] = useState(() => dateKey())
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [round, setRound] = useState(0)
  const [muted, setMutedState] = useState(isMuted)
  const [eggs, setEggs] = useState<EggId[]>(loadEggs)
  const [extras, setExtras] = useState<SceneExtras>({ night: prefersDark() })
  const [toast, setToast] = useState<string | null>(null)
  const lighthouseClicks = useRef(0)
  const konami = useRef(0)

  const dive = diveNumber(today)
  const todayRecord = stats.history[today]
  const streak = currentStreak(stats, today)
  const rival = latestRival(duel.rivals)
  const clearToast = useCallback(() => setToast(null), [])

  const unlock = useCallback(
    (egg: EggId) => {
      play(egg === 'whistle' ? 'whistle' : 'secret')
      setToast(STRINGS[`egg_${egg}` as StringKey][lang])
      const flag = EGG_SCENE[egg]
      if (flag) setExtras((prev) => ({ ...prev, [flag]: true }))
      setEggs((prev) => {
        if (prev.includes(egg)) return prev
        const next = [...prev, egg]
        saveEggs(next)
        return next
      })
    },
    [lang],
  )

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      konami.current = konamiStep(konami.current, event.key)
      if (konami.current === 10) {
        konami.current = 0
        setExtras((prev) => ({ ...prev, night: !prev.night }))
        unlock('night')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [unlock])

  useEffect(() => {
    if (screen.name === 'game' && !muted) startWaves()
    else stopWaves()
  }, [screen.name, muted])

  function toggleLang() {
    const next = lang === 'ta' ? 'en' : 'ta'
    setLang(next)
    saveLang(next)
  }

  function toggleSound() {
    setMuted(!muted)
    setMutedState(!muted)
    if (muted) play('click')
  }

  function goHome() {
    setToday(dateKey())
    setScreen({ name: 'home' })
  }

  function startDaily() {
    play('click')
    if (todayRecord) {
      setScreen({ name: 'results', results: todayRecord.results, dive })
      return
    }
    setRound(round + 1)
    setScreen({ name: 'game', daily: true, prompts: dailyPrompts(today), round: round + 1 })
  }

  function startPractice() {
    play('click')
    setRound(round + 1)
    setScreen({ name: 'game', daily: false, prompts: pickPrompts(Math.random, PROMPTS), round: round + 1 })
  }

  function finish(daily: boolean, results: RoundResult[]) {
    const score = totalPoints(results)
    play('finish')
    if (daily) {
      const next = recordDaily(stats, today, { score, results })
      setStats(next)
      saveStats(next)
      let rivals = duel.rivals
      for (const name of Object.keys(rivals)) rivals = recordDuel(rivals, name, dive, 'me', score)
      saveRivals(rivals)
      setDuel({ ...duel, rivals })
    }
    if (depthFor(score) === MAX_DEPTH) unlock('crore')
    setScreen({ name: 'results', results, dive: daily ? dive : null })
  }

  function onRound(prompt: Prompt, result: RoundResult) {
    const egg = answerEgg(prompt.id, result.input, result.answer)
    if (egg) unlock(egg)
  }

  function onLighthouse() {
    lighthouseClicks.current++
    if (lighthouseClicks.current === 5) unlock('lighthouse')
  }

  function changeName(name: string) {
    setMyName(name)
    saveName(name)
  }

  return (
    <LangProvider lang={lang}>
      <div className="app" lang={lang}>
        <Header muted={muted} onHome={goHome} onToggleLang={toggleLang} onToggleSound={toggleSound} />

        <div className="scene-frame">
          <MarinaScene variant={screen.name === 'home' ? 'hero' : 'band'} onLighthouseClick={onLighthouse} {...extras} />
        </div>

        {screen.name === 'home' && (
          <Home
            dive={dive}
            playedToday={Boolean(todayRecord)}
            stats={stats}
            streak={streak}
            incoming={duel.incoming}
            rival={rival}
            myName={myName}
            eggs={eggs}
            onDaily={startDaily}
            onPractice={startPractice}
          />
        )}
        {screen.name === 'game' && (
          <Game
            key={screen.round}
            prompts={screen.prompts}
            onRound={onRound}
            onFinish={(results) => finish(screen.daily, results)}
          />
        )}
        {screen.name === 'results' && (
          <Results
            results={screen.results}
            dive={screen.dive}
            stats={stats}
            streak={streak}
            myName={myName}
            rival={rival}
            onName={changeName}
            onToast={setToast}
            onHome={goHome}
            onPractice={startPractice}
          />
        )}

        <Footer />
        <Toast message={toast} onDone={clearToast} />
      </div>
    </LangProvider>
  )
}
