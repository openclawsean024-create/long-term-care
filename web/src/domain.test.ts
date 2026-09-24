import { describe, expect, it } from 'vitest'
import { calculateHours, filterResidents, findShiftConflicts, maskSensitive, seedResidents, seedShifts } from './domain'

describe('careboard domain rules', () => {
  it('filters residents by Chinese name, romanized name, or city', () => {
    expect(filterResidents(seedResidents, 'Hsiu')).toHaveLength(1)
    expect(filterResidents(seedResidents, '永和')).toHaveLength(1)
    expect(filterResidents(seedResidents, '')).toHaveLength(3)
  })

  it('detects overlapping shifts for the same caregiver and date', () => {
    expect(findShiftConflicts(seedShifts)).toEqual(['s-003', 's-004'])
  })

  it('calculates scheduled hours from start and end times', () => {
    expect(calculateHours(seedShifts.slice(0, 2))).toBe(4)
  })

  it('masks sensitive values by default', () => {
    expect(maskSensitive('09•• •• 1190', false)).toBe('••••••••')
    expect(maskSensitive('09•• •• 1190', true)).toBe('09•• •• 1190')
  })
})
