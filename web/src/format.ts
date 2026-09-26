// Intl-based formatters that mirror the helpers in the approved ui-prototype.html.
// They always read from the workspace timezone so the React build never renders
// host-machine time, which keeps the mock data deterministic in tests.

import type { Locale } from './i18n'
import { dictsForLocale } from './i18n'

export const WORKSPACE_TZ = 'Asia/Taipei'

export const dateKeys = (_locale: Locale, iso: string): { isToday: boolean; date: string } => {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: WORKSPACE_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const todayKey = fmt.format(new Date())
  const key = iso.slice(0, 10)
  return { isToday: key === todayKey, date: key }
}

export const tzNowParts = (): { date: string; time: string } => {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: WORKSPACE_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = fmt.formatToParts(new Date())
  const map: Record<string, string> = {}
  for (const part of parts) {
    if (part.type === 'year' || part.type === 'month' || part.type === 'day' || part.type === 'hour' || part.type === 'minute') {
      map[part.type] = part.value
    }
  }
  return { date: `${map.year}-${map.month}-${map.day}`, time: `${map.hour}:${map.minute}` }
}

export const formatTime = (locale: Locale, iso: string): string =>
  new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: dictsForLocale(locale).hour12 as boolean,
    timeZone: WORKSPACE_TZ,
  }).format(new Date(iso))

export const formatDate = (locale: Locale, iso: string): string =>
  new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', timeZone: WORKSPACE_TZ }).format(new Date(iso))

export const formatDateTime = (locale: Locale, iso: string): string => {
  const dict = dictsForLocale(locale)
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: dict.hour12 as boolean,
    timeZone: WORKSPACE_TZ,
  }).format(new Date(iso))
}

export const formatCount = (locale: Locale, value: number): string =>
  new Intl.NumberFormat(locale).format(value)

export const formatPct = (locale: Locale, value: number): string =>
  new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(value / 100)

export const formatHours = (_locale: Locale, hours: number): string => {
  const safeHours = Math.max(0, Math.round(hours * 100) / 100)
  const whole = Math.floor(safeHours)
  const minutes = Math.round((safeHours - whole) * 60)
  return `${whole}:${String(minutes).padStart(2, '0')}`
}

export const formatRelative = (locale: Locale, iso: string, nowIso?: string): string => {
  const now = nowIso ? new Date(nowIso) : new Date()
  const target = new Date(iso)
  const diffMs = target.getTime() - now.getTime()
  const diffMin = Math.round(diffMs / 60000)
  const dict = dictsForLocale(locale)
  const label = (key: string, vars?: Record<string, string | number>) => {
    const value = dict[key]
    if (typeof value !== 'string') return key
    if (!vars) return value
    return value.replace(/\{\{(\w+)\}\}/g, (_, k: string) => (vars[k] != null ? String(vars[k]) : ''))
  }
  if (Math.abs(diffMin) < 1) return locale === 'zh-Hant' ? '即將開始' : 'Now'
  if (diffMin > 0) return label('dock.next.when', { n: String(diffMin) })
  return locale === 'zh-Hant' ? `已過 ${Math.abs(diffMin)} 分鐘` : `${Math.abs(diffMin)} min ago`
}

export const localeName = (locale: Locale): string => dictsForLocale(locale).locale as string

export const escapeHtml = (input: string): string =>
  String(input).replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&': return '&amp;'
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '"': return '&quot;'
      case "'": return '&#39;'
      default: return c
    }
  })