import { useLang } from '../i18n'
import { headToHead, type Rival } from '../lib/duel'
import { depthFor } from '../lib/tiers'

function metres(points: number, unit: string): string {
  return `${depthFor(points).toLocaleString('en-IN')} ${unit}`
}

/** Two-player standings: you against your most recent rival. */
export function DuelCard({ rival, myName }: { rival: Rival | null; myName: string }) {
  const { t } = useLang()

  if (!rival) {
    return (
      <section className="card duel">
        <h2>
          <span aria-hidden="true">⚔️</span> {t('friends')}
        </h2>
        <p className="muted">{t('friendsEmpty')}</p>
      </section>
    )
  }

  const score = headToHead(rival)
  const rows = [
    { name: myName || t('you'), wins: score.wins, total: score.myTotal, best: score.myBest, me: true },
    { name: rival.name, wins: score.losses, total: score.theirTotal, best: score.theirBest, me: false },
  ].sort((x, y) => y.wins - x.wins || y.total - x.total)

  const recent = Object.entries(rival.dives)
    .sort(([x], [y]) => Number(y) - Number(x))
    .slice(0, 5)

  return (
    <section className="card duel">
      <h2>
        <span aria-hidden="true">⚔️</span> {t('friends')}
      </h2>
      <table className="standings">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col" />
            <th scope="col" className="num">
              {t('wins')}
            </th>
            <th scope="col" className="num">
              {t('totalDepth')}
            </th>
            <th scope="col" className="num hide-sm">
              {t('bestDepth')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.me ? 'me' : 'them'} className={row.me ? 'me' : ''}>
              <td className="rank">{i === 0 ? '👑' : '2'}</td>
              <td>{row.name}</td>
              <td className="num">{row.wins}</td>
              <td className="num">{metres(row.total, t('metres'))}</td>
              <td className="num hide-sm">{metres(row.best, t('metres'))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {score.draws > 0 && (
        <p className="muted small">
          {t('draws')}: {score.draws}
        </p>
      )}
      <h3>{t('recentDuels')}</h3>
      <ul className="duel-list">
        {recent.map(([dive, { me, them }]) => (
          <li key={dive}>
            <span className="muted">
              {t('diveNo')}
              {dive}
            </span>
            <span className={me !== undefined && them !== undefined && me > them ? 'win' : ''}>
              {me !== undefined ? metres(me, t('metres')) : t('waiting')}
            </span>
            <span className="muted">{t('versus')}</span>
            <span className={me !== undefined && them !== undefined && them > me ? 'win' : ''}>
              {them !== undefined ? metres(them, t('metres')) : t('waiting')}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
