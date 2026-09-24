import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  calculateHours,
  filterResidents,
  findShiftConflicts,
  maskSensitive,
  roleLabels,
  seedEvents,
  seedMedications,
  seedNotifications,
  seedResidents,
  seedShifts,
  statusLabels,
  viewLabels,
  type CareEvent,
  type Medication,
  type NotificationItem,
  type Resident,
  type Role,
  type Shift,
  type StatusTone,
  type View,
} from './domain'

const navItems: Array<{ id: View; icon: string; shortcut: string }> = [
  { id: 'overview', icon: '◒', shortcut: '01' },
  { id: 'residents', icon: '◉', shortcut: '02' },
  { id: 'schedule', icon: '⌁', shortcut: '03' },
  { id: 'journal', icon: '✦', shortcut: '04' },
  { id: 'medications', icon: '◌', shortcut: '05' },
  { id: 'notifications', icon: '◫', shortcut: '06' },
  { id: 'reports', icon: '↗', shortcut: '07' },
]

const roleCopy: Record<Role, { title: string; detail: string }> = {
  caregiver: { title: '把今天照顧好。', detail: '先完成到府任務，再留下可被家屬理解的紀錄。' },
  family: { title: '放心知道，何時需要靠近。', detail: '集中查看長輩近況、家屬訊息與下一個照護節點。' },
  manager: { title: '讓每個照護節點都有主人。', detail: '聚焦排班例外、服務品質與需要人工判斷的事件。' },
}

const newResident: Resident = {
  id: '', name: '', romanizedName: '', initials: '', age: 75, careLevel: '照護 2 級', city: '台北市 · 未設定', status: 'healthy', address: '', emergencyName: '', emergencyPhone: '', familyCount: 1, nextReview: '2026-10-10',
}

function useStoredState<T>(key: string, initial: T): [T, (next: T | ((current: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initial
    } catch { return initial }
  })
  useEffect(() => { try { window.localStorage.setItem(key, JSON.stringify(value)) } catch { /* local-only fallback */ } }, [key, value])
  return [value, setValue]
}

function App() {
  const [activeView, setActiveView] = useState<View>('overview')
  const [role, setRole] = useState<Role>('caregiver')
  const [residents, setResidents] = useStoredState<Resident[]>('careboard:residents', seedResidents)
  const [events, setEvents] = useStoredState<CareEvent[]>('careboard:events', seedEvents)
  const [shifts, setShifts] = useStoredState<Shift[]>('careboard:shifts', seedShifts)
  const [medications, setMedications] = useStoredState<Medication[]>('careboard:medications', seedMedications)
  const [notifications, setNotifications] = useStoredState<NotificationItem[]>('careboard:notifications', seedNotifications)
  const [selectedResidentId, setSelectedResidentId] = useState('r-001')
  const [search, setSearch] = useState('')
  const [showSensitive, setShowSensitive] = useState(false)
  const [showResidentForm, setShowResidentForm] = useState(false)
  const [showSos, setShowSos] = useState(false)
  const [draft, setDraft] = useState<Resident>(newResident)
  const [toast, setToast] = useState('')

  const selectedResident = residents.find((resident) => resident.id === selectedResidentId) ?? residents[0]
  const filteredResidents = useMemo(() => filterResidents(residents, search), [residents, search])
  const conflicts = useMemo(() => findShiftConflicts(shifts), [shifts])
  const unreadCount = notifications.filter((item) => !item.read).length
  const todayShifts = shifts.filter((shift) => shift.date === '2026-09-24')

  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 3200); return () => window.clearTimeout(timer) }, [toast])
  const flash = (message: string) => setToast(message)
  const openResident = (id: string) => { setSelectedResidentId(id); setActiveView('residents') }

  const addResident = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft.name.trim() || !draft.emergencyName.trim()) { flash('請至少填寫個案姓名與緊急聯絡人（mock）'); return }
    const created: Resident = { ...draft, id: `r-${Date.now()}`, name: draft.name.trim(), initials: draft.name.trim().slice(0, 1), romanizedName: draft.romanizedName.trim() || 'Local mock resident' }
    setResidents((current) => [...current, created]); setSelectedResidentId(created.id); setDraft(newResident); setShowResidentForm(false); flash('個案已加入本地 mock 清單')
  }

  const addJournalEntry = () => {
    if (!selectedResident) return
    const created: CareEvent = { id: `e-${Date.now()}`, residentId: selectedResident.id, type: 'note', label: '新增照護備註', detail: '已由目前角色建立一筆 local-only 示範紀錄。', recordedBy: `${roleLabels[role]} · 本機`, time: '剛剛', status: 'healthy', source: 'local-only' }
    setEvents((current) => [created, ...current]); flash('照護日誌已儲存至本機 mock timeline')
  }

  const toggleMedication = (id: string) => { setMedications((current) => current.map((item) => item.id === id ? { ...item, taken: !item.taken } : item)); flash('用藥確認已更新（mock）') }
  const markAllRead = () => { setNotifications((current) => current.map((item) => ({ ...item, read: true }))); flash('通知已標記為已讀') }
  const addMockShift = () => { const created: Shift = { id: `s-${Date.now()}`, residentId: selectedResident?.id ?? 'r-001', caregiver: role === 'caregiver' ? '目前照服員' : '待指派', date: '2026-09-26', start: '09:00', end: '11:00', status: 'pending' }; setShifts((current) => [...current, created]); flash('已新增待確認班次（mock）') }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">跳到主要內容</a>
      <aside className="sidebar" aria-label="主要導覽">
        <div className="brand-lockup"><div className="brand-mark" aria-hidden="true">◒</div><div><strong>安心管家</strong><span>CAREBOARD / LOCAL</span></div></div>
        <div className="workspace-switcher"><span className="eyebrow">WORKSPACE</span><button className="workspace-button" type="button" onClick={() => flash('目前為本地 mock 工作區')}><span><i className="status-dot" /> Taipei Care Team</span><span>⌄</span></button><small>Asia/Taipei · UTC+08:00</small></div>
        <nav className="nav-list">{navItems.map((item) => <button className={`nav-item ${activeView === item.id ? 'active' : ''}`} key={item.id} type="button" aria-current={activeView === item.id ? 'page' : undefined} onClick={() => setActiveView(item.id)}><span className="nav-icon" aria-hidden="true">{item.icon}</span><span>{viewLabels[item.id]}</span><kbd>{item.shortcut}</kbd>{item.id === 'notifications' && unreadCount > 0 && <b className="nav-count">{unreadCount}</b>}</button>)}</nav>
        <div className="sidebar-footer"><span className="eyebrow">DATA BOUNDARY</span><p>本頁只使用示範資料。未連接通知、電話、雲端或真實個案服務。</p><span className="local-badge"><i className="status-dot" /> LOCAL-ONLY</span></div>
      </aside>
      <main className="main-area" id="main-content">
        <header className="topbar"><div className="breadcrumbs"><span>長照安心管家</span><b>/</b><strong>{viewLabels[activeView]}</strong></div><div className="top-actions"><span className="sync-state"><i className="status-dot" /> Local-only · 已同步於 10:42</span><label className="select-wrap"><span className="sr-only">目前角色</span><select value={role} onChange={(event) => setRole(event.target.value as Role)} aria-label="目前角色">{(Object.keys(roleLabels) as Role[]).map((key) => <option key={key} value={key}>{roleLabels[key]}</option>)}</select></label><button className="avatar-button" type="button" onClick={() => flash(`${roleLabels[role]}工作區`)} aria-label="開啟個人選單">許</button></div></header>
        <div className="page-content">
          <section className="hero-row"><div><span className="eyebrow">THURSDAY · 24 SEP 2026 / {roleLabels[role].toUpperCase()}</span><h1>{roleCopy[role].title}</h1><p>{roleCopy[role].detail}</p></div><div className="hero-actions"><button className="button button-quiet" type="button" onClick={() => flash('搜尋僅作用於本地 mock 資料')}>⌕ 搜尋</button><button className="button button-primary" type="button" onClick={() => setShowSos(true)}>＋ 建立照護紀錄</button></div></section>
          <div className="status-strip" role="status" aria-live="polite"><span><i className="status-dot" /> 服務運作正常</span><span className="strip-divider" /><span>本週已完成 <strong>{todayShifts.length}</strong> 個服務節點</span><span className="strip-divider" /><span><strong>{conflicts.length}</strong> 個排班項目需要人工確認</span></div>
          {activeView === 'overview' && <Overview residents={residents} events={events} shifts={shifts} selectedResident={selectedResident} onOpenResident={openResident} onAddJournal={addJournalEntry} onOpenSos={() => setShowSos(true)} />}
          {activeView === 'residents' && <ResidentsView residents={filteredResidents} selectedResident={selectedResident} search={search} showSensitive={showSensitive} onSearch={setSearch} onSelect={setSelectedResidentId} onToggleSensitive={() => setShowSensitive((value) => !value)} onAdd={() => setShowResidentForm(true)} />}
          {activeView === 'schedule' && <ScheduleView shifts={shifts} residents={residents} conflicts={conflicts} onAdd={addMockShift} onResolve={(id) => { setShifts((current) => current.map((shift) => shift.id === id ? { ...shift, status: 'confirmed' } : shift)); flash('班次已標記為已確認（mock）') }} />}
          {activeView === 'journal' && <JournalView events={events} residents={residents} selectedResidentId={selectedResident?.id ?? ''} onAdd={addJournalEntry} />}
          {activeView === 'medications' && <MedicationView medications={medications} residents={residents} onToggle={toggleMedication} />}
          {activeView === 'notifications' && <NotificationView notifications={notifications} residents={residents} onMarkAll={markAllRead} onOpenResident={openResident} />}
          {activeView === 'reports' && <ReportsView residents={residents} shifts={shifts} events={events} onOpenSos={() => setShowSos(true)} />}
          <footer className="provenance-footer"><span>Prototype boundary · mock-only records · {roleLabels[role]} view</span><span>v0.1 local preview · <button type="button" onClick={() => flash('沒有外部同步可供重新整理')}>重新整理同步</button></span></footer>
        </div>
      </main>
      <div className="mobile-nav" aria-label="行動版導覽">{navItems.slice(0, 4).map((item) => <button type="button" className={activeView === item.id ? 'active' : ''} key={item.id} onClick={() => setActiveView(item.id)}><span>{item.icon}</span>{viewLabels[item.id].slice(0, 4)}</button>)}<button type="button" className="mobile-sos" onClick={() => setShowSos(true)} aria-label="開啟 SOS 預覽">SOS</button></div>
      {showResidentForm && <ResidentModal draft={draft} onChange={setDraft} onClose={() => setShowResidentForm(false)} onSubmit={addResident} />}
      {showSos && <SosModal onClose={() => setShowSos(false)} onConfirm={() => { setShowSos(false); flash('SOS 預覽已記錄，沒有撥出電話或傳送通知') }} />}
      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
    </div>
  )
}

function Overview({ residents, events, shifts, selectedResident, onOpenResident, onAddJournal, onOpenSos }: { residents: Resident[]; events: CareEvent[]; shifts: Shift[]; selectedResident?: Resident; onOpenResident: (id: string) => void; onAddJournal: () => void; onOpenSos: () => void }) {
  const focusItems = [{ label: '回覆家屬訊息', detail: '林秀琴 · 林志遠', tone: 'action' as StatusTone, action: () => onOpenResident('r-001') }, { label: '確認排班衝突', detail: '王淑芬 · 週五 11:30', tone: 'attention' as StatusTone, action: () => onOpenResident('r-003') }]
  return <><section className="metric-grid" aria-label="今日摘要"><MetricCard label="今日服務" value={`${shifts.filter((shift) => shift.status === 'confirmed').length}`} suffix="個節點" trend="+2 vs. 昨日" tone="amber" /><MetricCard label="待處理事件" value={`${events.filter((event) => event.status === 'action').length + 1}`} suffix="件" trend="需要人工判斷" tone="coral" /><MetricCard label="照護時數" value={`${String(Math.floor(calculateHours(shifts))).padStart(2, '0')}:00`} suffix="小時" trend="本週累計 18:30" tone="navy" /><MetricCard label="在照個案" value={`${residents.length}`} suffix="位" trend="100% local mock" tone="forest" /></section><div className="dashboard-grid"><section className="panel focus-panel"><PanelHeading kicker="FOCUS QUEUE" title="今天先處理這些" action="全部查看" /><div className="focus-list">{focusItems.map((item, index) => <button className="focus-item" type="button" key={item.label} onClick={item.action}><span className={`queue-index tone-${item.tone}`}>0{index + 1}</span><span className="focus-copy"><strong>{item.label}</strong><small>{item.detail}</small></span><span className={`status-pill ${item.tone}`}>{statusLabels[item.tone]}</span><span className="arrow">↗</span></button>)}</div><div className="queue-footer"><span><i className="status-dot amber" /> 2 個優先項目</span><span>依角色與時間排序</span></div></section><section className="panel resident-panel"><PanelHeading kicker="RESIDENT CONTEXT" title="目前照護脈絡" action="查看個案" onAction={() => selectedResident && onOpenResident(selectedResident.id)} />{selectedResident && <div className="resident-summary"><div className="resident-portrait large">{selectedResident.initials}</div><div><h3>{selectedResident.name}</h3><p>{selectedResident.romanizedName} · {selectedResident.age} 歲</p><span className="status-pill attention">{selectedResident.careLevel}</span></div><div className="resident-summary-meta"><strong>{selectedResident.familyCount}</strong><span>家屬成員</span><strong>{selectedResident.nextReview.slice(5).replace('-', '/')}</strong><span>下次覆核</span></div></div>}<div className="context-strip"><div><span>今日服務</span><strong>1 / 2</strong><small>完成一項</small></div><div><span>待回覆訊息</span><strong className="text-coral">1</strong><small>林志遠</small></div><div><span>家屬圈</span><strong>3</strong><small>位成員</small></div></div></section><section className="panel timeline-panel"><PanelHeading kicker="CARE TIMELINE" title="最近照護紀錄" action="開啟日誌" /><div className="timeline-list">{events.slice(0, 4).map((event) => <div className="timeline-row" key={event.id}><div className={`timeline-dot ${event.status}`} /><div className="timeline-content"><strong>{event.label}</strong><p>{event.detail}</p><small>{event.time} · {event.recordedBy} · <em>{event.source}</em></small></div></div>)}</div></section><section className="panel next-panel"><PanelHeading kicker="NEXT SLOT" title="下一個照護節點" action="週視圖" /><div className="next-slot"><span className="slot-time">13:00<small>今天</small></span><div className="slot-line" /><div><strong>陳明德 · 陪同活動</strong><p>許雅雯 · 永和區</p><span className="status-pill healthy">已確認</span></div></div><button className="button button-outline full" type="button" onClick={onAddJournal}>＋ 完成後新增紀錄</button><button className="button button-danger-ghost full" type="button" onClick={onOpenSos}>開啟 SOS 預覽</button></section></div></>
}

function ResidentsView({ residents, selectedResident, search, showSensitive, onSearch, onSelect, onToggleSensitive, onAdd }: { residents: Resident[]; selectedResident?: Resident; search: string; showSensitive: boolean; onSearch: (value: string) => void; onSelect: (id: string) => void; onToggleSensitive: () => void; onAdd: () => void }) {
  return <section className="split-view"><div className="panel list-panel"><div className="panel-heading"><div><span className="eyebrow">FR-001 · RESIDENTS</span><h2>個案資料</h2></div><button className="button button-primary small" type="button" onClick={onAdd}>＋ 新增個案</button></div><label className="search-field"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="搜尋姓名、英文名或地區" aria-label="搜尋個案" /></label><div className="resident-list">{residents.map((resident) => <button className={`resident-list-item ${selectedResident?.id === resident.id ? 'selected' : ''}`} type="button" key={resident.id} onClick={() => onSelect(resident.id)}><div className="resident-portrait">{resident.initials}</div><div><strong>{resident.name}</strong><span>{resident.romanizedName}</span><small>{resident.city}</small></div><span className={`status-pill ${resident.status}`}>{statusLabels[resident.status]}</span></button>)}{residents.length === 0 && <EmptyState text="找不到符合的 mock 個案" />}</div></div>{selectedResident && <div className="panel detail-panel"><div className="detail-top"><span className="eyebrow">RESIDENT PROFILE / LOCAL MOCK</span><button className="button button-quiet small" type="button" onClick={onToggleSensitive}>{showSensitive ? '隱藏敏感欄位' : '顯示遮罩欄位'}</button></div><div className="detail-identity"><div className="resident-portrait xl">{selectedResident.initials}</div><div><h2>{selectedResident.name}</h2><p>{selectedResident.romanizedName} · {selectedResident.age} 歲 · {selectedResident.careLevel}</p><span className={`status-pill ${selectedResident.status}`}>{statusLabels[selectedResident.status]}</span></div></div><div className="detail-section"><span className="eyebrow">CARE CONTEXT</span><div className="detail-grid"><DetailField label="服務地區" value={selectedResident.city} /><DetailField label="下次覆核" value={selectedResident.nextReview} /><DetailField label="家庭成員" value={`${selectedResident.familyCount} 位`} /><DetailField label="資料來源" value="local-only" /></div></div><div className="detail-section sensitive-section"><span className="eyebrow">SENSITIVE FIELDS / MASKED BY DEFAULT</span><div className="detail-grid"><DetailField label="居住地址" value={maskSensitive(selectedResident.address, showSensitive)} /><DetailField label="緊急聯絡人" value={maskSensitive(selectedResident.emergencyName, showSensitive)} /><DetailField label="聯絡電話" value={maskSensitive(selectedResident.emergencyPhone, showSensitive)} /><DetailField label="權限狀態" value="尚未接入 RBAC" /></div></div><div className="mock-callout"><strong>安全邊界</strong><p>這些資料只存在目前瀏覽器的 localStorage。未連接真實個案、通知、電話或雲端服務。</p></div></div>}</section>
}

function ScheduleView({ shifts, residents, conflicts, onAdd, onResolve }: { shifts: Shift[]; residents: Resident[]; conflicts: string[]; onAdd: () => void; onResolve: (id: string) => void }) {
  const days = ['週一 09/21', '週二 09/22', '今天 09/24', '週五 09/25', '週六 09/26']
  const dayMatches = (day: string, date: string) => day.includes('09/24') ? date === '2026-09-24' : day.includes('09/25') ? date === '2026-09-25' : day.includes('09/26') ? date === '2026-09-26' : false
  return <section className="stack-view"><div className="section-heading-row"><div><span className="eyebrow">FR-002 · SCHEDULE</span><h2>排班週視圖</h2><p>衝突先被看見，再由人做決定。輪班建議目前為 deterministic mock。</p></div><button className="button button-primary" type="button" onClick={onAdd}>＋ 新增 mock 班次</button></div><div className="schedule-toolbar"><span className="week-chip">← 這週 · 09/21 — 09/27 →</span><span className="status-pill attention">{conflicts.length} 個衝突待確認</span><span className="sync-state"><i className="status-dot" /> local-only</span></div><div className="schedule-board">{days.map((day) => <div className="schedule-day" key={day}><div className="schedule-day-label">{day}</div><div className="schedule-slots">{shifts.filter((shift) => dayMatches(day, shift.date)).map((shift) => { const resident = residents.find((item) => item.id === shift.residentId); const hasConflict = conflicts.includes(shift.id); return <div className={`shift-card ${hasConflict ? 'has-conflict' : ''}`} key={shift.id}><div className="shift-time">{shift.start}<span>—</span>{shift.end}</div><strong>{resident?.name ?? '未指定個案'}</strong><small>{shift.caregiver}</small><span className={`status-pill ${hasConflict ? 'attention' : shift.status === 'confirmed' ? 'healthy' : 'action'}`}>{hasConflict ? '衝突' : shift.status === 'confirmed' ? '已確認' : '待確認'}</span>{hasConflict && <button type="button" className="resolve-link" onClick={() => onResolve(shift.id)}>標記已處理</button>}</div> })}{!shifts.some((shift) => dayMatches(day, shift.date)) && <span className="empty-slot">沒有排班</span>}</div></div>)}</div><div className="mock-callout"><strong>決策邊界</strong><p>排班卡片僅呈現 mock 衝突，不會自動通知照服員，也不會改動真實行事曆。</p></div></section>
}

function JournalView({ events, residents, selectedResidentId, onAdd }: { events: CareEvent[]; residents: Resident[]; selectedResidentId: string; onAdd: () => void }) {
  return <section className="stack-view"><div className="section-heading-row"><div><span className="eyebrow">FR-004 · CARE JOURNAL</span><h2>照護日誌</h2><p>把服務現場整理成家屬看得懂、團隊接得上的時間線。</p></div><button className="button button-primary" type="button" onClick={onAdd}>＋ 新增 local-only 紀錄</button></div><div className="journal-composer"><div className="composer-avatar">許</div><div><strong>新增照護紀錄</strong><p>目前個案：{residents.find((resident) => resident.id === selectedResidentId)?.name ?? '未選擇'}</p></div><span className="local-badge">MOCK ONLY</span></div><div className="journal-list">{events.map((event) => <article className="journal-card" key={event.id}><div className={`timeline-dot ${event.status}`} /><div className="journal-body"><div className="journal-meta"><span>{event.time}</span><span>{event.recordedBy}</span><span className="source-tag">{event.source}</span></div><h3>{event.label}</h3><p>{event.detail}</p><small>個案：{residents.find((resident) => resident.id === event.residentId)?.name ?? '未指定'}</small></div></article>)}</div></section>
}

function MedicationView({ medications, residents, onToggle }: { medications: Medication[]; residents: Resident[]; onToggle: (id: string) => void }) {
  const completed = medications.filter((medication) => medication.taken).length
  return <section className="stack-view"><div className="section-heading-row"><div><span className="eyebrow">FR-005 · MEDICATION TRACKING</span><h2>用藥追蹤</h2><p>只做確認回條與漏服視覺化；處方來源、醫囑與提醒服務尚未接入。</p></div><span className="completion-ring">{completed}/{medications.length}<small>今日確認</small></span></div><div className="medication-list">{medications.map((medication) => <div className={`medication-row ${medication.taken ? 'done' : ''}`} key={medication.id}><div className="med-time">{medication.time}<small>今日</small></div><div className="med-icon">◌</div><div className="med-copy"><strong>{medication.name}</strong><span>{residents.find((resident) => resident.id === medication.residentId)?.name} · {medication.dose}</span></div><span className={`status-pill ${medication.taken ? 'healthy' : 'action'}`}>{medication.taken ? '已確認' : '待確認'}</span><button className="button button-outline small" type="button" onClick={() => onToggle(medication.id)}>{medication.taken ? '取消確認' : '標記已服'}</button></div>)}</div><div className="mock-callout"><strong>安全邊界</strong><p>這是示範用的例行照護項目，不是處方或醫療建議；不會發出鬧鈴、推播或家屬通知。</p></div></section>
}

function NotificationView({ notifications, residents, onMarkAll, onOpenResident }: { notifications: NotificationItem[]; residents: Resident[]; onMarkAll: () => void; onOpenResident: (id: string) => void }) {
  return <section className="stack-view"><div className="section-heading-row"><div><span className="eyebrow">FR-003 · NOTIFICATION ROUTING</span><h2>通知中心</h2><p>先整理事件路由與人工確認；真實推播、LINE、Email 尚未連接。</p></div><button className="button button-quiet" type="button" onClick={onMarkAll}>全部標為已讀</button></div><div className="notification-list">{notifications.map((notification) => <button type="button" className={`notification-row ${notification.read ? 'read' : ''}`} key={notification.id} onClick={() => onOpenResident(notification.residentId)}><span className={`notification-icon ${notification.tone}`}>{notification.tone === 'action' ? '!' : '•'}</span><span className="notification-copy"><strong>{notification.title}</strong><span>{notification.detail}</span><small>{residents.find((resident) => resident.id === notification.residentId)?.name} · {notification.time}</small></span>{!notification.read && <i className="unread-dot" />}</button>)}</div><div className="route-grid"><div><span className="eyebrow">ROUTE</span><strong>家屬訊息</strong><small>目前：mock inbox</small></div><div><span className="eyebrow">ROUTE</span><strong>照服員提醒</strong><small>目前：local-only queue</small></div><div><span className="eyebrow">ROUTE</span><strong>緊急鏈</strong><small>目前：安全預覽</small></div></div></section>
}

function ReportsView({ residents, shifts, events, onOpenSos }: { residents: Resident[]; shifts: Shift[]; events: CareEvent[]; onOpenSos: () => void }) {
  return <section className="stack-view"><div className="section-heading-row"><div><span className="eyebrow">FR-006 / FR-007 · REPORTS & SAFETY</span><h2>報表與安全</h2><p>將可驗證的服務指標集中，緊急流程保持可檢視但不會真的撥號。</p></div><button className="button button-danger" type="button" onClick={onOpenSos}>開啟 SOS 預覽</button></div><div className="report-grid"><ReportCard label="服務完成率" value="92%" detail={`${shifts.length} 個 mock 班次`} tone="forest" /><ReportCard label="本週照護時數" value="18:30" detail="依排班資料計算" tone="amber" /><ReportCard label="日誌完整度" value="88%" detail={`${events.length} 筆 local timeline`} tone="navy" /><ReportCard label="在照個案" value={`${residents.length}`} detail="尚未連接真實資料" tone="coral" /></div><div className="safety-card"><div><span className="eyebrow">EMERGENCY FLOW / SAFE PREVIEW</span><h3>需要支援時，先留下清楚的事件脈絡。</h3><p>此按鈕只會開啟確認畫面並寫入 mock timeline；不會撥打電話、不會發送簡訊，也不會通知任何第三方。</p></div><button type="button" className="button button-danger" onClick={onOpenSos}>檢視流程</button></div></section>
}

function ResidentModal({ draft, onChange, onClose, onSubmit }: { draft: Resident; onChange: (next: Resident) => void; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className="modal-backdrop" role="presentation"><div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="resident-modal-title"><div className="modal-heading"><div><span className="eyebrow">LOCAL MOCK CRUD</span><h2 id="resident-modal-title">新增個案</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="關閉">×</button></div><form onSubmit={onSubmit}><label className="form-field"><span>姓名 *</span><input value={draft.name} onChange={(event) => onChange({ ...draft, name: event.target.value })} placeholder="例如：林秀琴" autoFocus /></label><label className="form-field"><span>英文名</span><input value={draft.romanizedName} onChange={(event) => onChange({ ...draft, romanizedName: event.target.value })} placeholder="例如：Lin Hsiu-Chin" /></label><div className="form-row"><label className="form-field"><span>年齡</span><input type="number" min="0" value={draft.age} onChange={(event) => onChange({ ...draft, age: Number(event.target.value) })} /></label><label className="form-field"><span>照護等級</span><select value={draft.careLevel} onChange={(event) => onChange({ ...draft, careLevel: event.target.value })}><option>照護 1 級</option><option>照護 2 級</option><option>照護 3 級</option><option>照護 4 級</option></select></label></div><label className="form-field"><span>緊急聯絡人 *</span><input value={draft.emergencyName} onChange={(event) => onChange({ ...draft, emergencyName: event.target.value })} placeholder="僅用於 mock 示範" /></label><label className="form-field"><span>地址</span><input value={draft.address} onChange={(event) => onChange({ ...draft, address: event.target.value })} placeholder="不要輸入真實個資" /></label><div className="mock-callout"><strong>Local-only boundary</strong><p>此表單只寫入目前瀏覽器的 localStorage，不會送到伺服器。</p></div><div className="modal-actions"><button className="button button-quiet" type="button" onClick={onClose}>取消</button><button className="button button-primary" type="submit">儲存 mock 個案</button></div></form></div></div>
}

function SosModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return <div className="modal-backdrop" role="presentation"><div className="modal-card sos-modal" role="dialog" aria-modal="true" aria-labelledby="sos-title"><div className="sos-symbol">!</div><span className="eyebrow">SAFE PREVIEW · NO CALLS</span><h2 id="sos-title">開啟緊急事件預覽？</h2><p>這會建立一筆 mock 事件，模擬檢視照服員、家屬與個管師的聯絡順序。現在不會撥電話、不會傳簡訊，也不會通知第三方。</p><div className="mock-callout"><strong>預覽鏈</strong><p>照服員 → 家屬主要聯絡人 → 個案管理師</p></div><div className="modal-actions"><button className="button button-quiet" type="button" onClick={onClose}>返回</button><button className="button button-danger" type="button" onClick={onConfirm}>建立 mock 事件</button></div></div></div>
}

function MetricCard({ label, value, suffix, trend, tone }: { label: string; value: string; suffix: string; trend: string; tone: string }) { return <div className={`metric-card ${tone}`}><span>{label}</span><div><strong>{value}</strong><small>{suffix}</small></div><em>{trend}</em></div> }
function ReportCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) { return <div className={`report-card ${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small><div className="report-bar"><i /></div></div> }
function PanelHeading({ kicker, title, action, onAction }: { kicker: string; title: string; action: string; onAction?: () => void }) { return <div className="panel-heading"><div><span className="eyebrow">{kicker}</span><h2>{title}</h2></div><button type="button" className="text-button" onClick={onAction}>{action} ↗</button></div> }
function DetailField({ label, value }: { label: string; value: string }) { return <div className="detail-field"><span>{label}</span><strong>{value}</strong></div> }
function EmptyState({ text }: { text: string }) { return <div className="empty-state">{text}</div> }

export default App
