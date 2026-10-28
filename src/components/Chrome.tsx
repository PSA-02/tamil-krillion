import { useLang } from '../i18n'

export function Header({ onHome, onToggleLang }: { onHome: () => void; onToggleLang: () => void }) {
  const { t } = useLang()
  return (
    <header className="header">
      <button className="brand" onClick={onHome}>
        <span aria-hidden="true">🌊</span> {t('title')}
      </button>
      <button className="lang-toggle" onClick={onToggleLang}>
        {t('language')}
      </button>
    </header>
  )
}

export function Footer() {
  const { t } = useLang()
  return <footer className="footer">{t('footer')}</footer>
}
