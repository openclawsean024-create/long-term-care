import type { ReactNode } from 'react'
import type { StatusTone } from '../domain'
import { statusLabels } from '../domain'
import type { Locale } from '../i18n'

interface StatusPillProps {
  tone: StatusTone
  locale: Locale
}

export function StatusPill({ tone, locale }: StatusPillProps): ReactNode {
  return <span className={`state-pill ${tone}`}>{statusLabels[tone][locale]}</span>
}

interface StatusTagProps {
  tone: StatusTone
  children: ReactNode
}

export function StatusTag({ tone, children }: StatusTagProps): ReactNode {
  return <span className={`tag ${tone}`}>{children}</span>
}

interface EmptyStateProps {
  text: string
}

export function EmptyState({ text }: EmptyStateProps): ReactNode {
  return <div className="timeline-empty">{text}</div>
}