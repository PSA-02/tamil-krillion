import { useEffect, useState } from 'react'

/**
 * Counts down from `seconds` while `running`, restarting whenever `resetKey`
 * changes. Uses a wall-clock deadline so a throttled tab can't stretch time.
 */
export function useCountdown(seconds: number, running: boolean, resetKey: unknown): number {
  const [remainingMs, setRemainingMs] = useState(seconds * 1000)

  useEffect(() => {
    setRemainingMs(seconds * 1000)
    if (!running) return
    const deadline = Date.now() + seconds * 1000
    const id = setInterval(() => {
      const left = Math.max(0, deadline - Date.now())
      setRemainingMs(left)
      if (left === 0) clearInterval(id)
    }, 100)
    return () => clearInterval(id)
  }, [seconds, running, resetKey])

  return remainingMs
}
