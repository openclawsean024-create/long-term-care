# Goal — 長照安心管家 M1

> **建議暫緩，需 Sean 決定後才開發。** 評估結論見 `PRD/SPEC.md` §0。本 M1 只用假資料、不碰真實個資，成本低，可以先做，也可以等機構訪談與法律意見回來再做。

## Objective

在只使用明顯假資料、不送出任何外部請求、不宣稱醫療或緊急救援能力的前提下，把現有的 mock 工作台強化成可以拿去做機構訪談的可信原型。範圍包括：品質閘門擴大到全部程式、假資料替換與自動掃描、角色權限純函式、資料分級與同意模型、連動刪除，並把 `elderly-care-companion` 選定的日誌類型、家屬待辦與 CSV 匯出改寫後併入。

規格依據：`PRD/SPEC.md` v4.0（§4 FR、§6 資料處理、§8 法規、§9 M1、§12 合併清單）。

## Acceptance criteria

每條 AC 的「驗證」指令都必須 exit 0（工作目錄 `web/`）。下列測試檔名是 M1 要新增的檔案，名稱可以在實作 PR 中調整，但要同步更新本檔與 `SOP.md`。

- **AC-001：品質閘門涵蓋全部程式，失敗時一定擋得住**
  - `lint` 與 `typecheck` 的範圍擴大到 `e2e/`、`playwright.config.ts`、`vite.config.ts`（例如新增 `tsconfig.node.json`，並把 `lint` 改成 `eslint .`）。
  - `package.json` 宣告 `@eslint/js`，移除未使用的 `react-router-dom`；新增 `check` script，依序執行 lint、typecheck、test、build。
  - CI 維持不吞錯：不得出現 `continue-on-error`、`|| echo`、`|| true`；`deploy` 要等 lint、test、build、e2e 全部通過，並改成 `workflow_dispatch` 手動觸發（是否恢復自動部署由 Sean 決定）。
  - 在實作 PR 中用一個暫時的失敗 commit（例如故意讓一個斷言失敗）證明 CI 會變紅，接著 revert 並在 PR 說明附上 run 連結。
  - 驗證：`npm run check && npm run e2e`；`grep -nE "continue-on-error|\|\| echo|\|\| true" ../.github/workflows/ci.yml` 沒有結果；PR 上 GitHub Actions 全綠。

- **AC-002：只用明顯假資料，並自動掃描**
  - `web/src/domain.ts` 的 seed 全部改成明顯假資料：姓名加「示範」前綴；地址用「示範市示範區示範路 N 號」；電話用 `0900-000-xxx`；用藥用「示範藥 A」等名稱；修正陳明德緊急聯絡人與照服員同名的不一致。
  - 新增掃描測試：掃描 `src/`、`e2e/`，遇到不在 `0900-000-xxx`／`0900000xxx` 範圍的 `09` 開頭手機號、不含「示範」的「…路／街…號」門牌地址，或憑證樣式字串，就讓測試失敗。
  - 驗證：`npm test -- src/fixtures-safety.test.ts`；`git grep -nIE "(sk-[A-Za-z0-9]{10,}|AKIA[0-9A-Z]{12,}|ghp_[A-Za-z0-9]{20,}|-----BEGIN)" -- web .github` 沒有結果。

- **AC-003：角色權限純函式與資料範圍**（FR-008）
  - 新增 `can(actor, action, resource)`：管理者可以看與改全部個案；照服員只能看被指派的個案（依排班或指派表），不能刪除個案或匯出；家屬只能看自己綁定的長輩，看不到其他個案，也看不到照服員內部備註。
  - 移除 `selectResidentForRole` 寫死 `'lin'` 的行為，改由假帳號的指派關係決定。
  - UI 依權限隱藏資料與動作（刪除、匯出、顯示敏感欄位）。
  - 驗證：`npm test -- src/permissions.test.ts`（逐格測試權限矩陣）；`npm run e2e -- e2e/role-scope.spec.ts`（切換為家屬後，個案清單只剩 1 位，且沒有刪除與匯出按鈕）。

- **AC-004：資料分級、同意紀錄、連動刪除與清除本機資料**（FR-009、FR-010、FR-015）
  - 欄位標註 S／P／B 等級（SPEC §6.1）。新增同意紀錄模型（同意人、關係：本人／法定代理人／輔助人、版本、日期、範圍）；沒有同意紀錄的個案不能儲存 S 級欄位（量測值、用藥紀錄、健康描述）。
  - 刪除個案時，連帶刪除該個案的日誌、排班、用藥、通知、待辦與 SOS 預覽紀錄；新增「清除本機全部資料」，清除所有 `careboard:*` 與 `prefs:*` key。
  - 新增本機稽核紀錄：顯示敏感欄位、匯出、刪除、同意變更都要寫一筆（只存本機）。
  - 驗證：`npm test -- src/consent.test.ts src/cascade-delete.test.ts src/audit-log.test.ts`；`npm run e2e -- e2e/privacy.spec.ts`（刪除個案後 reload，相關資料都不在；清除全部後 localStorage 裡沒有 `careboard:` 開頭的 key）。

- **AC-005：照護日誌可輸入，用藥分時段統計**（FR-004、FR-005；合併清單 #1、#4）
  - 新增日誌表單：類型（餵食、用藥協助、量測、陪伴、外出、其他）＋文字備註＋選填的量測數值（只做格式與範圍驗證，不做異常判讀）；顯示記錄者角色、來源 `local-only` 與時間；重新整理後仍在。
  - 用藥依早、午、晚時段分組，計算確認率；不顯示劑量建議。
  - 驗證：`npm test -- src/journal.test.ts src/medication-stats.test.ts`；`npm run e2e -- e2e/journal-form.spec.ts`（新增一筆「量測」→ 出現在時間線最上方 → reload 後仍在）。

- **AC-006：家屬協作待辦**（FR-011；合併清單 #2）
  - 待辦有標題、負責人（家屬或照服員）、到期日、完成狀態，並依個案隔離；家屬只能看到與完成自己長輩的待辦，管理者可以指派。
  - 驗證：`npm test -- src/todos.test.ts`；`npm run e2e -- e2e/family-todos.spec.ts`（管理者指派 → 切換為家屬後看得到並勾選完成）。

- **AC-007：CSV 匯出（只限管理者，含安全處理）**（FR-007；合併清單 #3）
  - 匯出照護紀錄與待辦 CSV：處理雙引號跳脫；以 `=`、`+`、`-`、`@` 開頭的儲存格加上 `'` 前綴，防止公式注入；預設不含 S 級欄位，要勾選並二次確認才會包含；檔名含日期，UI 顯示「含個資，請妥善保管」。
  - 非管理者看不到匯出入口，權限檢查也會拒絕；每次匯出寫入稽核紀錄（AC-004）。
  - 驗證：`npm test -- src/export.test.ts`（跳脫、公式注入、預設排除 S 級欄位、權限拒絕）。

- **AC-008：法規邊界：不做醫療判讀、不取代 119、不送出外部請求**（SPEC §8）
  - 文案安全測試：`i18n.ts` 中除了免責聲明的 key 以外，不得出現「診斷」「異常」「疑似」「建議就醫」「劑量」等字詞（清單維護在測試檔）；目前 seed 的「需覆核」改成「依機構設定需覆核」的寫法。
  - UI 固定顯示：「示範資料，非醫療器材，不取代 119 或緊急救援」。
  - 程式碼不得出現 `tel:`、`fetch(`、`sendBeacon`、`XMLHttpRequest`、`WebSocket`、`EventSource`；SOS 仍然只做本機預覽紀錄。
  - 驗證：`npm test -- src/copy-safety.test.ts`；`git grep -nE "tel:|fetch\(|sendBeacon|XMLHttpRequest|WebSocket|EventSource" -- web/src` 沒有結果；`npm run e2e`（全部 spec 的外部請求監聽都為空）。

## Out of scope

- 真實個資、試點機構資料、真人照片；照片功能（ECC `Photos`）整體不做。
- 後端、資料庫、雲端同步、真實登入與後端授權、欄位加密（M2）。
- 任何真實通知（推播、LINE、Email、SMS）、`tel:` 撥號、電話輪撥。
- 計費、金流、發票；長照 2.0 平台申報或介接。
- 量測值的醫療判讀、用藥劑量建議、設備或感測器串接。
- 照服員與家屬的媒合或派案。
- production 部署、啟用 GitHub Pages 或 Vercel、修改 repo 設定；封存、刪除或改名 `elderly-care-companion`（由 Sean 決定）。

## Exit gate

- AC-001～AC-008 的驗證指令全部 exit 0，並把指令與結果記在 `STATUS.md`。
- 實作 PR 的 GitHub Actions 全綠（lint、test、build、e2e），且 AC-001 的「故意失敗會變紅」有 run 連結作為證據。
- `PRD/SPEC.md` §12 合併清單中，每個「要搬」項目都有對應的模組與測試；「不搬」的原因仍然成立。
- Sean 覆審 scope，並確認 `PRD/SPEC.md` §14 的待決事項。M2 進入前還要完成 SPEC §9 的法規閘門：訪談結論、法律顧問書面意見、安全維護計畫與委託處理契約範本。
