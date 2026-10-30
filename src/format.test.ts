import { describe, expect, it } from 'vitest'
import { formatCalendarDate, movementLabel, stampsLabel } from './format'

describe('stampsLabel', () => {
  it('uses the singular only for one', () => {
    expect(stampsLabel(1)).toBe('1 sello')
    expect(stampsLabel(0)).toBe('0 sellos')
    expect(stampsLabel(3)).toBe('3 sellos')
  })
})

describe('movementLabel', () => {
  it('shows stamps given with a plus sign', () => {
    expect(movementLabel('STAMP', 1)).toBe('+1 sello')
    expect(movementLabel('STAMP', 2)).toBe('+2 sellos')
  })

  it('shows a redemption without its amount, which counts rewards and not stamps', () => {
    expect(movementLabel('REDEEM', -1)).toBe('Premio canjeado')
  })

  it('shows an adjustment with its sign', () => {
    expect(movementLabel('ADJUST', 1)).toBe('Ajuste: +1 sello')
    expect(movementLabel('ADJUST', -2)).toBe('Ajuste: -2 sellos')
  })
})

describe('formatCalendarDate', () => {
  it('keeps the day whatever the timezone', () => {
    expect(formatCalendarDate('1990-03-07')).toBe('7 de marzo de 1990')
  })
})
