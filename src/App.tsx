import { useState } from 'react'
import { Footer, Header } from './components/Chrome'
import { Game } from './components/Game'
import { Home } from './components/Home'
import { Results } from './components/Results'
import type { Prompt } from './data/types'
import { LangProvider, type Lang } from './i18n'
import { PROMPTS } from './data/prompts'
import { dailyPrompts, dateKey, diveNumber, pickPrompts } from './lib/daily'
import { totalPoints, type RoundResult } from './lib/game'
import { currentStreak, loadLang, loadStats, recordDaily, saveLang, saveStats, type Stats } from './lib/storage'

type Screen =
  | { name: 'home' }
  | { name: 'game'; daily: boolean; prompts: Prompt[]; round: number }
  | { name: 'results'; results: RoundResult[]; dive: number | null }

export default function App() {
  const [lang, setLang] = useState<Lang>(loadLang)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [today, setToday] = useState(() => dateKey())
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [round, setRound] = useState(0)

  const dive = diveNumber(today)
  const todayRecord = stats.history[today]
  const streak = currentStreak(stats, today)

  function toggleLang() {
    const next = lang === 'ta' ? 'en' : 'ta'
    setLang(next)
    saveLang(next)
  }

  function goHome() {
    setToday(dateKey())
    setScreen({ name: 'home' })
  }

  function startDaily() {
    if (todayRecord) {
      setScreen({ name: 'results', results: todayRecord.results, dive })
      return
    }
    setRound(round + 1)
    setScreen({ name: 'game', daily: true, prompts: dailyPrompts(today), round: round + 1 })
  }

  function startPractice() {
    setRound(round + 1)
    setScreen({ name: 'game', daily: false, prompts: pickPrompts(Math.random, PROMPTS), round: round + 1 })
  }

  function finish(daily: boolean, results: RoundResult[]) {
    if (daily) {
      const next = recordDaily(stats, today, { score: totalPoints(results), results })
      setStats(next)
      saveStats(next)
    }
    setScreen({ name: 'results', results, dive: daily ? dive : null })
  }

  return (
    <LangProvider lang={lang}>
      <div className="app" lang={lang}>
        <Header onHome={goHome} onToggleLang={toggleLang} />

        {screen.name === 'home' && (
          <Home
            dive={dive}
            playedToday={Boolean(todayRecord)}
            stats={stats}
            streak={streak}
            onDaily={startDaily}
            onPractice={startPractice}
          />
        )}
        {screen.name === 'game' && (
          <Game
            key={screen.round}
            prompts={screen.prompts}
            onFinish={(results) => finish(screen.daily, results)}
          />
        )}
        {screen.name === 'results' && (
          <Results
            results={screen.results}
            dive={screen.dive}
            stats={stats}
            streak={streak}
            onHome={goHome}
            onPractice={startPractice}
          />
        )}

        <Footer />
      </div>
    </LangProvider>
  )
}
