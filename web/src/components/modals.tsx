import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import type { Resident } from '../domain'
import { emptyResident, shapeResidentFromDraft } from '../domain'
import { listCareLevels, t, type Locale } from '../i18n'

interface ResidentModalProps {
  open: boolean
  draft: Resident
  editingId?: string
  locale: Locale
  onChange: (next: Resident) => void
  onClose: () => void
  onSubmit: (resident: Resident) => void
  onToast: (message: string) => void
}

export function ResidentModal({
  open,
  draft,
  editingId,
  locale,
  onChange,
  onClose,
  onSubmit,
  onToast,
}: ResidentModalProps): ReactNode {
  const [internal, setInternal] = useState<Resident>(editingId ? draft : emptyResident())

  useEffect(() => {
    if (open) {
      setInternal(editingId ? draft : emptyResident())
    }
  }, [open, draft, editingId])

  if (!open) return null

  const careLevels = listCareLevels(locale)

  const update = (patch: Partial<Resident>): void => {
    setInternal((current) => ({ ...current, ...patch }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (!internal.names.full[locale]?.trim() || !internal.emergencyName.trim()) {
      onToast(t(locale, 'residentModal.requiredHint'))
      return
    }
    const id = editingId ?? `r-mock-${Date.now()}`
    const next = shapeResidentFromDraft(internal, id)
    onSubmit(next)
  }

  return (
    <div className="modal-backdrop open" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="resident-modal-title">
        <header className="modal-head">
          <span className="eyebrow" style={{ color: 'var(--muted-light)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 900 }}>
            {t(locale, 'residentModal.titleEyebrow')}
          </span>
          <h2 id="resident-modal-title">{editingId ? t(locale, 'residentModal.editTitle') : t(locale, 'residentModal.addTitle')}</h2>
          <p>{t(locale, 'residentsView.mockCalloutBody')}</p>
        </header>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              {t(locale, 'residentModal.name')}
              <input
                value={internal.names.full[locale]}
                onChange={(event) => onChangeForLocale(internal, locale, event.target.value, (next) => {
                  setInternal(next); onChange(next)
                })}
                placeholder={t(locale, 'residentModal.namePlaceholder')}
                autoFocus
              />
            </label>
            <label>
              {t(locale, 'residentModal.romanized')}
              <input
                value={internal.names.full.en}
                onChange={(event) => {
                  const next = { ...internal, names: { ...internal.names, full: { ...internal.names.full, en: event.target.value } } }
                  setInternal(next); onChange(next)
                }}
                placeholder={t(locale, 'residentModal.romanizedPlaceholder')}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              {t(locale, 'residentModal.age')}
              <input
                type="number"
                min={0}
                value={internal.age}
                onChange={(event) => update({ age: Math.max(0, Number(event.target.value) || 0) })}
              />
            </label>
            <label>
              {t(locale, 'residentModal.careLevel')}
              <select
                value={internal.carePlan[locale]}
                onChange={(event) => update({ carePlan: { 'zh-Hant': locale === 'zh-Hant' ? event.target.value : internal.carePlan['zh-Hant'], en: locale === 'en' ? event.target.value : internal.carePlan.en } })}
              >
                {careLevels.map((level: string) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            {t(locale, 'residentModal.address')}
            <input
              value={internal.address}
              onChange={(event) => update({ address: event.target.value })}
              placeholder={t(locale, 'residentModal.addressPlaceholder')}
            />
          </label>
          <div className="form-row">
            <label>
              {t(locale, 'residentModal.emergencyName')}
              <input
                value={internal.emergencyName}
                onChange={(event) => update({ emergencyName: event.target.value })}
                placeholder={t(locale, 'residentModal.emergencyPlaceholder')}
              />
            </label>
            <label>
              {t(locale, 'residentsView.fields.emergencyPhone')}
              <input
                value={internal.emergencyPhone}
                onChange={(event) => update({ emergencyPhone: event.target.value })}
                placeholder={t(locale, 'residentModal.emergencyPlaceholder')}
              />
            </label>
          </div>
          <div className="callout">
            <strong>{t(locale, 'residentsView.mockCalloutTitle')}</strong>
            <span>{t(locale, 'residentsView.mockCalloutBody')}</span>
          </div>
        </form>
        <footer className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>{t(locale, 'residentModal.cancel')}</button>
          <button type="button" className="primary-button" onClick={() => handleSubmit({ preventDefault: () => undefined } as FormEvent<HTMLFormElement>)}>
            {t(locale, 'residentModal.submit')}
          </button>
        </footer>
      </section>
    </div>
  )
}

const onChangeForLocale = (
  internal: Resident,
  locale: Locale,
  value: string,
  apply: (next: Resident) => void,
): void => {
  if (locale === 'zh-Hant') {
    const next = { ...internal, names: { ...internal.names, full: { ...internal.names.full, 'zh-Hant': value } } }
    apply(next)
  } else {
    const next = { ...internal, names: { ...internal.names, full: { ...internal.names.full, en: value } } }
    apply(next)
  }
}

interface SosModalProps {
  open: boolean
  locale: Locale
  stepsLabel: string
  steps: Array<{ id: string; actor: string; label: { 'zh-Hant': string; en: string }; detail: { 'zh-Hant': string; en: string } }>
  onClose: () => void
  onConfirm: () => void
}

export function SosModal({ open, locale, stepsLabel, steps, onClose, onConfirm }: SosModalProps): ReactNode {
  useEffect(() => {
    if (!open) return
    const handler = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-backdrop open" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="sos-modal-title">
        <header className="modal-head">
          <span className="eyebrow" style={{ color: 'var(--accent-strong)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 900 }}>
            {t(locale, 'sos.titleEyebrow')}
          </span>
          <h2 id="sos-modal-title">{t(locale, 'sos.title')}</h2>
          <p>{t(locale, 'sos.copy')}</p>
        </header>
        <div className="modal-chain">
          <strong style={{ marginBottom: 4 }}>{t(locale, 'sos.chainTitle')}</strong>
          <span className="modal-chain-order">{t(locale, 'sos.chainOrder')}</span>
          <small style={{ marginTop: 8 }}>{stepsLabel}</small>
          {steps.map((step, index) => (
            <div className="modal-chain-row" key={step.id}>
              <span className="modal-chain-step">{index + 1}</span>
              <div>
                <strong>{step.label[locale]}</strong>
                <small>{step.detail[locale]}</small>
              </div>
              <span aria-hidden style={{ color: 'var(--muted-light)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase' }}>
                {step.actor}
              </span>
            </div>
          ))}
        </div>
        <footer className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>{t(locale, 'sos.back')}</button>
          <button type="button" className="primary-button" onClick={onConfirm}>{t(locale, 'sos.confirm')} →</button>
        </footer>
      </section>
    </div>
  )
}