import { useLang } from '../i18n'
import { TIERS, depthFor } from '../lib/tiers'
import type { Stats } from '../lib/storage'
import { StatsGrid } from './StatsGrid'

interface Props {
  dive: number
  playedToday: boolean
  stats: Stats
  streak: number
  onDaily: () => void
  onPractice: () => void
}

export function Home({ dive, playedToday, stats, streak, onDaily, onPractice }: Props) {
  const { t, pick } = useLang()
  return (
    <main className="home">
      <p className="tagline">{t('tagline')}</p>

      <div className="actions">
        <button className="primary big" onClick={onDaily}>
          {playedToday ? t('viewResult') : t('dailyDive')}
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

      {stats.played > 0 && <StatsGrid stats={stats} streak={streak} />}

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
