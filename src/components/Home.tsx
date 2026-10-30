import { PROMPTS } from '../data/prompts'
import { useLang } from '../i18n'
import type { Challenge, Rival } from '../lib/duel'
import { EGGS, type EggId } from '../lib/eggs'
import type { Stats } from '../lib/storage'
import { TIERS, depthFor } from '../lib/tiers'
import { DuelCard } from './DuelCard'
import { StatsGrid } from './StatsGrid'

interface Props {
  dive: number
  playedToday: boolean
  stats: Stats
  streak: number
  incoming: Challenge | null
  rival: Rival | null
  myName: string
  eggs: EggId[]
  onDaily: () => void
  onPractice: () => void
}

const ANSWER_COUNT = PROMPTS.reduce((sum, p) => sum + p.answers.length, 0)

export function Home({ dive, playedToday, stats, streak, incoming, rival, myName, eggs, onDaily, onPractice }: Props) {
  const { t, pick } = useLang()
  const challengeIsToday = incoming?.dive === dive
  return (
    <main className="home">
      <h1 className="tagline">{t('tagline')}</h1>
      <p className="sub">
        {t('tagline2')}{' '}
        <span className="pill">
          {PROMPTS.length} {t('categories')} · {ANSWER_COUNT.toLocaleString('en-IN')} {t('answersCount')}
        </span>
      </p>

      {incoming && (
        <div className="challenge-banner" role="status">
          <span className="challenge-icon" aria-hidden="true">
            ⚔️
          </span>
          <div>
            <strong>
              {incoming.name} {t('challengedYou')}
            </strong>
            <p>
              {t('diveNo')}
              {incoming.dive} · {depthFor(incoming.score).toLocaleString('en-IN')} {t('metres')}
            </p>
            <p className="muted">{challengeIsToday && !playedToday ? t('challengeToday') : !challengeIsToday ? t('challengeOld') : ''}</p>
          </div>
        </div>
      )}

      <div className="actions">
        <button className="primary big" onClick={onDaily}>
          {playedToday ? t('viewResult') : challengeIsToday ? t('acceptChallenge') : t('dailyDive')}
          <small>
            {t('diveNo')}
            {dive}
          </small>
        </button>
        <button className="secondary big" onClick={onPractice}>
          {t('practice')}
          <small>{t('practiceHint')}</small>
        </button>
      </div>
      {playedToday && <p className="note">{t('doneToday')}</p>}

      <div className="grid-2">
        <DuelCard rival={rival} myName={myName} />
        {stats.played > 0 ? (
          <StatsGrid stats={stats} streak={streak} />
        ) : (
          <section className="card secrets">
            <h2>
              <span aria-hidden="true">🐚</span> {t('secrets')}
            </h2>
            <p className="secret-count">
              {eggs.length} / {EGGS.length}
            </p>
            <p className="muted small">{t('secretsHint')}</p>
          </section>
        )}
      </div>

      {stats.played > 0 && (
        <p className="muted small secrets-inline">
          🐚 {t('secrets')}: {eggs.length} / {EGGS.length} · {t('secretsHint')}
        </p>
      )}

      <section className="card rules">
        <h2>{t('howToPlay')}</h2>
        <ol>
          <li>{t('rules1')}</li>
          <li>{t('rules2')}</li>
          <li>{t('rules3')}</li>
          <li>{t('rules4')}</li>
        </ol>
        <h3>{t('tiersTitle')}</h3>
        <table className="tiers">
          <tbody>
            {TIERS.map((tier) => (
              <tr key={tier.id}>
                <td aria-hidden="true">{tier.emoji}</td>
                <td>{pick(tier)}</td>
                <td className="num">
                  {tier.points} {t('pts')}
                </td>
                <td className="num muted">
                  {depthFor(tier.points)} {t('metres')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
