import { expect, test, type Page } from '@playwright/test'

// M1 mock-only browser-level smoke gate (AC-005).
// Determinism: clear storage before each test, fixed viewport, fixed
// timezone (Asia/Taipei), fail on console error / page error.
// Network safety: the Playwright webServer only serves the local Vite
// preview, and the mock-only shell never opens outbound URLs in any
// interactive flow. Each test asserts no console / page errors.

const externalRequestsByPage = new WeakMap<Page, string[]>()

test.beforeEach(async ({ context }) => {
  await context.clearCookies()
  await context.addInitScript(() => {
    try { window.localStorage.clear() } catch { /* ignore */ }
  })
})

test.afterEach(async ({ page }) => {
  const externalRequests = externalRequestsByPage.get(page) ?? []
  expect(externalRequests, externalRequests.join('\n')).toEqual([])
})

function attachGuards(page: Page): { errors: string[]; pageErrors: Error[] } {
  const errors: string[] = []
  const pageErrors: Error[] = []
  const externalRequests: string[] = []
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
  page.on('pageerror', (e) => pageErrors.push(e))
  page.on('request', (req) => {
    const url = req.url()
    if (url.startsWith('http://127.0.0.1:4173') || url.startsWith('data:') || url.startsWith('about:')) return
    externalRequests.push(url)
  })
  externalRequestsByPage.set(page, externalRequests)
  return { errors, pageErrors }
}

test('role switching updates the visible workspace role', async ({ page }) => {
  const { errors, pageErrors } = attachGuards(page)
  await page.goto('/')

  const roleSelect = page.getByLabel('Role view')
  await expect(roleSelect).toHaveValue('manager')

  await roleSelect.selectOption('caregiver')
  await expect(roleSelect).toHaveValue('caregiver')

  await roleSelect.selectOption('family')
  await expect(roleSelect).toHaveValue('family')

  expect(pageErrors).toEqual([])
  expect(errors).toEqual([])
})

test('resident search filters the list, selection opens detail, default mask + reveal toggles sensitive fields', async ({ page }) => {
  const { errors, pageErrors } = attachGuards(page)
  await page.goto('/')

  await page.locator('.rail button[data-view="residents"]').click()
  await expect(page.locator('.split-view')).toBeVisible()

  const search = page.locator('.search-field input')
  await search.fill('Hsiu')
  await expect(page.locator('.resident-list-item')).toHaveCount(1)
  await expect(page.locator('.resident-list-item').first()).toContainText(/林秀琴|Lin Hsiu-Chin/)

  await search.fill('nothing-matches')
  await expect(page.locator('.resident-list-item')).toHaveCount(0)

  await search.fill('')
  await expect(page.locator('.resident-list-item').filter({ hasText: /陳明德|Chen Ming-Te/ })).toBeVisible()
  await page.locator('.resident-list-item').filter({ hasText: /陳明德|Chen Ming-Te/ }).click()

  // Default sensitive masking: the phone is redacted to bullets.
  await expect(page.locator('.detail-panel').getByText('•••• •• 1190')).toBeVisible()
  // Masked fields never expose the original emergency phone digits.
  await expect(page.locator('.detail-panel').getByText('0987', { exact: true })).toHaveCount(0)

  // Reveal: the original masked seed "09•• •• 1190" is shown verbatim,
  // and the emergency contact name becomes visible.
  await page.locator('.detail-panel').getByRole('button', { name: /顯示遮罩欄位|Reveal sensitive/i }).click()
  await expect(page.locator('.detail-panel').getByText('09•• •• 1190')).toBeVisible()
  await expect(page.locator('.detail-panel').getByText('陳怡君（女兒）')).toBeVisible()

  // Mask again.
  await page.locator('.detail-panel').getByRole('button', { name: /隱藏敏感欄位|Mask sensitive/i }).click()
  await expect(page.locator('.detail-panel').getByText('•••• •• 1190')).toBeVisible()

  expect(pageErrors).toEqual([])
  expect(errors).toEqual([])
})

test('journal CRUD adds a local-only entry that appears at the top with its source visible', async ({ page }) => {
  const { errors, pageErrors } = attachGuards(page)
  await page.goto('/')

  await page.locator('.rail button[data-view="journal"]').click()
  await expect(page.locator('.journal-list')).toBeVisible()

  const beforeCount = await page.locator('.journal-row').count()
  await page.locator('.heading-actions button.primary-button').first().click()
  const afterCount = await page.locator('.journal-row').count()
  expect(afterCount).toBe(beforeCount + 1)

  const newest = page.locator('.journal-row').first()
  await expect(newest).toContainText(/新增照護備註|New local note/)
  await expect(newest.locator('.source-tag').filter({ hasText: /local-only|本機/ })).toBeVisible()

  expect(pageErrors).toEqual([])
  expect(errors).toEqual([])
})

test('schedule conflict is visible for the seeded overlapping shifts', async ({ page }) => {
  const { errors, pageErrors } = attachGuards(page)
  await page.goto('/')

  await page.locator('.rail button[data-view="schedule"]').click()
  await expect(page.locator('.schedule-board')).toBeVisible()

  // Deterministic seed shifts s-003 (10:00–12:00) and s-004 (11:30–13:00)
  // overlap for caregiver 張家豪 on 2026-09-25 → Friday column shows 2
  // conflict cards.
  const conflictCards = page.locator('.shift-card.conflict')
  expect(await conflictCards.count()).toBeGreaterThanOrEqual(2)
  await expect(page.locator('.schedule-board')).toContainText('張家豪')
  await expect(page.locator('.conflict-pill')).toContainText(/conflict|衝突/i)

  expect(pageErrors).toEqual([])
  expect(errors).toEqual([])
})

test('SOS preview opens, records locally, and never sends an external request', async ({ page }) => {
  const { errors, pageErrors } = attachGuards(page)
  await page.goto('/')

  // The desktop primary SOS button is always present.
  await page.locator('#sos-button-main').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText(/SOS|Emergency|緊急/)

  // Track requests fired after the SOS dialog opens. The mock-only
  // shell must not initiate any new outbound URL during the SOS flow.
  const externalAfterSos: string[] = []
  const onRequest = (req: import('@playwright/test').Request): void => {
    const url = req.url()
    if (url.startsWith('http://127.0.0.1:4173') || url.startsWith('data:') || url.startsWith('about:')) return
    externalAfterSos.push(url)
  }
  page.on('request', onRequest)

  // Confirm preview-only flow.
  await dialog.getByRole('button', { name: /建立 mock 事件|Create mock event/i }).click()
  await expect(dialog).toBeHidden()
  expect(externalAfterSos, externalAfterSos.join('\n')).toEqual([])

  expect(pageErrors).toEqual([])
  expect(errors).toEqual([])
})
