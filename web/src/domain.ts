export type Role = 'caregiver' | 'family' | 'manager'
export type View = 'overview' | 'residents' | 'schedule' | 'journal' | 'medications' | 'notifications' | 'reports'
export type StatusTone = 'healthy' | 'attention' | 'action' | 'emergency'

export type Resident = {
  id: string
  name: string
  romanizedName: string
  initials: string
  age: number
  careLevel: string
  city: string
  status: StatusTone
  address: string
  emergencyName: string
  emergencyPhone: string
  familyCount: number
  nextReview: string
}

export type CareEvent = {
  id: string
  residentId: string
  type: 'visit' | 'note' | 'vital' | 'family'
  label: string
  detail: string
  recordedBy: string
  time: string
  status: StatusTone
  source: 'local-only' | 'mock-sync'
}

export type Shift = {
  id: string
  residentId: string
  caregiver: string
  date: string
  start: string
  end: string
  status: 'confirmed' | 'pending' | 'conflict'
}

export type Medication = {
  id: string
  residentId: string
  name: string
  dose: string
  time: string
  taken: boolean
}

export type NotificationItem = {
  id: string
  residentId: string
  title: string
  detail: string
  time: string
  read: boolean
  tone: StatusTone
}

export const roleLabels: Record<Role, string> = {
  caregiver: '照服員',
  family: '家屬',
  manager: '個案管理師',
}

export const viewLabels: Record<View, string> = {
  overview: '今日工作台',
  residents: '個案資料',
  schedule: '排班週視圖',
  journal: '照護日誌',
  medications: '用藥追蹤',
  notifications: '通知中心',
  reports: '報表與安全',
}

export const statusLabels: Record<StatusTone, string> = {
  healthy: '穩定',
  attention: '需留意',
  action: '待處理',
  emergency: '緊急預覽',
}

export const seedResidents: Resident[] = [
  {
    id: 'r-001',
    name: '林秀琴',
    romanizedName: 'Lin Hsiu-Chin',
    initials: '林',
    age: 78,
    careLevel: '照護 3 級',
    city: '台北市 · 大安區',
    status: 'attention',
    address: '台北市大安區和平東路一段 18 號',
    emergencyName: '林志遠（長子）',
    emergencyPhone: '09•• •• 8421',
    familyCount: 3,
    nextReview: '2026-09-29',
  },
  {
    id: 'r-002',
    name: '陳明德',
    romanizedName: 'Chen Ming-Te',
    initials: '陳',
    age: 82,
    careLevel: '照護 2 級',
    city: '新北市 · 永和區',
    status: 'healthy',
    address: '新北市永和區仁愛路 106 號',
    emergencyName: '陳怡君（女兒）',
    emergencyPhone: '09•• •• 1190',
    familyCount: 2,
    nextReview: '2026-10-03',
  },
  {
    id: 'r-003',
    name: '王淑芬',
    romanizedName: 'Wang Shu-Fen',
    initials: '王',
    age: 74,
    careLevel: '照護 4 級',
    city: '台北市 · 士林區',
    status: 'action',
    address: '台北市士林區中山北路五段 90 號',
    emergencyName: '王柏凱（兒子）',
    emergencyPhone: '09•• •• 3072',
    familyCount: 4,
    nextReview: '2026-09-27',
  },
]

export const seedEvents: CareEvent[] = [
  { id: 'e-001', residentId: 'r-001', type: 'visit', label: '到府服務完成', detail: '陪同伸展與早餐準備，情緒穩定。', recordedBy: '許雅雯 · 照服員', time: '今天 09:10', status: 'healthy', source: 'local-only' },
  { id: 'e-002', residentId: 'r-001', type: 'vital', label: '生命徵象已記錄', detail: '體溫 36.5°C · 血壓 128 / 78（mock）', recordedBy: '許雅雯 · 照服員', time: '今天 09:24', status: 'healthy', source: 'local-only' },
  { id: 'e-003', residentId: 'r-001', type: 'family', label: '家屬訊息待回覆', detail: '林志遠詢問下次陪診時間。', recordedBy: '家屬入口', time: '今天 10:42', status: 'action', source: 'mock-sync' },
  { id: 'e-004', residentId: 'r-003', type: 'note', label: '服務備註需確認', detail: '週四時段與另一項服務重疊，請個管師確認。', recordedBy: '系統規則', time: '昨天 16:20', status: 'attention', source: 'local-only' },
]

export const seedShifts: Shift[] = [
  { id: 's-001', residentId: 'r-001', caregiver: '許雅雯', date: '2026-09-24', start: '09:00', end: '11:00', status: 'confirmed' },
  { id: 's-002', residentId: 'r-002', caregiver: '許雅雯', date: '2026-09-24', start: '13:00', end: '15:00', status: 'confirmed' },
  { id: 's-003', residentId: 'r-003', caregiver: '張家豪', date: '2026-09-25', start: '10:00', end: '12:00', status: 'pending' },
  { id: 's-004', residentId: 'r-003', caregiver: '張家豪', date: '2026-09-25', start: '11:30', end: '13:00', status: 'conflict' },
]

export const seedMedications: Medication[] = [
  { id: 'm-001', residentId: 'r-001', name: '早餐後例行藥（mock）', dose: '1 顆', time: '08:30', taken: true },
  { id: 'm-002', residentId: 'r-001', name: '晚餐後例行藥（mock）', dose: '1 顆', time: '18:30', taken: false },
  { id: 'm-003', residentId: 'r-003', name: '睡前例行藥（mock）', dose: '半顆', time: '21:00', taken: false },
]

export const seedNotifications: NotificationItem[] = [
  { id: 'n-001', residentId: 'r-001', title: '家屬訊息待回覆', detail: '林志遠詢問下次陪診時間。', time: '10 分鐘前', read: false, tone: 'action' },
  { id: 'n-002', residentId: 'r-003', title: '排班衝突已標記', detail: '週五 11:30–13:00 需要人工確認。', time: '昨天', read: false, tone: 'attention' },
  { id: 'n-003', residentId: 'r-002', title: '今日服務已同步', detail: '本地 mock timeline 已更新。', time: '昨天', read: true, tone: 'healthy' },
]

export function filterResidents(residents: Resident[], query: string): Resident[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return residents
  return residents.filter((resident) => `${resident.name} ${resident.romanizedName} ${resident.city}`.toLowerCase().includes(normalized))
}

export function findShiftConflicts(shifts: Shift[]): string[] {
  const conflicts = new Set<string>()
  for (let i = 0; i < shifts.length; i += 1) {
    for (let j = i + 1; j < shifts.length; j += 1) {
      const first = shifts[i]
      const second = shifts[j]
      if (first.caregiver !== second.caregiver || first.date !== second.date) continue
      if (first.start < second.end && second.start < first.end) {
        conflicts.add(first.id)
        conflicts.add(second.id)
      }
    }
  }
  return [...conflicts]
}

export function calculateHours(shifts: Shift[]): number {
  return shifts.reduce((total, shift) => {
    const [startHour, startMinute] = shift.start.split(':').map(Number)
    const [endHour, endMinute] = shift.end.split(':').map(Number)
    return total + (endHour * 60 + endMinute - startHour * 60 - startMinute) / 60
  }, 0)
}

export function maskSensitive(value: string, visible: boolean): string {
  return visible ? value : '••••••••'
}
