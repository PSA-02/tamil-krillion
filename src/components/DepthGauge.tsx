import { useLang } from '../i18n'
import { MAX_DEPTH } from '../lib/tiers'

/** A vertical slice of ocean with a diver sinking to the current depth. */
export function DepthGauge({ depth }: { depth: number }) {
  const { t } = useLang()
  const ratio = Math.min(1, depth / MAX_DEPTH)
  return (
    <div
      className="gauge"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={MAX_DEPTH}
      aria-valuenow={depth}
      aria-label={`${depth} ${t('metres')}`}
    >
      <span className="gauge-label gauge-top">{t('surface')}</span>
      <div className="gauge-water">
        <div className="gauge-trail" style={{ height: `${ratio * 100}%` }} />
        <div className="gauge-diver" style={{ top: `calc(24px + ${ratio} * (100% - 48px))` }}>
          <span aria-hidden="true">🤿</span>
          <strong>
            {depth.toLocaleString('en-IN')} {t('metres')}
          </strong>
        </div>
      </div>
      <span className="gauge-label gauge-bottom">
        {MAX_DEPTH.toLocaleString('en-IN')} {t('metres')}
      </span>
    </div>
  )
}
