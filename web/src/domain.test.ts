import { describe, expect, it } from 'vitest'
import {
  calculateHours,
  computeQueueCount,
  computeUnreadCount,
  emptyResident,
  filterResidents,
  findShiftConflicts,
  getResidentEvents,
  getResidentMedicationCount,
  makeLocalEvent,
  makeSosPreviewEvent,
  maskPhone,
  maskSensitive,
  seedEvents,
  seedMedications,
  seedNotifications,
  seedResidents,
  seedShifts,
  selectResidentForRole,
  shapeResidentFromDraft,
  sortedEventsByIso,
} from './domain'

describe('careboard domain rules', () => {
  it('filters residents across chinese / romanized / city fields', () => {
    expect(filterResidents(seedResidents, '')).toHaveLength(4)
    expect(filterResidents(seedResidents, 'Hsiu')).toHaveLength(1)
    expect(filterResidents(seedResidents, '永和')).toHaveLength(1)
    expect(filterResidents(seedResidents, '中和')).toHaveLength(1)
    expect(filterResidents(seedResidents, 'nothing')).toHaveLength(0)
  })

  it('detects overlapping shifts for the same caregiver and date', () => {
    expect(findShiftConflicts(seedShifts)).toEqual(['s-003', 's-004'])
  })

  it('calculates scheduled hours from start and end times', () => {
    expect(calculateHours(seedShifts.slice(0, 2))).toBe(4)
    expect(calculateHours([])).toBe(0)
  })

  it('masks sensitive values by default and never mutates them', () => {
    expect(maskSensitive('Lin Hsiu-Chin', false)).toBe('••••••••')
    expect(maskSensitive('Lin Hsiu-Chin', true)).toBe('Lin Hsiu-Chin')
    const original = '09•• •• 1190'
    maskSensitive(original, false)
    expect(original).toBe('09•• •• 1190')
  })

  it('masks phone numbers while preserving the last four digits', () => {
    expect(maskPhone('0987654321', false)).toBe('•••• •• 4321')
    expect(maskPhone('0987', false)).toBe('••••')
    expect(maskPhone('0987654321', true)).toBe('0987654321')
  })

  it('forces caregiver and family roles to focus on the prototype anchor resident', () => {
    expect(selectResidentForRole('family', seedResidents, 'chen')).toBe('lin')
    expect(selectResidentForRole('caregiver', seedResidents, 'huang')).toBe('lin')
    expect(selectResidentForRole('manager', seedResidents, 'chen')).toBe('chen')
  })

  it('falls back to the first resident if the manager role has no current selection', () => {
    expect(selectResidentForRole('manager', seedResidents, 'missing')).toBe('lin')
  })

  it('returns chronological events for the requested resident and type filter', () => {
    const linAll = getResidentEvents(seedResidents, 'lin', 'all')
    expect(linAll).toHaveLength(5)
    const linVitals = getResidentEvents(seedResidents, 'lin', 'vital')
    expect(linVitals.every((event) => event.type === 'vital')).toBe(true)
    expect(getResidentEvents(seedResidents, 'unknown', 'all')).toEqual([])
  })

  it('keeps the full seed timeline in iso order when sorted', () => {
    const sorted = sortedEventsByIso(seedEvents)
    for (let i = 1; i < sorted.length; i += 1) {
      expect(sorted[i - 1].iso >= sorted[i].iso).toBe(true)
    }
  })

  it('counts medication completion ratio and queue / unread totals', () => {
    const ratio = getResidentMedicationCount(seedMedications)
    expect(ratio).toEqual({ taken: 2, total: 4 })
    expect(computeQueueCount(seedResidents)).toBe(2)
    expect(computeUnreadCount(seedNotifications)).toBe(3)
  })

  it('produces a local mock event with a non-empty role label and id', () => {
    const event = makeLocalEvent('lin', 'manager', '新增 mock 紀錄')
    expect(event.residentId).toBe('lin')
    expect(event.type).toBe('note')
    expect(event.recordedBy.names['zh-Hant']).toContain('個案管理師')
    expect(event.id.startsWith('e-local-')).toBe(true)
  })

  it('produces a SOS preview event with the documented three-step chain', () => {
    const preview = makeSosPreviewEvent('lin')
    expect(preview.steps.map((step) => step.actor)).toEqual(['caregiver', 'family', 'manager'])
    expect(preview.id.startsWith('sos-')).toBe(true)
  })

  it('shapes a new resident from the empty draft while preserving identity', () => {
    const draft = emptyResident()
    draft.names.full = { 'zh-Hant': '測試長輩', en: 'Test Senior' }
    draft.emergencyName = '家屬'
    draft.emergencyPhone = '0900-000-000'
    draft.address = 'mock address'
    draft.carePlan = { 'zh-Hant': '照護 1 級', en: 'Care tier 1' }
    const shaped = shapeResidentFromDraft(draft, 'r-test-1')
    expect(shaped.id).toBe('r-test-1')
    expect(shaped.initials['zh-Hant']).toBe('測')
    expect(shaped.initials.en).toBe('TE')
    expect(shaped.carePlan['zh-Hant']).toBe('照護 1 級')
    expect(shaped.timeline).toEqual([])
  })

  it('ignores same-window overlaps across different caregivers or different dates', () => {
    const sameWindowDifferentCaregiver = [
      { id: 'a', residentId: 'lin', caregiver: '王怡文', date: '2026-09-25', start: '09:00', end: '11:00', status: 'confirmed' as const },
      { id: 'b', residentId: 'chen', caregiver: '張家豪', date: '2026-09-25', start: '09:00', end: '11:00', status: 'confirmed' as const },
    ]
    expect(findShiftConflicts(sameWindowDifferentCaregiver)).toEqual([])

    const sameCaregiverDifferentDate = [
      { id: 'c', residentId: 'lin', caregiver: '王怡文', date: '2026-09-25', start: '09:00', end: '11:00', status: 'confirmed' as const },
      { id: 'd', residentId: 'lin', caregiver: '王怡文', date: '2026-09-26', start: '09:00', end: '11:00', status: 'confirmed' as const },
    ]
    expect(findShiftConflicts(sameCaregiverDifferentDate)).toEqual([])
  })

  it('flags three-way overlaps and back-to-back shifts correctly', () => {
    const threeWay = [
      { id: 'a', residentId: 'lin', caregiver: '王怡文', date: '2026-09-25', start: '09:00', end: '12:00', status: 'pending' as const },
      { id: 'b', residentId: 'chen', caregiver: '王怡文', date: '2026-09-25', start: '10:00', end: '11:30', status: 'pending' as const },
      { id: 'c', residentId: 'huang', caregiver: '王怡文', date: '2026-09-25', start: '11:00', end: '13:00', status: 'conflict' as const },
    ]
    expect(findShiftConflicts(threeWay).sort()).toEqual(['a', 'b', 'c'])

    const backToBack = [
      { id: 'a', residentId: 'lin', caregiver: '王怡文', date: '2026-09-25', start: '09:00', end: '11:00', status: 'confirmed' as const },
      { id: 'b', residentId: 'lin', caregiver: '王怡文', date: '2026-09-25', start: '11:00', end: '13:00', status: 'confirmed' as const },
    ]
    expect(findShiftConflicts(backToBack)).toEqual([])
  })

  it('returns an empty string when no residents exist for caregiver or family roles', () => {
    expect(selectResidentForRole('caregiver', [], 'lin')).toBe('lin')
    expect(selectResidentForRole('family', [], 'anything')).toBe('lin')
  })

  it('produces deterministic empty resident defaults safe for new drafts', () => {
    const a = emptyResident()
    const b = emptyResident()
    expect(a.id).toBe('')
    expect(b.id).toBe('')
    expect(a.timeline).toEqual([])
    expect(a.needs).toEqual([])
    expect(a.strip).toEqual({ visits: 0, signals: 0, messages: 0 })
    expect(a.timezone).toBe('Asia/Taipei')
  })
})