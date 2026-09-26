import { useMemo, type ReactNode } from 'react'
import type { CareEvent, Medication, NotificationItem, Resident, Shift } from '../domain'
import { filterResidents, findShiftConflicts, getResidentEvents, maskPhone, maskSensitive, sortedEventsByIso } from '../domain'
import type { Locale } from '../i18n'
import { t } from '../i18n'
import { formatCount, formatDate, formatDateTime, formatHours, formatTime } from '../format'

interface ResidentsViewProps {
  residents: Resident[]
  selected: Resident | undefined
  locale: Locale
  search: string
  showSensitive: boolean
  onSearch: (value: string) => void
  onSelect: (id: string) => void
  onToggleSensitive: () => void
  onAdd: () => void
  onEdit: (resident: Resident) => void
  onDelete: (id: string) => void
  onSos: () => void
}

export function ResidentsView(props: ResidentsViewProps): ReactNode {
  const { residents, selected, locale, search, showSensitive, onSearch, onSelect, onToggleSensitive, onAdd, onEdit, onDelete, onSos } = props
  const filtered = useMemo(() => filterResidents(residents, search), [residents, search])

  return (
    <section className="split-view">
      <div className="panel list-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">{t(locale, 'residentsView.eyebrow')}</span>
            <h2>{t(locale, 'residentsView.title')}</h2>
          </div>
          <div className="heading-actions">
            <button type="button" className="primary-button" onClick={onAdd}>＋ {t(locale, 'residentsView.add')}</button>
          </div>
        </div>
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder={t(locale, 'residentsView.searchPlaceholder')}
            aria-label={t(locale, 'residentsView.searchPlaceholder')}
          />
        </label>
        <div className="resident-list">
          {filtered.map((resident) => (
            <button
              key={resident.id}
              type="button"
              className={`resident-list-item ${selected?.id === resident.id ? 'selected' : ''}`}
              onClick={() => onSelect(resident.id)}
            >
              <span className={`person-avatar ${resident.portraitTone}`} aria-hidden="true">
                {resident.initials[locale]}
              </span>
              <div>
                <strong>{resident.names.full[locale]}</strong>
                <span className="meta">{resident.carePlan[locale]}</span>
                <span className="city">{resident.city}</span>
              </div>
              <span className={`state-pill ${resident.status}`}>
                {t(locale, `status.${resident.status}`)}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p style={{ margin: 0, color: 'var(--muted-light)', fontSize: 12, padding: '12px 0' }}>
              {t(locale, 'residentsView.empty')}
            </p>
          )}
        </div>
      </div>
      {selected && (
        <div className="panel detail-panel">
          <div className="detail-top">
            <div>
              <span className="eyebrow">{t(locale, 'residentsView.detailEyebrow')}</span>
            </div>
            <div className="heading-actions">
              <button type="button" className="secondary-button" onClick={onToggleSensitive}>
                {showSensitive ? t(locale, 'residentsView.maskHide') : t(locale, 'residentsView.maskShow')}
              </button>
              <button type="button" className="secondary-button" onClick={() => onEdit(selected)}>{t(locale, 'residentsView.edit')}</button>
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  if (window.confirm(t(locale, 'residentsView.deleteConfirm'))) onDelete(selected.id)
                }}
              >
                {t(locale, 'residentsView.delete')}
              </button>
              <button type="button" className="primary-button" onClick={onSos}>{t(locale, 'hero.cta')}</button>
            </div>
          </div>
          <div className="detail-identity">
            <span className={`person-avatar ${selected.portraitTone}`} aria-hidden="true">
              {selected.initials[locale]}
            </span>
            <div>
              <h2>{selected.names.full[locale]}</h2>
              <p>
                {selected.names.full.en} · {formatCount(locale, selected.age)} {locale === 'zh-Hant' ? '歲' : 'yrs'} · {selected.carePlan[locale]}
              </p>
              <span className={`state-pill ${selected.status}`}>
                {t(locale, `status.${selected.status}`)}
              </span>
            </div>
          </div>
          <div className="detail-section">
            <span className="eyebrow">CARE CONTEXT</span>
            <div className="detail-grid">
              <DetailField label={t(locale, 'residentsView.fields.city')} value={selected.city} />
              <DetailField label={t(locale, 'residentsView.fields.nextReview')} value={selected.nextReview[locale]} />
              <DetailField label={t(locale, 'residentsView.fields.family')} value={`${formatCount(locale, selected.family.length)} ${locale === 'zh-Hant' ? '位' : 'members'}`} />
              <DetailField label={t(locale, 'residentsView.fields.nextService')} value={`${formatTime(locale, selected.next.iso)} · ${selected.next.focus[locale]}`} />
            </div>
          </div>
          <div className="detail-section sensitive">
            <span className="eyebrow">{t(locale, 'residentsView.sensitiveEyebrow')}</span>
            <div className="detail-grid">
              <DetailField
                label={t(locale, 'residentsView.fields.address')}
                value={maskSensitive(selected.address, showSensitive)}
              />
              <DetailField
                label={t(locale, 'residentsView.fields.emergencyName')}
                value={maskSensitive(selected.emergencyName, showSensitive)}
              />
              <DetailField
                label={t(locale, 'residentsView.fields.emergencyPhone')}
                value={maskPhone(selected.emergencyPhone, showSensitive)}
              />
              <DetailField
                label={t(locale, 'residentsView.fields.romanized')}
                value={maskSensitive(selected.names.full.en, showSensitive)}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function DetailField({ label, value }: { label: string; value: string }): ReactNode {
  return (
    <div className="detail-field">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

interface ScheduleViewProps {
  shifts: Shift[]
  residents: Resident[]
  locale: Locale
  onAdd: () => void
  onResolve: (id: string) => void
}

export function ScheduleView({ shifts, residents, locale, onAdd, onResolve }: ScheduleViewProps): ReactNode {
  const days = [
    { label: locale === 'zh-Hant' ? '週一' : 'Mon', date: '2026-09-21', sub: '09/21' },
    { label: locale === 'zh-Hant' ? '週二' : 'Tue', date: '2026-09-22', sub: '09/22' },
    { label: locale === 'zh-Hant' ? '今天' : 'Today', date: '2026-09-24', sub: '09/24' },
    { label: locale === 'zh-Hant' ? '週五' : 'Fri', date: '2026-09-25', sub: '09/25' },
    { label: locale === 'zh-Hant' ? '週六' : 'Sat', date: '2026-09-26', sub: '09/26' },
  ]
  const conflictIds = useMemo(() => findShiftConflicts(shifts), [shifts])

  return (
    <section className="stack-view">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t(locale, 'scheduleView.eyebrow')}</span>
          <h2>{t(locale, 'scheduleView.title')}</h2>
          <p>{t(locale, 'scheduleView.lead')}</p>
        </div>
        <div className="heading-actions">
          <button type="button" className="primary-button" onClick={onAdd}>＋ {t(locale, 'scheduleView.add')}</button>
        </div>
      </div>
      <div className="week-toolbar">
        <span className="week-chip">{t(locale, 'scheduleView.weekChip')}</span>
        <span className="conflict-pill">
          {t(locale, 'scheduleView.conflictsCount', { n: formatCount(locale, conflictIds.length / 2) })}
        </span>
        <span className="sync-pill">local-only</span>
      </div>
      <div className="schedule-board">
        {days.map((day) => (
          <div className="schedule-day" key={day.date}>
            <div className="schedule-day-label">
              {day.label}
              <small>{day.sub}</small>
            </div>
            <div className="schedule-slots">
              {shifts
                .filter((shift) => shift.date === day.date)
                .map((shift) => {
                  const resident = residents.find((item) => item.id === shift.residentId)
                  const hasConflict = conflictIds.includes(shift.id)
                  const statusClass = hasConflict ? 'conflict' : shift.status
                  return (
                    <div className={`shift-card ${statusClass}`} key={shift.id}>
                      <div className="shift-time">
                        <span>{shift.start}</span>
                        <small>—</small>
                        <span>{shift.end}</span>
                      </div>
                      <div className="shift-name">{resident?.names.full[locale] ?? shift.residentId}</div>
                      <p className="shift-meta">{shift.caregiver}</p>
                      <span className={`shift-status ${statusClass}`}>
                        {hasConflict
                          ? t(locale, 'scheduleView.conflict')
                          : shift.status === 'confirmed'
                          ? t(locale, 'scheduleView.confirmed')
                          : shift.status === 'running'
                          ? t(locale, 'nextSlot.running')
                          : t(locale, 'scheduleView.pending')}
                      </span>
                      {hasConflict && (
                        <button type="button" className="shift-action" onClick={() => onResolve(shift.id)}>
                          {t(locale, 'scheduleView.resolve')}
                        </button>
                      )}
                    </div>
                  )
                })}
              {!shifts.some((shift) => shift.date === day.date) && (
                <span className="shift-empty">{t(locale, 'scheduleView.empty')}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="callout" style={{ background: 'var(--accent-soft)', color: '#5b3416', borderRadius: 11, padding: '12px 14px', borderLeft: '3px solid var(--accent)' }}>
        <strong style={{ display: 'block', fontWeight: 800, color: 'var(--ink)' }}>{t(locale, 'scheduleView.decisionTitle')}</strong>
        <span style={{ fontSize: 12 }}>{t(locale, 'scheduleView.decisionBody')}</span>
      </div>
    </section>
  )
}

interface JournalViewProps {
  events: CareEvent[]
  residents: Resident[]
  selectedResidentId: string
  locale: Locale
  onAdd: () => void
}

export function JournalView({ events, residents, selectedResidentId, locale, onAdd }: JournalViewProps): ReactNode {
  const visible = useMemo(() => {
    const own = getResidentEvents(residents, selectedResidentId, 'all')
    const extras = events.filter((event) => event.residentId !== selectedResidentId)
    return sortedEventsByIso([...own, ...extras])
  }, [events, residents, selectedResidentId])

  return (
    <section className="stack-view">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t(locale, 'journalView.eyebrow')}</span>
          <h2>{t(locale, 'journalView.title')}</h2>
          <p>{t(locale, 'journalView.lead')}</p>
        </div>
        <div className="heading-actions">
          <button type="button" className="primary-button" onClick={onAdd}>＋ {t(locale, 'journalView.add')}</button>
        </div>
      </div>
      <div className="journal-composer">
        <span className="avatar">SL</span>
        <div>
          <strong>{t(locale, 'journalView.composerTitle')}</strong>
          <small>
            {t(locale, 'journalView.residentLabel')}：{residents.find((resident) => resident.id === selectedResidentId)?.names.full[locale] ?? t(locale, 'journalView.noResident')}
          </small>
        </div>
        <span className="composer-badge">{t(locale, 'journalView.composerBadge')}</span>
      </div>
      <div className="journal-list">
        {visible.map((event) => {
          const typeClass = event.type === 'family' ? 'family' : event.type
          return (
            <article className="journal-row" key={event.id}>
              <time dateTime={event.iso}>{formatDateTime(locale, event.iso)}</time>
              <div className="timeline-line">
                <span className={`timeline-icon ${typeClass}`} aria-hidden="true">
                  {event.type === 'family' ? 'F' : event.type === 'vital' ? 'V' : event.type === 'alert' ? '!' : event.type === 'note' ? 'N' : 'S'}
                </span>
              </div>
              <div className="timeline-body">
                <div className="timeline-title">
                  {event.title[locale]}
                  <span className={`tag ${event.type}`}>{t(locale, `tags.${event.tag}`)}</span>
                </div>
                <p className="timeline-copy">{event.copy[locale]}</p>
                <div className="timeline-meta">
                  <span className="meta-row">
                    <span className="avatar-chip" aria-hidden="true">{event.recordedBy.initials}</span>
                    <span>{event.recordedBy.names[locale]} · {event.recordedBy.role[locale]}</span>
                  </span>
                  <span className={`source-tag ${event.confidence === 'verified' ? 'verified' : 'pending'}`}>
                    {t(locale, `confidence.${event.confidence}`)}
                  </span>
                  <span className="source-tag">{t(locale, `sources.${event.source}`)}</span>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

interface MedicationsViewProps {
  medications: Medication[]
  residents: Resident[]
  locale: Locale
  onToggle: (id: string) => void
}

export function MedicationsView({ medications, residents, locale, onToggle }: MedicationsViewProps): ReactNode {
  const total = medications.length
  const taken = medications.filter((med) => med.taken).length
  const pct = total === 0 ? 0 : Math.round((taken / total) * 100)

  return (
    <section className="stack-view">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t(locale, 'medicationsView.eyebrow')}</span>
          <h2>{t(locale, 'medicationsView.title')}</h2>
          <p>{t(locale, 'medicationsView.lead')}</p>
        </div>
        <div className="heading-actions">
          <div className="medication-summary" style={{ padding: '12px 16px' }}>
            <div className="completion-ring" style={{ ['--pct' as never]: pct }}>
              <span>{formatCount(locale, taken)}/{formatCount(locale, total)}</span>
            </div>
            <div>
              <strong>{t(locale, 'medicationsView.completion')}</strong>
              <small>{locale === 'zh-Hant' ? '今日 mock 例行' : 'Today mock routine'}</small>
            </div>
          </div>
        </div>
      </div>
      <div className="medication-list">
        {medications.map((medication) => {
          const resident = residents.find((item) => item.id === medication.residentId)
          return (
            <div className={`medication-row ${medication.taken ? 'done' : ''}`} key={medication.id}>
              <div className="med-time">
                {medication.time}
                <small>{locale === 'zh-Hant' ? '今日' : 'Today'}</small>
              </div>
              <div className="med-icon">◌</div>
              <div className="med-copy">
                <strong>{medication.name[locale]}</strong>
                <span>{resident?.names.full[locale] ?? '—'} · {medication.dose[locale]}</span>
              </div>
              <span className={`shift-status ${medication.taken ? 'confirmed' : 'pending'}`}>
                {medication.taken ? t(locale, 'medicationsView.statusTaken') : t(locale, 'medicationsView.statusPending')}
              </span>
              <button type="button" className={`med-action ${medication.taken ? 'taken' : 'pending'}`} onClick={() => onToggle(medication.id)}>
                {medication.taken ? t(locale, 'medicationsView.unmark') : t(locale, 'medicationsView.mark')}
              </button>
            </div>
          )
        })}
        {medications.length === 0 && (
          <p style={{ margin: 0, color: 'var(--muted-light)', fontSize: 12 }}>{t(locale, 'medicationsView.noMeds')}</p>
        )}
      </div>
      <div className="callout" style={{ background: 'var(--accent-soft)', color: '#5b3416', borderRadius: 11, padding: '12px 14px', borderLeft: '3px solid var(--accent)' }}>
        <strong style={{ display: 'block', fontWeight: 800, color: 'var(--ink)' }}>{t(locale, 'medicationsView.safetyTitle')}</strong>
        <span style={{ fontSize: 12 }}>{t(locale, 'medicationsView.safetyBody')}</span>
      </div>
    </section>
  )
}

interface FamilyViewProps {
  notifications: NotificationItem[]
  residents: Resident[]
  locale: Locale
  onMarkAll: () => void
  onOpen: (residentId: string) => void
}

export function FamilyView({ notifications, residents, locale, onMarkAll, onOpen }: FamilyViewProps): ReactNode {
  return (
    <section className="stack-view">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t(locale, 'familyView.eyebrow')}</span>
          <h2>{t(locale, 'familyView.title')}</h2>
          <p>{t(locale, 'familyView.lead')}</p>
        </div>
        <div className="heading-actions">
          <button type="button" className="secondary-button" onClick={onMarkAll}>{t(locale, 'familyView.markAll')}</button>
        </div>
      </div>
      <div className="notification-list">
        {notifications.map((item) => {
          const resident = residents.find((entry) => entry.id === item.residentId)
          const tone = item.read ? 'healthy' : 'attention'
          return (
            <button
              key={item.id}
              type="button"
              className={`notification-row ${item.read ? 'read' : ''}`}
              onClick={() => onOpen(item.residentId)}
            >
              <span className={`notification-icon ${tone}`} aria-hidden="true">!</span>
              <div>
                <strong>{item.title[locale]}</strong>
                <span>{item.detail[locale]}</span>
                <small>{resident?.names.full[locale] ?? '—'} · {item.time[locale]}</small>
              </div>
              {!item.read && <span className="unread-dot" aria-hidden="true" />}
            </button>
          )
        })}
        {notifications.length === 0 && (
          <p style={{ margin: 0, color: 'var(--muted-light)', fontSize: 12 }}>{t(locale, 'familyView.noNotifs')}</p>
        )}
      </div>
      <div className="route-grid">
        <div className="route-card">
          <span className="eyebrow">ROUTE</span>
          <strong>{t(locale, 'familyView.routeFamily')}</strong>
          <small>{t(locale, 'familyView.routeFamilyStatus')}</small>
        </div>
        <div className="route-card">
          <span className="eyebrow">ROUTE</span>
          <strong>{t(locale, 'familyView.routeCaregiver')}</strong>
          <small>{t(locale, 'familyView.routeCaregiverStatus')}</small>
        </div>
        <div className="route-card">
          <span className="eyebrow">ROUTE</span>
          <strong>{t(locale, 'familyView.routeEmergency')}</strong>
          <small>{t(locale, 'familyView.routeEmergencyStatus')}</small>
        </div>
      </div>
    </section>
  )
}

interface ReportsViewProps {
  residents: Resident[]
  shifts: Shift[]
  events: CareEvent[]
  locale: Locale
  sosHistory: Array<{ id: string; residentId: string; recordedAtIso: string; steps: Array<{ id: string; actor: string }> }>
  onOpenSos: () => void
}

export function ReportsView({ residents, shifts, events, locale, sosHistory, onOpenSos }: ReportsViewProps): ReactNode {
  const completed = shifts.filter((shift) => shift.status === 'confirmed').length
  const completion = shifts.length === 0 ? 0 : Math.round((completed / shifts.length) * 100)
  const hours = useMemo(() => shifts.reduce((acc, shift) => {
    const [sh, sm] = shift.start.split(':').map(Number)
    const [eh, em] = shift.end.split(':').map(Number)
    return acc + ((eh * 60 + em) - (sh * 60 + sm)) / 60
  }, 0), [shifts])
  const journalPct = residents.length === 0 ? 0 : Math.round((events.length / Math.max(residents.length * 5, 1)) * 100)

  return (
    <section className="stack-view">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t(locale, 'reportsView.eyebrow')}</span>
          <h2>{t(locale, 'reportsView.title')}</h2>
          <p>{t(locale, 'reportsView.lead')}</p>
        </div>
        <div className="heading-actions">
          <button type="button" className="primary-button" onClick={onOpenSos}>{t(locale, 'reportsView.sos')}</button>
        </div>
      </div>
      <div className="report-grid">
        <ReportCard label={t(locale, 'reportsView.visitCompletion')} value={formatCount(locale, completion)} suffix="%" detail={`${formatCount(locale, shifts.length)} ${locale === 'zh-Hant' ? '個 mock 班次' : 'mock shifts'}`} tone="healthy" />
        <ReportCard label={t(locale, 'reportsView.weeklyHours')} value={formatHours(locale, hours)} detail={locale === 'zh-Hant' ? '依排班資料計算' : 'From schedule data'} tone="attention" />
        <ReportCard label={t(locale, 'reportsView.journalCompleteness')} value={formatCount(locale, Math.min(journalPct, 100))} suffix="%" detail={`${formatCount(locale, events.length)} ${locale === 'zh-Hant' ? '筆 local timeline' : 'local timeline'}`} tone="service" />
        <ReportCard label={t(locale, 'reportsView.inCareResidents')} value={formatCount(locale, residents.length)} detail={locale === 'zh-Hant' ? '尚未連接真實資料' : 'No real data yet'} tone="action" />
      </div>
      <div className="safety-card">
        <div>
          <span className="eyebrow" style={{ color: 'var(--muted-light)', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 900 }}>
            {t(locale, 'reportsView.safetyTitle')}
          </span>
          <h3>{t(locale, 'sos.title')}</h3>
          <p>{t(locale, 'reportsView.safetyBody')}</p>
        </div>
        <button type="button" className="primary-button" onClick={onOpenSos}>{t(locale, 'reportsView.safetyAction')} →</button>
      </div>
      {sosHistory.length > 0 && (
        <section>
          <span className="eyebrow" style={{ color: 'var(--muted-light)', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 900 }}>
            {t(locale, 'sosHistory.eyebrow')}
          </span>
          <div className="sos-history-list" style={{ marginTop: 12 }}>
            {sosHistory.map((entry) => (
              <div className="sos-history-row" key={entry.id}>
                <span className="eyebrow" style={{ color: 'var(--muted-light)', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 900 }}>
                  {formatDate(locale, entry.recordedAtIso)}
                </span>
                <strong>
                  {residents.find((resident) => resident.id === entry.residentId)?.names.full[locale] ?? entry.residentId}
                </strong>
                <small>
                  {t(locale, 'sosHistory.stepsLabel')}：{entry.steps.length}
                </small>
              </div>
            ))}
          </div>
        </section>
      )}
    </section>
  )
}

interface ReportCardProps {
  label: string
  value: string
  suffix?: string
  detail: string
  tone: 'healthy' | 'attention' | 'service' | 'action'
}

function ReportCard({ label, value, suffix, detail, tone }: ReportCardProps): ReactNode {
  return (
    <div className={`report-card ${tone}`}>
      <span className="eyebrow">{label}</span>
      <div className="report-value">{value}{suffix ?? ''}</div>
      <small className="report-meta">{detail}</small>
      <div className="report-bar"><i style={{ width: '72%' }} /></div>
    </div>
  )
}