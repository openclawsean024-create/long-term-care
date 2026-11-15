# Status — long-term-care（長照安心管家）

- 產品：長照安心管家（居家照護 B2B2C）
- 主 repo：`openclawsean024-create/long-term-care`（`main` @ `1b31495`）
- 候選併入：`openclawsean024-create/elderly-care-companion`（`main` @ `cc64445`，只讀）
- 規格：`PRD/SPEC.md` v4.0；目標：`GOAL.md`（M1）
- 狀態：🟡 **文件重建完成，尚未依 v4.0 開發；建議暫緩，待 Sean 決定**（2026-11-16）

## 評估摘要（詳見 SPEC §0）

| 項目 | 結論 |
|---|---|
| 完成度 | 30／100（前端 mock 工作台完整；後端、權限、同意、通知、計費都還沒有） |
| 獲利潛力 | 中（原評等為高；因競品、法規成本與採購週期下修） |
| 建議 | 暫緩：先訪談至少 3 家居服單位並取得法律顧問初步意見；M1 假資料強化可由 Sean 決定先做 |

## 目前狀態摘要（以 `main` 程式為準）

- Vite＋React 19＋TypeScript strict 的單頁 mock 工作台，有三角色切換與 7 個畫面，資料存 localStorage。
- 可運作：個案 mock CRUD、敏感欄位遮罩、排班衝突偵測、日誌時間線、用藥勾選、站內通知、SOS 本機預覽、報表卡片、中英雙語。
- 還不能用：日誌新增只寫固定文字；照服員與家屬固定看同一位個案（沒有權限）；刪除不連動；沒有匯出、同意、稽核；排班日期寫死。
- seed 使用看似真實的姓名與真實街道門牌格式，要改成明顯假資料（GOAL AC-002）。

## 舊狀態更正

舊版本檔記載「LOCAL AHEAD、GitHub `main` 停在 `02db3c9`、CI E2E 尚未實跑」。實際上 `main` 已在 `1b31495`，run `36297617070`（2026-09-27）的 lint、test、build、e2e、deploy 全部成功。舊版提到的 Vercel URL 與 Notion canonical row 本次未驗證。

## CI 證據（未在本機執行）

| 檢查 | 來源 | 結果 |
|---|---|---|
| typecheck＋lint | run `36297617070` job `lint` | success |
| unit | 同上 job `test` | success，17 tests passed |
| build | 同上 job `build` | success |
| e2e | 同上 job `e2e` | success，5 passed（Chromium） |
| deploy | 同上 job `deploy` | success（推送 `gh-pages` 分支；Pages 未啟用） |

本次文件重建所用的機器無法執行 node、git、python3，所以上表全部是 CI 紀錄，**未在本機重跑**。

## FR 對照（以 `main` 程式為準）

| FR | 需求 | 優先 | 狀態 | 所在 repo | 目標里程碑 |
|---|---|---|---|---|---|
| FR-001 | 個案資料 CRUD | P0 | 部分 | long-term-care | M1 |
| FR-002 | 排班週視圖與衝突偵測 | P0 | 部分 | long-term-care | M1／M2 |
| FR-003 | 事件通知 | P0 | 部分（只有站內清單） | long-term-care | M1 dry-run／M2／M3 |
| FR-004 | 照護日誌 | P0 | 部分 | long-term-care、elderly-care-companion | M1 |
| FR-005 | 用藥紀錄與確認 | P0 | 部分 | long-term-care、elderly-care-companion | M1／M2 |
| FR-006 | SOS 聯絡鏈（不取代 119） | P0 | 部分（預覽） | long-term-care、elderly-care-companion | M1／M2 |
| FR-007 | 報表與匯出 | P1 | 部分 | long-term-care、elderly-care-companion | M1 |
| FR-008 | 角色與權限 | P0 | 部分（只有 UI 切換） | long-term-care | M1／M2 |
| FR-009 | 敏感資料分級、同意、遮罩 | P0 | 部分（只有遮罩） | long-term-care | M1 |
| FR-010 | 刪除與清除本機資料 | P0 | 部分 | long-term-care | M1 |
| FR-011 | 家屬協作待辦 | P1 | 部分 | elderly-care-companion | M1 |
| FR-012 | 照片紀錄 | P2 | 部分 | elderly-care-companion | M2 以後 |
| FR-013 | 多機構隔離與邀請碼 | P0 | 未實作 | — | M2 |
| FR-014 | 後端、加密與同步 | P0 | 未實作 | — | M2 |
| FR-015 | 稽核紀錄 | P1 | 未實作 | — | M1／M2 |
| FR-016 | 計費與方案限制 | P1 | 未實作 | — | M3 |
| FR-017 | 中英雙語 | P2 | 已實作 | long-term-care | — |
| FR-018 | 行動裝置與無障礙 | P1 | 部分 | long-term-care | M1 |
| FR-019 | 長照 2.0 匯出或介接 | P2 | 未實作 | — | M3 評估 |

## M1 AC 進度

| AC | 標題 | 狀態 |
|---|---|---|
| AC-001 | 品質閘門涵蓋全部程式，失敗時一定擋得住 | 未開始 |
| AC-002 | 只用明顯假資料，並自動掃描 | 未開始 |
| AC-003 | 角色權限純函式與資料範圍 | 未開始 |
| AC-004 | 資料分級、同意紀錄、連動刪除與清除本機資料 | 未開始 |
| AC-005 | 照護日誌可輸入，用藥分時段統計 | 未開始 |
| AC-006 | 家屬協作待辦 | 未開始 |
| AC-007 | CSV 匯出（只限管理者，含安全處理） | 未開始 |
| AC-008 | 法規邊界：不做醫療判讀、不取代 119、不送出外部請求 | 未開始 |

## 本次變更

- 只改寫 `PRD/SPEC.md`、`GOAL.md`、`AGENTS.md`、`SOP.md`、`STATUS.md` 這 5 份文件；沒有修改任何程式、設定或測試。`README.md`、`PRD/UI-SPEC.md`、`PRD/CHANGELOG.md` 都沒有動。

## 待決事項（詳見 SPEC §14）

1. 接受「暫緩」建議，或要先做 M1。
2. 定位：機構工具或家屬自用工具。
3. 是否委託法律顧問（特種個資、受託處理、長照服務法、醫療器材軟體界線）。
4. 機構訪談名單與時程。
5. `deploy` job 與公開示範站的處理方式。
6. 方案價格（目前都是假設）。
7. `elderly-care-companion` 合併後是否封存，以及是否先清理其中疑似真實的電話號碼（`web/src/lib/db.ts:38-41`）。
8. 舊的 Notion row 與 Vercel URL 是否繼續維護。
