import { useLang } from '../i18n'

interface HeaderProps {
  muted: boolean
  onHome: () => void
  onToggleLang: () => void
  onToggleSound: () => void
}

export function Header({ muted, onHome, onToggleLang, onToggleSound }: HeaderProps) {
  const { t } = useLang()
  return (
    <header className="header">
      <button className="brand" onClick={onHome}>
        <span className="brand-mark" aria-hidden="true">
          🌊
        </span>{' '}
        {t('title')}
      </button>
      <div className="header-actions">
        <button className="chip" onClick={onToggleSound} aria-label={muted ? t('soundOff') : t('soundOn')} aria-pressed={!muted}>
          <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span>
        </button>
        <button className="chip" onClick={onToggleLang}>
          {t('language')}
        </button>
      </div>
    </header>
  )
}

export function Footer() {
  const { t } = useLang()
  return <footer className="footer">{t('footer')}</footer>
}
