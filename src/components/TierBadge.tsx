import type { TierId } from '../data/types'
import { useLang } from '../i18n'
import { TIER_BY_ID } from '../lib/tiers'

export function TierBadge({ tier, showPoints = false }: { tier: TierId; showPoints?: boolean }) {
  const { pick, t } = useLang()
  const info = TIER_BY_ID[tier]
  return (
    <span className={`badge badge-${tier}`}>
      <span aria-hidden="true">{info.emoji}</span> {pick(info)}
      {showPoints && (
        <span className="badge-points">
          +{info.points} {t('pts')}
        </span>
      )}
    </span>
  )
}
