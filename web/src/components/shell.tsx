import type { ReactNode } from 'react'
import { t, type Locale } from '../i18n'
import type { Role, View } from '../domain'

const NAV_ITEMS: Array<{ id: View; glyph: string; labelKey: string }> = [
  { id: 'overview', glyph: '◐', labelKey: 'nav.overview' },
  { id: 'residents', glyph: '○', labelKey: 'nav.residents' },
  { id: 'schedule', glyph: '▤', labelKey: 'nav.schedule' },
  { id: 'journal', glyph: '≡', labelKey: 'nav.journal' },
  { id: 'medications', glyph: '◌', labelKey: 'nav.medications' },
  { id: 'family', glyph: '♡', labelKey: 'nav.family' },
  { id: 'reports', glyph: '↗', labelKey: 'nav.reports' },
]

const SYSTEM_ITEMS: Array<{ glyph: string; labelKey: string }> = [
  { glyph: '?', labelKey: 'rail.help' },
  { glyph: '⚙', labelKey: 'rail.settings' },
]

interface SidebarProps {
  active: View
  role: Role
  locale: Locale
  unread: number
  onSelect: (view: View) => void
  onWorkspaceClick: () => void
}

export function Sidebar({ active, role, locale, unread, onSelect, onWorkspaceClick }: SidebarProps): ReactNode {
  const roleKey = `role.${role}` as const
  return (
    <aside className="rail" aria-label="Primary navigation">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">C</div>
        <div>
          <strong>長照安心管家</strong>
          <small>careboard / M1</small>
        </div>
      </div>
      <button className="org-switch" type="button" aria-label="Switch workspace" onClick={onWorkspaceClick}>
        <span className="org-mark" aria-hidden="true">CL</span>
        <span className="org-meta">
          <strong>Careline Taipei</strong>
          <small>{t(locale, 'workspace.tagline')}</small>
        </span>
        <span className="chev" aria-hidden="true">⌄</span>
      </button>
      <div className="rail-label">{t(locale, 'rail.workspace')}</div>
      <nav className="nav" aria-label="Workspace views">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            data-view={item.id}
            className={active === item.id ? 'active' : ''}
            aria-current={active === item.id ? 'page' : undefined}
            onClick={() => onSelect(item.id)}
          >
            <span className="glyph" aria-hidden="true">{item.glyph}</span>
            <span>{t(locale, item.labelKey)}</span>
            {item.id === 'family' && unread > 0 ? <span className="nav-count" aria-label={`${unread} unread`}>{unread}</span> : null}
          </button>
        ))}
      </nav>
      <div className="rail-divider" aria-hidden="true" />
      <div className="rail-label">{t(locale, 'rail.system')}</div>
      <nav className="nav" aria-label="System">
        {SYSTEM_ITEMS.map((item) => (
          <button key={item.labelKey} type="button" data-system={item.labelKey}>
            <span className="glyph" aria-hidden="true">{item.glyph}</span>
            <span>{t(locale, item.labelKey)}</span>
          </button>
        ))}
      </nav>
      <div className="rail-status" aria-live="polite">
        <div className="status-top">
          <span><i className="env-dot" aria-hidden="true" />{t(locale, 'rail.environment')}</span>
          <span id="rail-env-badge">{t(locale, 'rail.envBadge')}</span>
        </div>
        <strong>{t(locale, 'rail.envTitle')}</strong>
        <p>{t(locale, 'rail.envCopy')}</p>
        <small style={{ display: 'block', marginTop: 10, color: 'var(--muted-dark)', fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 800 }}>
          {roleKey.replace('role.', 'rail.role_')}{t(locale, roleKey)}
        </small>
      </div>
    </aside>
  )
}

interface TopbarProps {
  active: View
  role: Role
  locale: Locale
  syncHeadline: string
  syncTime: string
  onLocaleChange: (locale: Locale) => void
  onRoleChange: (role: Role) => void
  onAvatar: () => void
  onRefreshSync: () => void
}

export function Topbar({ active, role, locale, syncHeadline, syncTime, onLocaleChange, onRoleChange, onAvatar, onRefreshSync }: TopbarProps): ReactNode {
  return (
    <header className="topbar">
      <div className="crumbs">
        <strong>{t(locale, 'workspace.name')}</strong>
        <span className="sep" aria-hidden="true">/</span>
        <span>{t(locale, `crumbs.${active}`)}</span>
        <span className="tz-pill" aria-label="Workspace timezone">
          <i aria-hidden="true" />
          <span>{t(locale, 'tz')}</span>
        </span>
      </div>
      <div className="command-bar">
        <span className="sync-state" role="status" aria-live="polite">
          <i aria-hidden="true" />
          <span className="meta">
            <strong>{syncHeadline}</strong>
            <small>{syncTime}</small>
          </span>
        </span>
        <select className="locale-select" aria-label="Language" value={locale} onChange={(event) => onLocaleChange(event.target.value as Locale)}>
          <option value="zh-Hant">繁中</option>
          <option value="en">EN</option>
        </select>
        <select className="role-select" aria-label="Role view" value={role} onChange={(event) => onRoleChange(event.target.value as Role)}>
          <option value="manager">{t(locale, 'role.manager')}</option>
          <option value="caregiver">{t(locale, 'role.caregiver')}</option>
          <option value="family">{t(locale, 'role.family')}</option>
        </select>
        <button className="icon-button" type="button" aria-label="Refresh sync" onClick={onRefreshSync}>↻</button>
        <span className="avatar-frame" title="Sean Li">
          <button className="avatar" type="button" onClick={onAvatar} aria-label="Open profile menu">SL</button>
        </span>
      </div>
    </header>
  )
}

interface MobileNavProps {
  active: View
  locale: Locale
  onSelect: (view: View) => void
  onSos: () => void
}

export function MobileNav({ active, locale, onSelect, onSos }: MobileNavProps): ReactNode {
  const mobileItems: Array<{ id: View; glyph: string; labelKey: string }> = [
    { id: 'overview', glyph: '◐', labelKey: 'mobileNav.overview' },
    { id: 'residents', glyph: '○', labelKey: 'mobileNav.residents' },
    { id: 'schedule', glyph: '▤', labelKey: 'mobileNav.schedule' },
    { id: 'family', glyph: '♡', labelKey: 'mobileNav.family' },
  ]
  return (
    <>
      <button className="mobile-sos" type="button" aria-label="Open SOS preview" onClick={onSos}>SOS</button>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {mobileItems.map((item) => (
          <button
            key={item.id}
            type="button"
            data-view={item.id}
            className={active === item.id ? 'active' : ''}
            aria-current={active === item.id ? 'page' : undefined}
            onClick={() => onSelect(item.id)}
          >
            <span className="glyph" aria-hidden="true">{item.glyph}</span>
            <span>{t(locale, item.labelKey)}</span>
          </button>
        ))}
      </nav>
    </>
  )
}

interface ToastStackProps {
  messages: string[]
}

export function ToastStack({ messages }: ToastStackProps): ReactNode {
  if (messages.length === 0) return null
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {messages.map((message, index) => (
        <div className="toast" key={`${index}-${message}`}>{message}</div>
      ))}
    </div>
  )
}

interface PrototypeNoteProps {
  locale: Locale
}

export function PrototypeNote({ locale }: PrototypeNoteProps): ReactNode {
  return (
    <div className="prototype-note">
      <strong>{t(locale, 'note.title')}</strong>
      <span>{t(locale, 'note.copy')}</span>
    </div>
  )
}