import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { Prompt } from '../data/types'
import { useLang } from '../i18n'
import { deeperAnswers, scoreRound, totalPoints, type RoundResult } from '../lib/game'
import { SECONDS_PER_ROUND, depthFor } from '../lib/tiers'
import { useCountdown } from '../lib/useCountdown'
import { DepthGauge } from './DepthGauge'
import { TierBadge } from './TierBadge'

interface Props {
  prompts: Prompt[]
  onFinish: (results: RoundResult[]) => void
}

export function Game({ prompts, onFinish }: Props) {
  const { t, pick } = useLang()
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<RoundResult[]>([])
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  const prompt = prompts[index]
  const result: RoundResult | undefined = results[index]
  const remainingMs = useCountdown(SECONDS_PER_ROUND, !result, index)
  const isLast = index === prompts.length - 1

  function resolve(next: RoundResult) {
    setResults((prev) => (prev.length > index ? prev : [...prev, next]))
  }

  useEffect(() => {
    if (remainingMs === 0 && !result) resolve(scoreRound(prompt, input, 'timeout'))
    // Only the clock reaching zero should end the round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs])

  useEffect(() => {
    if (result) nextRef.current?.focus()
    else inputRef.current?.focus()
  }, [result, index])

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!input.trim() || result) return
    resolve(scoreRound(prompt, input))
  }

  function advance() {
    if (isLast) {
      onFinish(results)
      return
    }
    setInput('')
    setIndex(index + 1)
  }

  const seconds = Math.ceil(remainingMs / 1000)
  const depth = depthFor(totalPoints(results))

  return (
    <main className="game">
      <div className="game-main">
        <div className="progress-dots" aria-label={`${t('prompt')} ${index + 1} ${t('of')} ${prompts.length}`}>
          {prompts.map((p, i) => (
            <span key={p.id} className={i < index ? 'done' : i === index ? 'current' : ''} />
          ))}
        </div>

        <p className="eyebrow">
          {t('prompt')} {index + 1} {t('of')} {prompts.length}
          <span className="depth-pill">
            <span aria-hidden="true">🤿</span> {depth.toLocaleString('en-IN')} {t('metres')}
          </span>
        </p>
        <h2 className="prompt" lang="ta">
          {prompt.ta}
        </h2>
        <p className="prompt-en" lang="en">
          {prompt.en}
        </p>

        {!result ? (
          <>
            <div
              className={`timer ${seconds <= 5 ? 'urgent' : ''}`}
              role="timer"
              aria-label={`${seconds} ${t('secondsLeft')}`}
            >
              <div className="timer-bar" style={{ width: `${(remainingMs / (SECONDS_PER_ROUND * 1000)) * 100}%` }} />
              <span>{seconds}</span>
            </div>
            <form className="answer-form" onSubmit={submit}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('placeholder')}
                aria-label={t('placeholder')}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                maxLength={60}
              />
              <button className="primary" type="submit" disabled={!input.trim()}>
                {t('submit')}
              </button>
            </form>
            <button className="link" onClick={() => resolve(scoreRound(prompt, input, 'skip'))}>
              {t('skip')}
            </button>
          </>
        ) : (
          <section className={`feedback feedback-${result.status}`} aria-live="polite">
            {result.answer && result.tier ? (
              <>
                <p className="feedback-answer">
                  <span lang="ta">{result.answer.ta}</span>
                  <span className="muted"> · {result.answer.en}</span>
                </p>
                <TierBadge tier={result.tier} showPoints />
              </>
            ) : (
              <p className="feedback-answer">
                {result.input && <span className="struck">{result.input}</span>}{' '}
                {result.status === 'timeout' ? t('timeUp') : result.status === 'skip' ? t('skipped') : t('notOnList')}
              </p>
            )}

            {deeperAnswers(prompt, result.tier).length > 0 && (
              <div className="deeper">
                <h3>{t('deeperAnswers')}</h3>
                <ul>
                  {deeperAnswers(prompt, result.tier).map((a) => (
                    <li key={a.ta}>
                      <span lang="ta">{a.ta}</span> <span className="muted">({a.en})</span>{' '}
                      <TierBadge tier={a.tier} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button ref={nextRef} className="primary" onClick={advance}>
              {isLast ? t('finish') : t('next')}
            </button>
          </section>
        )}
      </div>

      <aside className="game-side" aria-label={pick({ ta: 'ஆழம்', en: 'Depth' })}>
        <DepthGauge depth={depth} />
      </aside>
    </main>
  )
}
