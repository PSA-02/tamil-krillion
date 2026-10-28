import { useState } from 'react'
import { PROMPTS_BY_ID } from '../data/prompts'
import { useLang } from '../i18n'
import { totalPoints, type RoundResult } from '../lib/game'
import { shareText } from '../lib/share'
import type { Stats } from '../lib/storage'
import { MISS_EMOJI, TIER_BY_ID, depthFor } from '../lib/tiers'
import { DepthGauge } from './DepthGauge'
import { StatsGrid } from './StatsGrid'
import { TierBadge } from './TierBadge'

interface Props {
  results: RoundResult[]
  dive: number | null
  stats: Stats
  streak: number
  onHome: () => void
  onPractice: () => void
}

export function Results({ results, dive, stats, streak, onHome, onPractice }: Props) {
  const { t, pick } = useLang()
  const [copied, setCopied] = useState(false)
  const score = totalPoints(results)
  const depth = depthFor(score)

  async function share() {
    const text = shareText(dive ?? 0, score, results.map((r) => r.tier), window.location.href.split('#')[0])
    try {
      if (navigator.share) {
        await navigator.share({ text })
        return
      }
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // The user dismissed the share sheet or clipboard access was denied.
    }
  }

  return (
    <main className="results">
      <div className="results-head">
        <div>
          <p className="eyebrow">
            {dive ? `${t('diveNo')}${dive}` : t('practice')} · {t('resultTitle')}
          </p>
          <p className="big-depth">
            {depth.toLocaleString('en-IN')} <span>{t('metres')}</span>
          </p>
          <p className="muted">
            {score} {t('points')}
          </p>
          <p className="emoji-row" aria-hidden="true">
            {results.map((r, i) => (
              <span key={i}>{r.tier ? TIER_BY_ID[r.tier].emoji : MISS_EMOJI}</span>
            ))}
          </p>
          <div className="actions">
            {dive && (
              <button className="primary" onClick={share}>
                {copied ? t('copied') : t('share')}
              </button>
            )}
            <button className="secondary" onClick={onPractice}>
              {t('playAgain')}
            </button>
            <button className="link" onClick={onHome}>
              {t('home')}
            </button>
          </div>
        </div>
        <DepthGauge depth={depth} />
      </div>

      <section className="card">
        <h2>{t('yourAnswers')}</h2>
        <ol className="answer-list">
          {results.map((r) => {
            const prompt = PROMPTS_BY_ID[r.promptId]
            return (
              <li key={r.promptId}>
                <span className="muted">{pick(prompt)}</span>
                <span>
                  {r.answer ? (
                    <>
                      <strong lang="ta">{r.answer.ta}</strong> {r.tier && <TierBadge tier={r.tier} showPoints />}
                    </>
                  ) : (
                    <span className="muted">{r.input || '—'}</span>
                  )}
                </span>
              </li>
            )
          })}
        </ol>
      </section>

      {dive && <StatsGrid stats={stats} streak={streak} />}
    </main>
  )
}
