// Mock-only data + domain helpers for the Careboard shell.
// All names, addresses, and numbers are fictional; nothing here touches a real
// service, person, calendar, or notification. Anything you see in the running
// app either comes from these seeds or was written by the user into localStorage
// through the local-only mock CRUD flows.

export type Locale = 'zh-Hant' | 'en'

export type Role = 'manager' | 'caregiver' | 'family'

export type View =
  | 'overview'
  | 'residents'
  | 'schedule'
  | 'journal'
  | 'medications'
  | 'family'
  | 'reports'

export type StatusTone = 'healthy' | 'attention' | 'action' | 'emergency'

export type EventType = 'service' | 'vital' | 'family' | 'alert' | 'note'

export type EventConfidence = 'verified' | 'pending'

export type EventSource = 'mobile-app' | 'family-app' | 'sensor' | 'local-only' | 'mock-sync'

export type NextStatus = 'onTime' | 'running' | 'confirmed' | 'starting'

export type ShiftStatus = 'confirmed' | 'pending' | 'conflict' | 'running'

export type PortraitTone = 'amber' | 'lavender' | 'green' | 'blue' | 'peach' | 'gray'

export type SosActor = 'caregiver' | 'family' | 'manager' | 'system'

export interface LocalizedText {
  'zh-Hant': string
  en: string
}

export interface FamilyMember {
  initials: string
  names: LocalizedText
  role: LocalizedText
}

export interface CaregiverPerson {
  initials: string
  names: LocalizedText
  role: LocalizedText
}

export interface NextSlot {
  iso: string
  durationMin: number
  status: NextStatus
  focus: LocalizedText
  window: LocalizedText
}

export interface ResidentNeed {
  status: StatusTone
  icon: 'vital' | 'family' | 'alert'
  title: LocalizedText
  meta: LocalizedText
}

export interface CareEvent {
  id: string
  residentId: string
  iso: string
  type: EventType
  status: StatusTone
  title: LocalizedText
  copy: LocalizedText
  tag: EventType
  recordedBy: CaregiverPerson | FamilyMember | { initials: string; names: LocalizedText; role: LocalizedText }
  source: EventSource
  confidence: EventConfidence
  action: string
}

export interface ResidentStrip {
  visits: number
  signals: number
  messages: number
}

export interface Resident {
  id: string
  initials: LocalizedText
  portraitTone: PortraitTone
  status: StatusTone
  names: { full: LocalizedText; given: LocalizedText; short: LocalizedText }
  age: number
  carePlan: LocalizedText
  timezone: string
  family: FamilyMember[]
  caregiver: CaregiverPerson
  next: NextSlot
  nextReview: LocalizedText
  queue: { title: LocalizedText; meta: LocalizedText }
  networkLabel: LocalizedText
  strip: ResidentStrip
  needs: ResidentNeed[]
  timeline: CareEvent[]
  city: string
  emergencyName: string
  emergencyPhone: string
  address: string
  familyCount: number
}

export interface Shift {
  id: string
  residentId: string
  caregiver: string
  date: string
  start: string
  end: string
  status: ShiftStatus
  note?: string
}

export interface Medication {
  id: string
  residentId: string
  name: LocalizedText
  dose: LocalizedText
  time: string
  taken: boolean
}

export interface NotificationItem {
  id: string
  residentId: string
  title: LocalizedText
  detail: LocalizedText
  time: LocalizedText
  read: boolean
}

export interface SosStep {
  id: string
  actor: SosActor
  label: LocalizedText
  detail: LocalizedText
}

export interface SosPreviewEvent {
  id: string
  residentId: string
  recordedAtIso: string
  steps: SosStep[]
}

const actorCaregiver: CaregiverPerson = {
  initials: 'YW',
  names: { 'zh-Hant': '王怡文', en: 'Yi-Wen Wang' },
  role: { 'zh-Hant': '照服員', en: 'Caregiver' },
}

const actorCaregiverB: CaregiverPerson = {
  initials: 'YJ',
  names: { 'zh-Hant': '陳怡君', en: 'Yi-Chun Chen' },
  role: { 'zh-Hant': '照服員', en: 'Caregiver' },
}

const actorCaregiverC: CaregiverPerson = {
  initials: 'LH',
  names: { 'zh-Hant': '林慧珍', en: 'Hui-Chen Lin' },
  role: { 'zh-Hant': '照服員', en: 'Caregiver' },
}

const actorCaregiverD: CaregiverPerson = {
  initials: 'CT',
  names: { 'zh-Hant': '蔡婷婷', en: 'Ting-Ting Tsai' },
  role: { 'zh-Hant': '照服員', en: 'Caregiver' },
}

const actorFamilyLin: FamilyMember = {
  initials: 'YL',
  names: { 'zh-Hant': '林怡君', en: 'Yi-Chun Lin' },
  role: { 'zh-Hant': '女兒', en: 'Daughter' },
}

const actorFamilyChen: FamilyMember = {
  initials: 'CH',
  names: { 'zh-Hant': '陳志豪', en: 'Chih-Hao Chen' },
  role: { 'zh-Hant': '兒子', en: 'Son' },
}

const actorFamilyHuang: FamilyMember = {
  initials: 'YW',
  names: { 'zh-Hant': '黃郁雯', en: 'Yu-Wen Huang' },
  role: { 'zh-Hant': '女兒', en: 'Daughter' },
}

const actorFamilyWu: FamilyMember = {
  initials: 'SL',
  names: { 'zh-Hant': '吳秀蘭', en: 'Hsiu-Lan Wu' },
  role: { 'zh-Hant': '太太', en: 'Spouse' },
}

const RECORDER_SYSTEM = {
  initials: 'SY',
  names: { 'zh-Hant': '個案管理師', en: 'Case manager' },
  role: { 'zh-Hant': '個案管理師', en: 'Case manager' },
}

export const seedResidents: Resident[] = [
  {
    id: 'lin',
    initials: { 'zh-Hant': '林', en: 'LX' },
    portraitTone: 'amber',
    status: 'attention',
    names: {
      full: { 'zh-Hant': '林秀琴', en: 'Lin Hsiu-Chin' },
      given: { 'zh-Hant': '秀琴', en: 'Hsiu-Chin' },
      short: { 'zh-Hant': '秀琴', en: 'Hsiu-Chin' },
    },
    age: 78,
    carePlan: { 'zh-Hant': '居家照護 A 級', en: 'Home care · tier A' },
    timezone: 'Asia/Taipei',
    family: [actorFamilyLin],
    caregiver: actorCaregiver,
    next: {
      iso: '2026-09-24T09:30:00+08:00',
      durationMin: 90,
      status: 'onTime',
      focus: { 'zh-Hant': '用藥協助 + 早餐陪伴', en: 'Medication + breakfast support' },
      window: { 'zh-Hant': '09:30 — 11:00', en: '09:30 — 11:00' },
    },
    nextReview: { 'zh-Hant': '今日 16:00', en: 'Today · 16:00' },
    queue: {
      title: { 'zh-Hant': '林秀琴 · family reply', en: 'Lin Hsiu-Chin · family reply' },
      meta: { 'zh-Hant': '訊息來自 林怡君 · 昨日', en: 'Message from Yi-Chun Lin · yesterday' },
    },
    networkLabel: { 'zh-Hant': '服務進度穩定', en: 'Service on track' },
    strip: { visits: 3, signals: 1, messages: 2 },
    needs: [
      {
        status: 'attention',
        icon: 'family',
        title: { 'zh-Hant': '林秀琴 · family reply', en: 'Lin Hsiu-Chin · family reply' },
        meta: { 'zh-Hant': '昨日 20:42 · 1 則待回覆', en: 'Yesterday 20:42 · 1 message waiting' },
      },
    ],
    timeline: [
      {
        id: 'lin-1',
        residentId: 'lin',
        iso: '2026-09-24T08:42:00+08:00',
        type: 'vital',
        status: 'healthy',
        title: { 'zh-Hant': '早晨量測已完成', en: 'Morning vitals recorded' },
        copy: {
          'zh-Hant': '血壓 128 / 76 · 體溫 36.5°C · 狀態平穩',
          en: 'Blood pressure 128/76 · temperature 36.5°C · stable',
        },
        tag: 'vital',
        recordedBy: actorCaregiver,
        source: 'mobile-app',
        confidence: 'verified',
        action: 'view-vitals',
      },
      {
        id: 'lin-2',
        residentId: 'lin',
        iso: '2026-09-24T08:10:00+08:00',
        type: 'service',
        status: 'healthy',
        title: { 'zh-Hant': '照服員已到達', en: 'Caregiver check-in' },
        copy: {
          'zh-Hant': '王怡文完成打卡，開始今日陪伴服務。',
          en: 'Yi-Wen Wang checked in; morning care has started.',
        },
        tag: 'service',
        recordedBy: actorCaregiver,
        source: 'mobile-app',
        confidence: 'verified',
        action: 'view-note',
      },
      {
        id: 'lin-3',
        residentId: 'lin',
        iso: '2026-09-23T20:42:00+08:00',
        type: 'family',
        status: 'healthy',
        title: { 'zh-Hant': '家屬留下新訊息', en: 'Family note received' },
        copy: {
          'zh-Hant': '林怡君：媽媽昨晚睡得比較好，麻煩今天留意早餐。',
          en: 'Yi-Chun Lin: Mum slept better last night — please keep an eye on breakfast.',
        },
        tag: 'family',
        recordedBy: actorFamilyLin,
        source: 'family-app',
        confidence: 'verified',
        action: 'reply',
      },
      {
        id: 'lin-4',
        residentId: 'lin',
        iso: '2026-09-23T07:55:00+08:00',
        type: 'alert',
        status: 'attention',
        title: { 'zh-Hant': '晚間巡視：陪伴情緒偏低落', en: 'Evening visit: low mood observed' },
        copy: {
          'zh-Hant': '王怡文：晚間陪伴情緒偏低落，已記錄並提醒家屬。',
          en: 'Yi-Wen Wang: low mood during evening visit; logged and family notified.',
        },
        tag: 'alert',
        recordedBy: actorCaregiver,
        source: 'mobile-app',
        confidence: 'pending',
        action: 'view-note',
      },
      {
        id: 'lin-5',
        residentId: 'lin',
        iso: '2026-09-22T08:30:00+08:00',
        type: 'vital',
        status: 'healthy',
        title: { 'zh-Hant': '昨日量測已歸檔', en: "Yesterday's vitals filed" },
        copy: {
          'zh-Hant': '血壓 130 / 78 · 體溫 36.4°C · 落在個人平日範圍。',
          en: 'Blood pressure 130/78 · temperature 36.4°C · within personal range.',
        },
        tag: 'vital',
        recordedBy: actorCaregiver,
        source: 'mobile-app',
        confidence: 'verified',
        action: 'view-vitals',
      },
    ],
    city: '台北市 · 大安區',
    emergencyName: '林怡君（女兒）',
    emergencyPhone: '09•• •• 8421',
    address: '台北市大安區和平東路一段 18 號',
    familyCount: 2,
  },
  {
    id: 'chen',
    initials: { 'zh-Hant': '陳', en: 'CM' },
    portraitTone: 'blue',
    status: 'action',
    names: {
      full: { 'zh-Hant': '陳明德', en: 'Chen Ming-Te' },
      given: { 'zh-Hant': '明德', en: 'Ming-Te' },
      short: { 'zh-Hant': '明德', en: 'Ming-Te' },
    },
    age: 81,
    carePlan: { 'zh-Hant': '居家照護 A 級', en: 'Home care · tier A' },
    timezone: 'Asia/Taipei',
    family: [actorFamilyChen],
    caregiver: actorCaregiverB,
    next: {
      iso: '2026-09-24T08:30:00+08:00',
      durationMin: 60,
      status: 'running',
      focus: { 'zh-Hant': '血壓覆核 + 用藥', en: 'BP review + medication' },
      window: { 'zh-Hant': '08:30 — 09:30', en: '08:30 — 09:30' },
    },
    nextReview: { 'zh-Hant': '今日 14:00', en: 'Today · 14:00' },
    queue: {
      title: { 'zh-Hant': '陳明德 · review vital', en: 'Chen Ming-Te · review vital' },
      meta: { 'zh-Hant': '152 / 88 · 08:10 · 1 owner', en: '152/88 · 08:10 · 1 owner' },
    },
    networkLabel: { 'zh-Hant': '1 項需覆核', en: '1 item needs review' },
    strip: { visits: 2, signals: 2, messages: 1 },
    needs: [
      {
        status: 'action',
        icon: 'vital',
        title: { 'zh-Hant': '陳明德 · vital 需覆核', en: 'Chen Ming-Te · vital needs review' },
        meta: { 'zh-Hant': '08:10 · owner: 陳怡君', en: '08:10 · owner: Yi-Chun Chen' },
      },
    ],
    timeline: [
      {
        id: 'chen-1',
        residentId: 'chen',
        iso: '2026-09-24T08:10:00+08:00',
        type: 'alert',
        status: 'action',
        title: { 'zh-Hant': '血壓紀錄待覆核', en: 'Blood pressure pending review' },
        copy: {
          'zh-Hant': '陳怡君記錄 152 / 88，尚未完成主管覆核。',
          en: 'Yi-Chun Chen logged 152/88; supervisor review is pending.',
        },
        tag: 'alert',
        recordedBy: actorCaregiverB,
        source: 'mobile-app',
        confidence: 'pending',
        action: 'review',
      },
      {
        id: 'chen-2',
        residentId: 'chen',
        iso: '2026-09-24T07:45:00+08:00',
        type: 'service',
        status: 'healthy',
        title: { 'zh-Hant': '照服員已到達', en: 'Caregiver check-in' },
        copy: {
          'zh-Hant': '陳怡君完成打卡，開始晨間照護。',
          en: 'Yi-Chun Chen checked in; morning care has started.',
        },
        tag: 'service',
        recordedBy: actorCaregiverB,
        source: 'mobile-app',
        confidence: 'verified',
        action: 'view-note',
      },
      {
        id: 'chen-3',
        residentId: 'chen',
        iso: '2026-09-23T19:08:00+08:00',
        type: 'family',
        status: 'healthy',
        title: { 'zh-Hant': '家屬已讀照護摘要', en: 'Family read daily summary' },
        copy: {
          'zh-Hant': '陳志豪已查看昨日服務與量測紀錄。',
          en: 'Chih-Hao Chen read yesterday\'s service and vitals summary.',
        },
        tag: 'family',
        recordedBy: actorFamilyChen,
        source: 'family-app',
        confidence: 'verified',
        action: 'view-loop',
      },
    ],
    city: '新北市 · 永和區',
    emergencyName: '陳怡君（女兒）',
    emergencyPhone: '09•• •• 1190',
    address: '新北市永和區仁愛路 106 號',
    familyCount: 2,
  },
  {
    id: 'huang',
    initials: { 'zh-Hant': '黃', en: 'HM' },
    portraitTone: 'lavender',
    status: 'healthy',
    names: {
      full: { 'zh-Hant': '黃蔡美', en: 'Huang Tsai-Mei' },
      given: { 'zh-Hant': '蔡美', en: 'Tsai-Mei' },
      short: { 'zh-Hant': '蔡美', en: 'Tsai-Mei' },
    },
    age: 75,
    carePlan: { 'zh-Hant': '居家照護 B 級', en: 'Home care · tier B' },
    timezone: 'Asia/Taipei',
    family: [actorFamilyHuang],
    caregiver: actorCaregiverC,
    next: {
      iso: '2026-09-24T11:00:00+08:00',
      durationMin: 75,
      status: 'confirmed',
      focus: { 'zh-Hant': '回診資料整理', en: 'Clinic paperwork' },
      window: { 'zh-Hant': '11:00 — 12:15', en: '11:00 — 12:15' },
    },
    nextReview: { 'zh-Hant': '明日 09:00', en: 'Tomorrow · 09:00' },
    queue: {
      title: { 'zh-Hant': '黃蔡美 · 11:00 服務', en: 'Huang Tsai-Mei · 11:00 visit' },
      meta: { 'zh-Hant': '下一個服務：回診資料', en: 'Next: clinic paperwork' },
    },
    networkLabel: { 'zh-Hant': '下一個服務 11:00', en: 'Next service 11:00' },
    strip: { visits: 1, signals: 0, messages: 1 },
    needs: [],
    timeline: [
      {
        id: 'huang-1',
        residentId: 'huang',
        iso: '2026-09-24T07:30:00+08:00',
        type: 'family',
        status: 'healthy',
        title: { 'zh-Hant': '家屬更新照護備註', en: 'Family note added' },
        copy: {
          'zh-Hant': '今天上午需要協助整理回診資料。',
          en: 'Clinic paperwork requested for this morning.',
        },
        tag: 'family',
        recordedBy: actorFamilyHuang,
        source: 'family-app',
        confidence: 'verified',
        action: 'view-note',
      },
      {
        id: 'huang-2',
        residentId: 'huang',
        iso: '2026-09-23T16:00:00+08:00',
        type: 'service',
        status: 'healthy',
        title: { 'zh-Hant': '昨日服務已完成', en: "Yesterday's service completed" },
        copy: {
          'zh-Hant': '陪同散步 20 分鐘，情緒穩定。',
          en: '20-minute walk completed; mood stable.',
        },
        tag: 'service',
        recordedBy: actorCaregiverC,
        source: 'mobile-app',
        confidence: 'verified',
        action: 'view-note',
      },
    ],
    city: '台北市 · 士林區',
    emergencyName: '黃郁雯（女兒）',
    emergencyPhone: '09•• •• 3072',
    address: '台北市士林區中山北路五段 90 號',
    familyCount: 2,
  },
  {
    id: 'wu',
    initials: { 'zh-Hant': '吳', en: 'WK' },
    portraitTone: 'green',
    status: 'healthy',
    names: {
      full: { 'zh-Hant': '吳國華', en: 'Wu Kuo-Hua' },
      given: { 'zh-Hant': '國華', en: 'Kuo-Hua' },
      short: { 'zh-Hant': '國華', en: 'Kuo-Hua' },
    },
    age: 83,
    carePlan: { 'zh-Hant': '居家照護 B 級', en: 'Home care · tier B' },
    timezone: 'Asia/Taipei',
    family: [actorFamilyWu],
    caregiver: actorCaregiverD,
    next: {
      iso: '2026-09-24T13:30:00+08:00',
      durationMin: 60,
      status: 'confirmed',
      focus: { 'zh-Hant': '午餐 + 陪同復健', en: 'Lunch + rehab support' },
      window: { 'zh-Hant': '13:30 — 14:30', en: '13:30 — 14:30' },
    },
    nextReview: { 'zh-Hant': '週五 10:00', en: 'Friday · 10:00' },
    queue: {
      title: { 'zh-Hant': '吳國華 · 今日無警示', en: 'Wu Kuo-Hua · no alerts' },
      meta: { 'zh-Hant': '穩定進度 · 13:30 服務', en: 'Stable · 13:30 service' },
    },
    networkLabel: { 'zh-Hant': '今日無警示', en: 'All clear today' },
    strip: { visits: 1, signals: 0, messages: 0 },
    needs: [],
    timeline: [
      {
        id: 'wu-1',
        residentId: 'wu',
        iso: '2026-09-24T08:00:00+08:00',
        type: 'service',
        status: 'healthy',
        title: { 'zh-Hant': '早晨服務已完成', en: 'Morning service completed' },
        copy: {
          'zh-Hant': '完成盥洗、早餐與環境整理。',
          en: 'Bathing, breakfast, and environment reset completed.',
        },
        tag: 'service',
        recordedBy: actorCaregiverD,
        source: 'mobile-app',
        confidence: 'verified',
        action: 'view-note',
      },
      {
        id: 'wu-2',
        residentId: 'wu',
        iso: '2026-09-23T08:30:00+08:00',
        type: 'vital',
        status: 'healthy',
        title: { 'zh-Hant': '昨日量測已歸檔', en: "Yesterday's vitals filed" },
        copy: {
          'zh-Hant': '血壓與體溫在個人平日範圍。',
          en: 'Blood pressure and temperature within personal range.',
        },
        tag: 'vital',
        recordedBy: actorCaregiverD,
        source: 'mobile-app',
        confidence: 'verified',
        action: 'view-vitals',
      },
    ],
    city: '新北市 · 中和區',
    emergencyName: '吳秀蘭（太太）',
    emergencyPhone: '09•• •• 6611',
    address: '新北市中和區景平路 188 號',
    familyCount: 1,
  },
]

export const seedEvents: CareEvent[] = seedResidents.flatMap((resident) => resident.timeline)

export const seedShifts: Shift[] = [
  { id: 's-001', residentId: 'lin', caregiver: '王怡文', date: '2026-09-21', start: '09:00', end: '11:00', status: 'confirmed' },
  { id: 's-002', residentId: 'huang', caregiver: '王怡文', date: '2026-09-22', start: '13:00', end: '15:00', status: 'confirmed' },
  { id: 's-003', residentId: 'chen', caregiver: '張家豪', date: '2026-09-25', start: '10:00', end: '12:00', status: 'pending' },
  { id: 's-004', residentId: 'chen', caregiver: '張家豪', date: '2026-09-25', start: '11:30', end: '13:00', status: 'conflict', note: 'mock conflict' },
  { id: 's-005', residentId: 'wu', caregiver: '蔡婷婷', date: '2026-09-26', start: '13:30', end: '14:30', status: 'confirmed' },
]

export const seedMedications: Medication[] = [
  {
    id: 'm-001',
    residentId: 'lin',
    name: { 'zh-Hant': '早餐後例行藥（mock）', en: 'Mock morning dose' },
    dose: { 'zh-Hant': '1 顆', en: '1 tablet' },
    time: '08:30',
    taken: true,
  },
  {
    id: 'm-002',
    residentId: 'lin',
    name: { 'zh-Hant': '晚餐後例行藥（mock）', en: 'Mock evening dose' },
    dose: { 'zh-Hant': '1 顆', en: '1 tablet' },
    time: '18:30',
    taken: false,
  },
  {
    id: 'm-003',
    residentId: 'chen',
    name: { 'zh-Hant': '睡前例行藥（mock）', en: 'Mock bedtime dose' },
    dose: { 'zh-Hant': '半顆', en: '½ tablet' },
    time: '21:00',
    taken: false,
  },
  {
    id: 'm-004',
    residentId: 'huang',
    name: { 'zh-Hant': '午餐前例行藥（mock）', en: 'Mock pre-lunch dose' },
    dose: { 'zh-Hant': '1 顆', en: '1 tablet' },
    time: '11:30',
    taken: true,
  },
]

export const seedNotifications: NotificationItem[] = [
  {
    id: 'n-001',
    residentId: 'lin',
    title: { 'zh-Hant': '家屬訊息待回覆', en: 'Family message waiting' },
    detail: {
      'zh-Hant': '林怡君詢問今天是否留意早餐。',
      en: 'Yi-Chun Lin asked about breakfast follow-up.',
    },
    time: { 'zh-Hant': '10 分鐘前', en: '10 min ago' },
    read: false,
  },
  {
    id: 'n-002',
    residentId: 'chen',
    title: { 'zh-Hant': '排班衝突已標記', en: 'Schedule conflict flagged' },
    detail: {
      'zh-Hant': '週五 11:30–13:00 需要人工確認。',
      en: 'Friday 11:30–13:00 needs human confirmation.',
    },
    time: { 'zh-Hant': '昨天', en: 'Yesterday' },
    read: false,
  },
  {
    id: 'n-003',
    residentId: 'huang',
    title: { 'zh-Hant': '今日服務已同步', en: 'Today sync complete' },
    detail: {
      'zh-Hant': '本地 mock timeline 已更新。',
      en: 'Local mock timeline updated.',
    },
    time: { 'zh-Hant': '昨天', en: 'Yesterday' },
    read: true,
  },
  {
    id: 'n-004',
    residentId: 'wu',
    title: { 'zh-Hant': '量測值待覆核', en: 'Vitals need review' },
    detail: {
      'zh-Hant': '血壓紀錄已歸檔，尚未標記已覆核。',
      en: 'BP log filed but not yet reviewed.',
    },
    time: { 'zh-Hant': '今天 09:15', en: 'Today · 09:15' },
    read: false,
  },
]

export const sosSteps: SosStep[] = [
  {
    id: 'step-caregiver',
    actor: 'caregiver',
    label: { 'zh-Hant': '照服員', en: 'Caregiver' },
    detail: { 'zh-Hant': '抵達現場並留下第一線觀察', en: 'On-site first-responder notes the situation' },
  },
  {
    id: 'step-family',
    actor: 'family',
    label: { 'zh-Hant': '家屬主要聯絡人', en: 'Primary family contact' },
    detail: { 'zh-Hant': '由照服員通知家人是否需要到場', en: 'Caregiver pings the primary family contact' },
  },
  {
    id: 'step-manager',
    actor: 'manager',
    label: { 'zh-Hant': '個案管理師', en: 'Case manager' },
    detail: { 'zh-Hant': '同步進度並視情況啟動外部支援', en: 'Case manager triages and escalates if needed' },
  },
]

export const statusLabels: Record<StatusTone, { 'zh-Hant': string; en: string }> = {
  healthy: { 'zh-Hant': '平穩', en: 'Stable' },
  attention: { 'zh-Hant': '需關注', en: 'Attention' },
  action: { 'zh-Hant': '需處理', en: 'Action required' },
  emergency: { 'zh-Hant': '緊急', en: 'Emergency' },
}

export const roleLabels: Record<Role, { 'zh-Hant': string; en: string }> = {
  manager: { 'zh-Hant': '個案管理師', en: 'Manager' },
  caregiver: { 'zh-Hant': '照服員', en: 'Caregiver' },
  family: { 'zh-Hant': '家屬', en: 'Family' },
}

// ------- Helpers -------

export const filterResidents = (residents: Resident[], query: string): Resident[] => {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return residents
  return residents.filter((resident) => {
    const haystack = `${resident.names.full['zh-Hant']} ${resident.names.full.en} ${resident.city} ${resident.carePlan['zh-Hant']} ${resident.carePlan.en}`.toLowerCase()
    return haystack.includes(normalized)
  })
}

export const findShiftConflicts = (shifts: Shift[]): string[] => {
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

export const calculateHours = (shifts: Shift[]): number => {
  return shifts.reduce((total, shift) => {
    const [sh, sm] = shift.start.split(':').map(Number)
    const [eh, em] = shift.end.split(':').map(Number)
    return total + ((eh * 60 + em) - (sh * 60 + sm)) / 60
  }, 0)
}

export const maskSensitive = (value: string, visible: boolean): string =>
  visible ? value : '••••••••'

export const maskPhone = (phone: string, visible: boolean): string => {
  if (visible) return phone
  if (phone.length <= 4) return '••••'
  return `•••• •• ${phone.slice(-4)}`
}

export const selectResidentForRole = (
  role: Role,
  residents: Resident[],
  currentId: string,
): string => {
  if (role === 'caregiver' || role === 'family') {
    return 'lin'
  }
  if (residents.some((resident) => resident.id === currentId)) return currentId
  return residents[0]?.id ?? ''
}

export const getResidentEvents = (
  residents: Resident[],
  residentId: string,
  filter: 'all' | EventType,
): CareEvent[] => {
  const resident = residents.find((item) => item.id === residentId)
  if (!resident) return []
  const events = resident.timeline
  if (filter === 'all') return [...events]
  return events.filter((event) => event.type === filter)
}

export const getResidentMedicationCount = (medications: Medication[]): { taken: number; total: number } => {
  const total = medications.length
  const taken = medications.filter((med) => med.taken).length
  return { taken, total }
}

export const computeQueueCount = (residents: Resident[]): number => {
  return residents.reduce((acc, resident) => acc + resident.needs.length, 0)
}

export const computeUnreadCount = (notifications: NotificationItem[]): number =>
  notifications.filter((item) => !item.read).length

export const sortedEventsByIso = (events: CareEvent[]): CareEvent[] =>
  [...events].sort((a, b) => (a.iso < b.iso ? 1 : a.iso > b.iso ? -1 : 0))

export const makeLocalEvent = (
  residentId: string,
  role: Role,
  detail: string,
  iso?: string,
): CareEvent => {
  const id = `e-local-${Date.now()}`
  const recordedAt = iso ?? new Date().toISOString()
  const roleLabel = roleLabels[role]
  return {
    id,
    residentId,
    iso: recordedAt,
    type: 'note',
    status: 'healthy',
    title: { 'zh-Hant': '新增照護備註', en: 'New local note' },
    copy: { 'zh-Hant': detail, en: detail },
    tag: 'note',
    recordedBy: { ...RECORDER_SYSTEM, names: { 'zh-Hant': `${roleLabel['zh-Hant']} · 本機`, en: `${roleLabel.en} · local` } },
    source: 'local-only',
    confidence: 'verified',
    action: 'handled',
  }
}

export const makeSosPreviewEvent = (residentId: string): SosPreviewEvent => {
  return {
    id: `sos-${Date.now()}`,
    residentId,
    recordedAtIso: new Date().toISOString(),
    steps: sosSteps,
  }
}

export const emptyResident = (): Resident => ({
  id: '',
  initials: { 'zh-Hant': '', en: '' },
  portraitTone: 'gray',
  status: 'healthy',
  names: {
    full: { 'zh-Hant': '', en: '' },
    given: { 'zh-Hant': '', en: '' },
    short: { 'zh-Hant': '', en: '' },
  },
  age: 75,
  carePlan: { 'zh-Hant': '照護 2 級', en: 'Care tier 2' },
  timezone: 'Asia/Taipei',
  family: [],
  caregiver: actorCaregiver,
  next: {
    iso: '2026-09-25T09:00:00+08:00',
    durationMin: 60,
    status: 'confirmed',
    focus: { 'zh-Hant': '例行關懷', en: 'Routine check-in' },
    window: { 'zh-Hant': '09:00 — 10:00', en: '09:00 — 10:00' },
  },
  nextReview: { 'zh-Hant': '一週後覆核', en: 'Review in one week' },
  queue: {
    title: { 'zh-Hant': '新增個案 · 例行關懷', en: 'New resident · routine check-in' },
    meta: { 'zh-Hant': '由目前角色建立 mock', en: 'Created by the current role (mock)' },
  },
  networkLabel: { 'zh-Hant': '加入本地 mock 網絡', en: 'Added to local mock network' },
  strip: { visits: 0, signals: 0, messages: 0 },
  needs: [],
  timeline: [],
  city: '台北市 · 未設定',
  emergencyName: '',
  emergencyPhone: '',
  address: '',
  familyCount: 1,
})

export const shapeResidentFromDraft = (draft: Resident, id: string): Resident => {
  const given = draft.names.given['zh-Hant'] || draft.names.full['zh-Hant'] || id.slice(-1)
  const initialsZh = given.slice(0, 1) || id.slice(-1).toUpperCase()
  const initialsEn = (draft.names.given.en || draft.names.full.en || given).slice(0, 2).toUpperCase()
  return {
    ...draft,
    id,
    initials: { 'zh-Hant': initialsZh || '個', en: initialsEn || 'NM' },
    names: {
      ...draft.names,
      given: draft.names.given['zh-Hant']
        ? draft.names.given
        : { 'zh-Hant': given, en: draft.names.given.en || given },
      short: draft.names.short['zh-Hant'] || draft.names.short.en
        ? draft.names.short
        : { 'zh-Hant': given, en: draft.names.given.en || given },
    },
    timeline: [],
    needs: [],
    strip: { visits: 0, signals: 0, messages: 0 },
  }
}