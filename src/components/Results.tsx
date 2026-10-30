import { useState, type FormEvent } from 'react'
import { PROMPTS_BY_ID } from '../data/prompts'
import { useLang } from '../i18n'
import { challengeUrl, cleanName, type Rival } from '../lib/duel'
import { totalPoints, type RoundResult } from '../lib/game'
import { shareText } from '../lib/share'
import { play } from '../lib/sound'
import type { Stats } from '../lib/storage'
import { MISS_EMOJI, TIER_BY_ID, depthFor } from '../lib/tiers'
import { DepthGauge } from './DepthGauge'
import { DuelCard } from './DuelCard'
import { StatsGrid } from './StatsGrid'
import { TierBadge } from './TierBadge'

interface Props {
  results: RoundResult[]
  dive: number | null
  stats: Stats
  streak: number
  myName: string
  rival: Rival | null
  onName: (name: string) => void
  onToast: (message: string) => void
  onHome: () => void
  onPractice: () => void
}

async function shareOrCopy(text: string): Promise<'shared' | 'copied' | 'failed'> {
  if (navigator.share) {
    try {
      await navigator.share({ text })
      return 'shared'
    } catch (error) {
      // The user closed the share sheet on purpose; don't copy behind their back.
      if (error instanceof DOMException && error.name === 'AbortError') return 'failed'
    }
  }
  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}

export function Results({ results, dive, stats, streak, myName, rival, onName, onToast, onHome, onPractice }: Props) {
  const { t, pick } = useLang()
  const [askingName, setAskingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(myName)
  const score = totalPoints(results)
  const depth = depthFor(score)
  const tiers = results.map((r) => r.tier)
  const theirScore = dive && rival ? rival.dives[dive]?.them : undefined

  async function shareResult() {
    play('click')
    const outcome = await shareOrCopy(shareText(dive ?? 0, score, tiers, window.location.href.split('#')[0]))
    if (outcome === 'copied') onToast(t('copied'))
  }

  async function sendChallenge(name: string) {
    if (!dive) return
    const url = challengeUrl(window.location.href, { name, dive, score, tiers })
    const text = `${t('challengeText')}\n${shareText(dive, score, tiers, url)}`
    const outcome = await shareOrCopy(text)
    if (outcome === 'copied') onToast(t('linkCopied'))
  }

  function challenge() {
    play('click')
    if (!myName) {
      setAskingName(true)
      return
    }
    void sendChallenge(myName)
  }

  function submitName(event: FormEvent) {
    event.preventDefault()
    const name = cleanName(nameDraft)
    if (!name) return
    onName(name)
    setAskingName(false)
    void sendChallenge(name)
  }

  const verdict =
    theirScore === undefined ? null : score > theirScore ? t('youWin') : score < theirScore ? t('youLose') : t('itsDraw')

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

          {verdict && rival && theirScore !== undefined && (
            <div className="versus-banner" role="status">
              <strong>{verdict}</strong>
              <span>
                {t('you')} {depth.toLocaleString('en-IN')} {t('metres')} · {rival.name}{' '}
                {depthFor(theirScore).toLocaleString('en-IN')} {t('metres')}
              </span>
            </div>
          )}

          <div className="actions">
            {dive && (
              <button className="primary" onClick={challenge}>
                ⚔️ {theirScore !== undefined ? t('sendBack') : t('challenge')}
              </button>
            )}
            {dive && (
              <button className="secondary" onClick={shareResult}>
                {t('share')}
              </button>
            )}
            <button className="secondary" onClick={onPractice}>
              {t('playAgain')}
            </button>
            <button className="link" onClick={onHome}>
              {t('home')}
            </button>
          </div>

          {askingName && (
            <form className="name-form card" onSubmit={submitName}>
              <label htmlFor="name">{t('namePrompt')}</label>
              <div className="answer-form">
                <input
                  id="name"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder={t('yourName')}
                  maxLength={20}
                  autoFocus
                />
                <button className="primary" type="submit" disabled={!cleanName(nameDraft)}>
                  {t('save')}
                </button>
              </div>
            </form>
          )}
        </div>
        <DepthGauge depth={depth} />
      </div>

      {dive && <DuelCard rival={rival} myName={myName} />}

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
