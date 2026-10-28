import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PROMPTS_BY_ID } from '../data/prompts'
import { LangProvider } from '../i18n'
import { Game } from './Game'

const prompts = [PROMPTS_BY_ID.epics, PROMPTS_BY_ID.kural]

function renderGame(onFinish = vi.fn()) {
  render(
    <LangProvider lang="en">
      <Game prompts={prompts} onFinish={onFinish} />
    </LangProvider>,
  )
  return onFinish
}

function answer(text: string) {
  fireEvent.change(screen.getByPlaceholderText('Your answer…'), { target: { value: text } })
  fireEvent.click(screen.getByRole('button', { name: 'Dive' }))
}

describe('Game', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('scores an answer typed in English letters and moves on', () => {
    const onFinish = renderGame()
    answer('silapathikaram')
    expect(screen.getByText('சிலப்பதிகாரம்')).toBeInTheDocument()
    expect(screen.getByText('+10 pts')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    answer('பொருள்')
    expect(screen.getByText('+30 pts')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'See results' }))
    expect(onFinish).toHaveBeenCalledOnce()
    expect(onFinish.mock.calls[0][0].map((r: { points: number }) => r.points)).toEqual([10, 30])
  })

  it('ends the round when the clock runs out', () => {
    renderGame()
    act(() => {
      vi.advanceTimersByTime(25_100)
    })
    expect(screen.getByText("Time's up")).toBeInTheDocument()
  })

  it('shows rarer answers after a miss', () => {
    renderGame()
    answer('Ramayanam')
    expect(screen.getByText('Not on the list')).toBeInTheDocument()
    expect(screen.getByText('Deeper answers you could have found')).toBeInTheDocument()
  })
})
