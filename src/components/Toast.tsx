import { useEffect } from 'react'

export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return
    const id = setTimeout(onDone, 4000)
    return () => clearTimeout(id)
  }, [message, onDone])

  return (
    <div className={`toast ${message ? 'show' : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  )
}
