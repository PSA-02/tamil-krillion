import { useLang } from '../i18n'
import type { Stats } from '../lib/storage'
import { depthFor } from '../lib/tiers'

export function StatsGrid({ stats, streak }: { stats: Stats; streak: number }) {
  const { t } = useLang()
  const items = [
    { label: t('played'), value: stats.played },
    { label: t('best'), value: `${depthFor(stats.best).toLocaleString('en-IN')} ${t('metres')}` },
    { label: t('streak'), value: streak },
    { label: t('maxStreak'), value: stats.maxStreak },
  ]
  return (
    <section className="card">
      <h2>{t('stats')}</h2>
      <dl className="stats">
        {items.map((item) => (
          <div key={item.label}>
            <dd>{item.value}</dd>
            <dt>{item.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}
