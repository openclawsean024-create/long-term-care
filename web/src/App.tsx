import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  computeUnreadCount,
  emptyResident,
  makeLocalEvent,
  makeSosPreviewEvent,
  selectResidentForRole,
  seedEvents,
  seedMedications,
  seedNotifications,
  seedResidents,
  seedShifts,
  shapeResidentFromDraft,
  sosSteps,
  type CareEvent,
  type EventType,
  type Locale,
  type Medication,
  type NotificationItem,
  type Resident,
  type Role,
  type Shift,
  type SosPreviewEvent,
  type View,
} from './domain'
import { t } from './i18n'
import { MobileNav, PrototypeNote, Sidebar, ToastStack, Topbar } from './components/shell'
import { Overview } from './views/overview'
import { FamilyView, JournalView, MedicationsView, ReportsView, ResidentsView, ScheduleView } from './views/secondary'
import { ResidentModal, SosModal } from './components/modals'
import { STORAGE_KEYS, useStoredState } from './storage'

type OverviewEventFilter = 'all' | EventType

const initialDraft = emptyResident()

function useToast(): { messages: string[]; push: (message: string) => void } {
  const [messages, setMessages] = useState<string[]>([])
  const push = useCallback((message: string): void => {
    setMessages((current) => [...current, message])
  }, [])
  useEffect(() => {
    if (messages.length === 0) return
    const timer = window.setTimeout(() => {
      setMessages((current) => current.slice(1))
    }, 3000)
    return () => window.clearTimeout(timer)
  }, [messages])
  return { messages, push }
}

export default function App(): ReactNode {
  const [view, setView] = useState<View>('overview')
  const [role, setRole] = useState<Role>('manager')
  const [locale, setLocale] = useState<Locale>('zh-Hant')
  const [residents, setResidents] = useStoredState<Resident[]>(STORAGE_KEYS.residents, seedResidents)
  const [events, setEvents] = useStoredState<CareEvent[]>(STORAGE_KEYS.events, seedEvents)
  const [shifts, setShifts] = useStoredState<Shift[]>(STORAGE_KEYS.shifts, seedShifts)
  const [medications, setMedications] = useStoredState<Medication[]>(STORAGE_KEYS.medications, seedMedications)
  const [notifications, setNotifications] = useStoredState<NotificationItem[]>(
    STORAGE_KEYS.notifications,
    seedNotifications,
  )
  const [sosHistory, setSosHistory] = useStoredState<SosPreviewEvent[]>(STORAGE_KEYS.sosHistory, [])

  const [selectedResidentId, setSelectedResidentId] = useState<string>('lin')
  const [residentSearch, setResidentSearch] = useState<string>('')
  const [showSensitive, setShowSensitive] = useState<boolean>(false)
  const [overviewFilter, setOverviewFilter] = useState<OverviewEventFilter>('all')
  const [acknowledged, setAcknowledged] = useState<Record<string, true>>({})

  const [residentModal, setResidentModal] = useState<{ open: boolean; editingId?: string }>({ open: false })
  const [residentDraft, setResidentDraft] = useState<Resident>(initialDraft)
  const [sosOpen, setSosOpen] = useState<boolean>(false)

  const toast = useToast()

  const effectiveResidentId = useMemo(
    () => selectResidentForRole(role, residents, selectedResidentId),
    [role, residents, selectedResidentId],
  )

  const selectedResident = useMemo(
    () => residents.find((resident) => resident.id === effectiveResidentId) ?? residents[0],
    [residents, effectiveResidentId],
  )

  const filteredResidentEvents = useMemo<CareEvent[]>(() => {
    if (!selectedResident) return []
    if (overviewFilter === 'all') return selectedResident.timeline
    return selectedResident.timeline.filter((event) => event.type === overviewFilter)
  }, [overviewFilter, selectedResident])

  const eventsForResident = useMemo(() => {
    if (!selectedResident) return events
    const extras = events.filter((event) => event.residentId !== selectedResident.id)
    return [...selectedResident.timeline, ...extras]
  }, [events, selectedResident])

  const overviewEvents = useMemo(() => {
    if (!selectedResident) return [] as CareEvent[]
    return filteredResidentEvents
  }, [filteredResidentEvents, selectedResident])

  const selectedResidentEventsForReports = useMemo(
    () => eventsForResident,
    [eventsForResident],
  )

  const unreadCount = useMemo(() => computeUnreadCount(notifications), [notifications])

  const handleSelectResident = useCallback(
    (id: string): void => {
      setSelectedResidentId(id)
      if (role === 'manager') setView('residents')
    },
    [role],
  )

  const handleRoleChange = useCallback((next: Role): void => {
    setRole(next)
    setSelectedResidentId(selectResidentForRole(next, residents, selectedResidentId))
  }, [residents, selectedResidentId])

  const openAddResident = useCallback((): void => {
    setResidentDraft(initialDraft)
    setResidentModal({ open: true })
  }, [])

  const openEditResident = useCallback((resident: Resident): void => {
    setResidentDraft(resident)
    setResidentModal({ open: true, editingId: resident.id })
  }, [])

  const submitResident = useCallback((resident: Resident): void => {
    setResidents((current) => {
      const idx = current.findIndex((item) => item.id === resident.id)
      if (idx >= 0) {
        const next = [...current]
        next[idx] = resident
        return next
      }
      return [...current, resident]
    })
    setSelectedResidentId(resident.id)
    setResidentModal({ open: false })
    toast.push(t(locale, 'toast.residentCreated'))
  }, [setResidents, toast, locale])

  const deleteResident = useCallback((id: string): void => {
    setResidents((current) => current.filter((resident) => resident.id !== id))
    toast.push(t(locale, 'toast.residentDeleted'))
    if (selectedResidentId === id) {
      const fallback = residents.find((resident) => resident.id !== id)?.id ?? ''
      if (fallback) setSelectedResidentId(fallback)
    }
  }, [setResidents, residents, selectedResidentId, toast, locale])

  const addJournalEntry = useCallback((): void => {
    if (!selectedResident) return
    const created = makeLocalEvent(selectedResident.id, role, locale === 'zh-Hant' ? '新增 mock 紀錄' : 'New mock note')
    setEvents((current) => [created, ...current])
    setResidents((current) => current.map((resident) => resident.id === selectedResident.id
      ? { ...resident, timeline: [created, ...resident.timeline] }
      : resident))
    toast.push(t(locale, 'toast.journalSaved'))
  }, [selectedResident, role, locale, setEvents, setResidents, toast])

  const toggleMedication = useCallback((id: string): void => {
    setMedications((current) => current.map((item) => item.id === id ? { ...item, taken: !item.taken } : item))
    toast.push(t(locale, 'toast.medicationUpdated'))
  }, [setMedications, toast, locale])

  const markAllRead = useCallback((): void => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })))
    toast.push(t(locale, 'toast.notifReadAll'))
  }, [setNotifications, toast, locale])

  const addMockShift = useCallback((): void => {
    const target = selectedResident ?? residents[0]
    if (!target) return
    const newShift: Shift = {
      id: `s-${Date.now()}`,
      residentId: target.id,
      caregiver: locale === 'zh-Hant' ? '目前照服員' : 'Current caregiver',
      date: '2026-09-26',
      start: '09:00',
      end: '11:00',
      status: 'pending',
    }
    setShifts((current) => [...current, newShift])
    toast.push(t(locale, 'toast.shiftAdded'))
  }, [selectedResident, residents, locale, setShifts, toast])

  const resolveShift = useCallback((id: string): void => {
    setShifts((current) => current.map((shift) => shift.id === id ? { ...shift, status: 'confirmed' as const } : shift))
    toast.push(t(locale, 'toast.shiftResolved'))
  }, [setShifts, toast, locale])

  const handleOpenSos = useCallback((): void => setSosOpen(true), [])

  const handleConfirmSos = useCallback((): void => {
    if (!selectedResident) {
      setSosOpen(false)
      toast.push(t(locale, 'toast.sosRecorded'))
      return
    }
    const preview = makeSosPreviewEvent(selectedResident.id)
    setSosHistory((current) => [preview, ...current].slice(0, 8))
    setSosOpen(false)
    toast.push(t(locale, 'toast.sosRecorded'))
  }, [selectedResident, setSosHistory, toast, locale])

  const handleAcknowledge = useCallback((eventId: string): void => {
    setAcknowledged((current) => ({ ...current, [eventId]: true }))
  }, [])

  const handleAvatarClick = useCallback((): void => {
    toast.push(t(locale, 'toast.roleWorkspace', { role: t(locale, `role.${role}`) }))
  }, [toast, locale, role])

  const handleWorkspaceClick = useCallback((): void => {
    toast.push(t(locale, 'toast.workspaceLocal'))
  }, [toast, locale])

  const handleSearchFocus = useCallback((): void => {
    toast.push(t(locale, 'toast.searchLocal'))
  }, [toast, locale])

  const handleRefreshSync = useCallback((): void => {
    toast.push(t(locale, 'toast.noSync'))
  }, [toast, locale])

  return (
    <div className="product-shell">
      <a className="skip-link" href="#main-content">{locale === 'zh-Hant' ? '跳到主要內容' : 'Skip to main content'}</a>
      <Sidebar
        active={view}
        role={role}
        locale={locale}
        unread={unreadCount}
        onSelect={setView}
        onWorkspaceClick={handleWorkspaceClick}
      />
      <main className="main" id="main-content" tabIndex={-1}>
        <Topbar
          active={view}
          role={role}
          locale={locale}
          syncHeadline={t(locale, 'sync.headline')}
          syncTime={t(locale, 'sync.meta')}
          onLocaleChange={setLocale}
          onRoleChange={handleRoleChange}
          onAvatar={handleAvatarClick}
          onRefreshSync={handleRefreshSync}
        />
        <div style={{ display: 'grid', gap: 18 }}>
          {view === 'overview' && (
            <Overview
              residents={residents}
              events={overviewEvents}
              notificationsCount={unreadCount}
              todayVisits={selectedResident?.strip.visits ?? 0}
              todayReview={residents.length}
              familyMessages={selectedResident?.strip.messages ?? 0}
              pendingSignals={residents.reduce((acc, resident) => acc + resident.strip.signals, 0)}
              locale={locale}
              role={role}
              selectedResident={selectedResident ?? residents[0] ?? seedResidents[0]}
              onSelectResident={handleSelectResident}
              onOpenResident={handleSelectResident}
              onFilterChange={setOverviewFilter}
              onAddJournal={addJournalEntry}
              onPreviewSos={handleOpenSos}
              onAcknowledge={handleAcknowledge}
              filter={overviewFilter}
              acknowledged={acknowledged}
            />
          )}
          {view === 'residents' && selectedResident && (
            <ResidentsView
              residents={residents}
              selected={selectedResident}
              locale={locale}
              search={residentSearch}
              showSensitive={showSensitive}
              onSearch={setResidentSearch}
              onSelect={handleSelectResident}
              onToggleSensitive={() => setShowSensitive((value) => !value)}
              onAdd={openAddResident}
              onEdit={openEditResident}
              onDelete={deleteResident}
              onSos={handleOpenSos}
            />
          )}
          {view === 'schedule' && (
            <ScheduleView shifts={shifts} residents={residents} locale={locale} onAdd={addMockShift} onResolve={resolveShift} />
          )}
          {view === 'journal' && (
            <JournalView
              events={selectedResidentEventsForReports}
              residents={residents}
              selectedResidentId={selectedResident?.id ?? ''}
              locale={locale}
              onAdd={addJournalEntry}
            />
          )}
          {view === 'medications' && (
            <MedicationsView
              medications={medications}
              residents={residents}
              locale={locale}
              onToggle={toggleMedication}
            />
          )}
          {view === 'family' && (
            <FamilyView
              notifications={notifications}
              residents={residents}
              locale={locale}
              onMarkAll={markAllRead}
              onOpen={handleSelectResident}
            />
          )}
          {view === 'reports' && (
            <ReportsView
              residents={residents}
              shifts={shifts}
              events={selectedResidentEventsForReports}
              locale={locale}
              sosHistory={sosHistory}
              onOpenSos={handleOpenSos}
            />
          )}
          <PrototypeNote locale={locale} />
        </div>
      </main>
      <MobileNav active={view} locale={locale} onSelect={setView} onSos={handleOpenSos} />
      <ResidentModal
        open={residentModal.open}
        draft={residentDraft}
        editingId={residentModal.editingId}
        locale={locale}
        onChange={setResidentDraft}
        onClose={() => setResidentModal({ open: false })}
        onSubmit={(resident) => submitResident(shapeResidentFromDraft(resident, resident.id || `r-mock-${Date.now()}`))}
        onToast={toast.push}
      />
      <SosModal
        open={sosOpen}
        locale={locale}
        stepsLabel={`${t(locale, 'sosHistory.stepsLabel')} (${sosSteps.length})`}
        steps={sosSteps.map((step) => ({
          id: step.id,
          actor: step.actor,
          label: step.label,
          detail: step.detail,
        }))}
        onClose={() => setSosOpen(false)}
        onConfirm={handleConfirmSos}
      />
      <ToastStack messages={toast.messages} />
      {/* Search focus helper kept off the main UI; it lives in the search field
          of the residents view. It exists to remind future maintainers why
          search lives there. */}
      <input type="hidden" aria-hidden onFocus={handleSearchFocus} />
    </div>
  )
}