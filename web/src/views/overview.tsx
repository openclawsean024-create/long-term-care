import { useMemo, type ReactNode } from 'react'
import type { CareEvent, EventType, Resident, Role, StatusTone } from '../domain'
import { computeQueueCount } from '../domain'
import type { Locale } from '../i18n'
import { t } from '../i18n'
import {
  dateKeys,
  formatCount,
  formatDate,
  formatPct,
  formatRelative,
  formatTime,
} from '../format'
import { EmptyState } from '../components/primitives'

type OverviewEventFilter = 'all' | EventType

interface OverviewProps {
  residents: Resident[]
  events: CareEvent[]
  notificationsCount: number
  todayVisits: number
  todayReview: number
  familyMessages: number
  pendingSignals: number
  locale: Locale
  role: Role
  selectedResident: Resident
  onSelectResident: (id: string) => void
  onOpenResident: (id: string) => void
  onFilterChange: (filter: OverviewEventFilter) => void
  onAddJournal: () => void
  onPreviewSos: () => void
  onAcknowledge: (eventId: string) => void
  filter: OverviewEventFilter
  acknowledged: Record<string, true>
}

export function Overview(props: OverviewProps): ReactNode {
  const {
    residents,
    events,
    notificationsCount,
    todayVisits,
    todayReview,
    familyMessages,
    pendingSignals,
    locale,
    role,
    selectedResident,
    onSelectResident,
    onOpenResident,
    onFilterChange,
    onAddJournal,
    onPreviewSos,
    onAcknowledge,
    filter,
    acknowledged,
  } = props

  const queueCount = useMemo(() => computeQueueCount(residents), [residents])
  const pct = residents.length === 0 ? 0 : Math.round(((residents.length - 0) / Math.max(residents.length, 1)) * 100)

  const filters: Array<{ id: OverviewEventFilter; labelKey: string }> = [
    { id: 'all', labelKey: 'filters.all' },
    { id: 'service', labelKey: 'filters.service' },
    { id: 'vital', labelKey: 'filters.vital' },
    { id: 'family', labelKey: 'filters.family' },
    { id: 'alert', labelKey: 'filters.alert' },
    { id: 'note', labelKey: 'filters.note' },
  ]

  const visibleEvents = useMemo(() => {
    if (filter === 'all') return events
    return events.filter((event) => event.type === filter)
  }, [events, filter])

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="kicker" id="hero-eyebrow">{t(locale, 'hero.kicker')} · 24 SEP 2026 · {t(locale, 'tz')}</span>
          <h1 id="hero-title">{t(locale, `roleCopy.${role}.greeting`)}</h1>
          <p>{t(locale, `roleCopy.${role}.lead`)}</p>
          <div className="hero-actions">
            <button type="button" className="secondary-button" onClick={onAddJournal}>＋ {t(locale, 'hero.secondary')}</button>
            <button type="button" className="primary-button" id="sos-button-main" onClick={onPreviewSos}>
              {t(locale, 'hero.cta')} →
            </button>
          </div>
        </div>
        <div className="hero-pulse">
          <div className="pulse-orbit" aria-hidden="true">
            <div className="pulse-center">
              <small>{t(locale, 'pulse.today')}</small>
              <strong id="pulse-pct">{formatPct(locale, pct || 78)}</strong>
              <span className="pulse-meta">{locale === 'zh-Hant' ? '照護進度正常' : 'care on track'}</span>
            </div>
          </div>
          <div className="pulse-strip" aria-label="Today's signals">
            <div className="pulse-stat">
              <small>{t(locale, 'pulseStrip.visits')}</small>
              <strong id="pulse-visits">{formatCount(locale, todayVisits)} / {formatCount(locale, todayVisits + 3)}</strong>
            </div>
            <div className="pulse-stat">
              <small>{t(locale, 'pulseStrip.review')}</small>
              <strong id="pulse-review">{formatCount(locale, todayReview)}</strong>
            </div>
            <div className="pulse-stat">
              <small>{t(locale, 'pulseStrip.family')}</small>
              <strong id="pulse-family">{formatCount(locale, familyMessages)}</strong>
            </div>
            <div className="pulse-stat">
              <small>{t(locale, 'pulseStrip.signals')}</small>
              <strong id="pulse-signals">+{formatCount(locale, pendingSignals)}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="focus-queue" aria-label="Focus queue">
        <div className="queue-intro">
          <span className="index" aria-hidden="true">01</span>
          <div className="intro-copy">
            <span>{t(locale, 'queue.intro')}</span>
            <strong id="queue-headline">{t(locale, 'queue.items', { n: formatCount(locale, queueCount) })}</strong>
          </div>
        </div>
        {residents.slice(0, 2).map((resident, index) => (
          <button
            key={resident.id}
            type="button"
            className="queue-item"
            data-resident={resident.id}
            onClick={() => onOpenResident(resident.id)}
          >
            <span className={`queue-icon ${resident.status === 'action' ? 'action' : resident.status === 'attention' ? 'attention' : resident.status === 'emergency' ? 'emergency' : 'healthy'}`} aria-hidden="true">↗</span>
            <span className="queue-body">
              <strong id={`queue-${index + 1}-title`}>{resident.queue.title[locale]}</strong>
              <span id={`queue-${index + 1}-meta`}>{resident.queue.meta[locale]}</span>
            </span>
          </button>
        ))}
        <button className="queue-link" type="button" id="queue-link" onClick={() => onOpenResident('lin')}>
          {t(locale, 'queue.link')} →
        </button>
      </section>

      <div className="legend" aria-label={t(locale, 'legend.title')}>
        <strong>{t(locale, 'legend.title')}</strong>
        <span><i className="dot healthy" />{t(locale, 'status.healthy')}</span>
        <span><i className="dot attention" />{t(locale, 'status.attention')}</span>
        <span><i className="dot action" />{t(locale, 'status.action')}</span>
        <span><i className="dot emergency" />{t(locale, 'status.emergency')}</span>
        <span style={{ marginLeft: 'auto' }}>{t(locale, 'familyView.eyebrow')}: {formatCount(locale, notificationsCount)}</span>
      </div>

      <div className="board-layout">
        <section className="panel chronology" aria-labelledby="timeline-heading">
          <div className="panel-head">
            <div>
              <h2 id="timeline-heading">{t(locale, 'chronology.title')}</h2>
              <p id="timeline-subtitle">{t(locale, 'chronology.subtitle', { name: selectedResident.names.full[locale] })}</p>
            </div>
            <div className="live" aria-live="polite">
              <i aria-hidden="true" />
              <span id="timeline-live">{t(locale, 'chronology.live')}</span>
            </div>
          </div>
          <div className="filters" role="tablist" aria-label="Timeline filters">
            {filters.map((f) => {
              const count = f.id === 'all' ? events.length : events.filter((event) => event.type === f.id).length
              const active = f.id === filter
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  data-filter={f.id}
                  className={`filter ${active ? 'active' : ''}`}
                  onClick={() => onFilterChange(f.id)}
                >
                  <span>{t(locale, f.labelKey)}</span>
                  <span className="count" id={`count-${f.id}`}>{formatCount(locale, count)}</span>
                </button>
              )
            })}
          </div>
          <div className="timeline" id="timeline" aria-live="polite" aria-busy="false">
            {visibleEvents.length === 0 && <EmptyState text={t(locale, 'chronology.empty')} />}
            {visibleEvents.map((event) => (
              <TimelineItem
                key={event.id}
                event={event}
                locale={locale}
                done={acknowledged[event.id] === true}
                onAcknowledge={() => onAcknowledge(event.id)}
              />
            ))}
          </div>
        </section>

        <Dock
          locale={locale}
          selectedResident={selectedResident}
          residents={residents}
          onSelectResident={onSelectResident}
          onPreviewSos={onPreviewSos}
          onOpenResident={onOpenResident}
        />
      </div>
    </>
  )
}

interface TimelineItemProps {
  event: CareEvent
  locale: Locale
  done: boolean
  onAcknowledge: () => void
}

function TimelineItem({ event, locale, done, onAcknowledge }: TimelineItemProps): ReactNode {
  const keys = dateKeys(locale, event.iso)
  const timePrimary = keys.isToday ? formatTime(locale, event.iso) : formatDate(locale, event.iso)
  const timeSecondary = keys.isToday ? '' : formatTime(locale, event.iso)
  const tone: StatusTone = event.status
  const typeClass = event.type === 'family' ? 'family' : event.type
  const role = event.recordedBy.role[locale]
  const name = event.recordedBy.names[locale]
  const tagLabel = t(locale, `tags.${event.tag}`)
  return (
    <article className="timeline-item">
      <time className="timeline-time" dateTime={event.iso}>
        {timePrimary}
        {timeSecondary ? <small>{timeSecondary}</small> : null}
      </time>
      <div className="timeline-line">
        <span className={`timeline-icon ${typeClass}`} aria-hidden="true">
          {event.type === 'family' ? 'F' : event.type === 'vital' ? 'V' : event.type === 'alert' ? '!' : event.type === 'note' ? 'N' : 'S'}
        </span>
      </div>
      <div className="timeline-body">
        <div className="timeline-title">
          {event.title[locale]}
          <span className={`tag ${tone === 'action' ? 'action' : typeClass}`}>{tagLabel}</span>
        </div>
        <p className="timeline-copy">{event.copy[locale]}</p>
        <div className="timeline-meta" aria-label="Provenance">
          <span className="meta-row">
            <span className="avatar-chip" aria-hidden="true">{event.recordedBy.initials}</span>
            <span>{t(locale, 'syncMeta.by', { role, name })}</span>
          </span>
          <span className={`source-tag ${event.confidence === 'verified' ? 'verified' : 'pending'}`}>
            {t(locale, `confidence.${event.confidence}`)}
          </span>
          <span className="source-tag">{t(locale, `sources.${event.source}`)}</span>
        </div>
      </div>
      <button
        type="button"
        className={`timeline-action ${done ? 'done' : ''}`}
        onClick={onAcknowledge}
        disabled={done}
        aria-label={t(locale, `actions.${event.action}`)}
      >
        {done ? t(locale, 'actions.handled') : t(locale, `actions.${event.action}`)}
      </button>
    </article>
  )
}

interface DockProps {
  locale: Locale
  residents: Resident[]
  selectedResident: Resident
  onSelectResident: (id: string) => void
  onPreviewSos: () => void
  onOpenResident: (id: string) => void
}

function Dock({ locale, residents, selectedResident, onSelectResident, onPreviewSos, onOpenResident }: DockProps): ReactNode {
  const next = selectedResident.next
  const meta = selectedResident.caregiver
  const ageLabel = formatCount(locale, selectedResident.age)
  return (
    <aside className="dock" aria-label="Context dock">
      <section className="panel dock-card">
        <div className="resident-card">
          <div className="resident-top">
            <div className="person-row">
              <span className={`person-avatar ${selectedResident.portraitTone}`} aria-hidden="true">
                {selectedResident.initials[locale]}
              </span>
              <div>
                <strong>{selectedResident.names.full[locale]}</strong>
                <small>
                  {ageLabel} · {selectedResident.carePlan[locale]}
                </small>
              </div>
            </div>
            <span className={`state-pill ${selectedResident.status}`}>
              {t(locale, `status.${selectedResident.status === 'emergency' ? 'emergency' : selectedResident.status === 'action' ? 'action' : selectedResident.status}`)}
            </span>
          </div>
          <div className="resident-meta">
            <div className="field">
              <span>{t(locale, 'dock.resident.family')}</span>
              <strong>
                {formatCount(locale, selectedResident.family.length)}{' '}
                {locale === 'zh-Hant' ? '位家屬' : 'members'}
              </strong>
            </div>
            <div className="field">
              <span>{t(locale, 'dock.resident.review')}</span>
              <strong>{selectedResident.nextReview[locale]}</strong>
            </div>
          </div>
          <div className="resident-strip">
            <div className="strip-cell">
              <span>{t(locale, 'dock.resident.visits')}</span>
              <strong>{formatCount(locale, selectedResident.strip.visits)}</strong>
            </div>
            <div className="strip-cell">
              <span>{t(locale, 'dock.resident.signals')}</span>
              <strong>{formatCount(locale, selectedResident.strip.signals)}</strong>
            </div>
            <div className="strip-cell">
              <span>{t(locale, 'dock.resident.messages')}</span>
              <strong>{formatCount(locale, selectedResident.strip.messages)}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="panel dock-card">
        <div className="panel-head">
          <div>
            <h3>{t(locale, 'dock.next.title')}</h3>
            <p>{formatRelative(locale, next.iso)}</p>
          </div>
          <span className={`tag ${next.status === 'onTime' ? 'service' : next.status === 'running' ? 'action' : 'family'}`}>
            {t(locale, `nextSlot.${next.status === 'onTime' ? 'onTime' : next.status === 'running' ? 'running' : next.status === 'starting' ? 'starting' : 'confirmed'}`)}
          </span>
        </div>
        <div className="next-slot">
          <div className="slot-top">
            <span className="slot-time">{formatTime(locale, next.iso)}</span>
            <span className="slot-meta">
              <strong>{t(locale, `nextSlot.${next.status === 'onTime' ? 'onTime' : next.status === 'running' ? 'running' : next.status === 'starting' ? 'starting' : 'confirmed'}`)}</strong>
              <small>{next.window[locale]}</small>
            </span>
          </div>
          <div className="person-row">
            <span className={`person-avatar ${selectedResident.portraitTone}`} aria-hidden="true">
              {selectedResident.initials[locale]}
            </span>
            <div>
              <strong>{selectedResident.names.full[locale]} · {locale === 'zh-Hant' ? '居家照護' : 'home care'}</strong>
              <small>{meta.names[locale]} · {meta.role[locale]}</small>
            </div>
          </div>
          <div className="slot-detail">
            <div className="field">
              <span>{t(locale, 'dock.next.focus')}</span>
              <strong>{next.focus[locale]}</strong>
            </div>
            <div className="field">
              <span>{t(locale, 'dock.next.window')}</span>
              <strong>{next.window[locale]}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="panel dock-card">
        <div className="panel-head">
          <div>
            <h3>{t(locale, 'dock.needs.title')}</h3>
            <p>{t(locale, 'dock.needs.copy')}</p>
          </div>
          <span className={`tag ${residents.flatMap((r) => r.needs).some((n) => n.status === 'action') ? 'action' : 'attention'}`}>
            {t(locale, 'dock.needs.count', { n: formatCount(locale, residents.flatMap((r) => r.needs).length) })}
          </span>
        </div>
        <div className="attention-list" id="attention-list">
          {residents.flatMap((r) => r.needs.map((need) => ({ ...need, residentName: r.names.full[locale] }))).length === 0 && (
            <p style={{ margin: 0, color: 'var(--muted-light)', fontSize: 11 }}>{t(locale, 'dock.needs.empty')}</p>
          )}
          {residents.flatMap((r) => r.needs.map((need) => ({ ...need, residentName: r.names.full[locale] }))).map((need, index) => (
            <div className="attention-item" key={`${need.residentName}-${index}`}>
              <i className={`attention-bullet ${need.status}`} aria-hidden="true" />
              <div className="attention-body">
                <strong>{need.title[locale]}</strong>
                <span>{need.meta[locale]} · {need.residentName}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel dock-card">
        <div className="panel-head">
          <div>
            <h3>{t(locale, 'dock.network.title')}</h3>
            <p>{t(locale, 'dock.network.copy')}</p>
          </div>
          <span className="tag family">
            {t(locale, 'dock.network.count', { n: formatCount(locale, residents.length) })}
          </span>
        </div>
        <div className="network-list" id="network-list">
          {residents.map((resident) => (
            <button
              key={resident.id}
              type="button"
              data-client={resident.id}
              className={`network-person ${resident.id === selectedResident.id ? 'selected' : ''}`}
              onClick={() => onSelectResident(resident.id)}
            >
              <span className="network-meta">
                <span className={`person-avatar ${resident.portraitTone}`} aria-hidden="true">
                  {resident.initials[locale]}
                </span>
                <div>
                  <strong>{resident.names.full[locale]}</strong>
                  <small>{resident.networkLabel[locale]}</small>
                </div>
              </span>
              <span className="check" aria-hidden="true">{resident.id === selectedResident.id ? '●' : '○'}</span>
            </button>
          ))}
          {residents.length === 0 && <p style={{ margin: 0, color: 'var(--muted-light)', fontSize: 11 }}>{t(locale, 'dock.network.empty')}</p>}
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button type="button" className="secondary-button" onClick={() => onOpenResident(selectedResident.id)}>
            {locale === 'zh-Hant' ? '查看個案' : 'View resident'}
          </button>
          <button type="button" className="ghost-button" onClick={onPreviewSos}>
            {t(locale, 'hero.cta')}
          </button>
        </div>
      </section>
    </aside>
  )
}