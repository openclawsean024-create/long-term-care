# AGENTS.md — 長照安心管家（long-term-care）

## 1. 權威文件與範圍

- 規格：[`PRD/SPEC.md`](./PRD/SPEC.md) v4.0（§0 評估結論、FR 狀態、法規、合併清單、里程碑）。
- 目前目標：[`GOAL.md`](./GOAL.md)（只含 M1；**建議暫緩，需 Sean 決定後才開發**）。
- 驗證指令：[`SOP.md`](./SOP.md)；目前狀態：[`STATUS.md`](./STATUS.md)。
- 視覺參考：`PRD/UI-SPEC.md`（舊版，與 SPEC v4.0 衝突時以 SPEC 為準）；`PRD/CHANGELOG.md` 為歷史紀錄。
- `elderly-care-companion` 是候選併入 repo，**只讀**；要搬什麼、不搬什麼以 SPEC §12 為準。

## 2. 專案結構

```
web/
├── src/
│   ├── App.tsx              # 單頁狀態機：view、角色、語系、所有 handler
│   ├── domain.ts            # 型別、seed（mock）、純函式（衝突偵測、遮罩、搜尋…）
│   ├── domain.test.ts       # Vitest unit tests（17 個）
│   ├── storage.ts           # useStoredState：localStorage（careboard:*:v2）
│   ├── i18n.ts、format.ts   # 中英文字串、日期與數字格式
│   ├── components/          # shell（Sidebar、Topbar、MobileNav、Toast）、modals、primitives
│   └── views/               # overview.tsx、secondary.tsx（個案、排班、日誌、用藥、家屬、報表）
├── e2e/careboard.spec.ts    # Playwright E2E（5 個，Chromium，Asia/Taipei）
├── ui-prototype.html        # 靜態原型，不參與 build
└── package.json
.github/workflows/ci.yml     # lint+typecheck、test、build、e2e、deploy（gh-pages）
PRD/                         # SPEC.md、UI-SPEC.md、CHANGELOG.md
```

## 3. 技術棧

| 項目 | 版本／說明 |
|---|---|
| 建置 | Vite 5（`base: './'`） |
| UI | React 19，自寫 CSS（`src/index.css`），無 UI 套件、無 Tailwind |
| 語言 | TypeScript 5.6 strict（`tsconfig.json` 目前只涵蓋 `src`） |
| 測試 | Vitest 2（node 環境，`src/**/*.test.ts`）；Playwright（`e2e/`，本機 preview 4173 port） |
| Lint | ESLint 9 flat config＋typescript-eslint（目前只檢查 `src`） |
| 資料 | 無後端；localStorage |
| CI | GitHub Actions，Node 22，`npm ci` 在 `web/` |

## 4. 開發規則

1. **只用假資料**：seed、測試、fixture、文件範例都要用明顯的假資料（姓名加「示範」前綴、電話 `0900-000-xxx`、地址「示範市示範區示範路 N 號」、藥名「示範藥 A」）。不得放入真實個案、機構、照服員資料或真人照片。發現疑似真實個資時不要複製或擴散，回報檔案路徑。
2. **照護資料是特種個資**：健康描述、量測值、用藥、照片都屬 S 級（SPEC §6）；要有同意紀錄、預設遮罩、可刪除，並依權限限制可見範圍。
3. **不做醫療判讀**：不得新增診斷、異常判定、就醫建議、劑量建議等文案或邏輯；提醒規則只能寫成「依機構設定」。
4. **不取代 119**：SOS 只做本機預覽紀錄；不得新增 `tel:`、電話輪撥或任何真實通知。
5. **不送出外部請求**：M1 程式不得使用 `fetch`、`sendBeacon`、`XMLHttpRequest`、`WebSocket`、`EventSource`；不得讀取任何通知或金流憑證。
6. **不得提交憑證**：token、API key、`.env*` 一律不進 repo。
7. **測試不可為了通過而刪改斷言**：不得刪除、跳過（`.skip`、`.only`）、放寬既有斷言或改期望值；行為變更要在 PR 說明，並對應 FR 或 AC。
8. **不擴大 scope**：照片、媒合派案、長照 2.0 核銷、後端都不在 M1；新增需求先改 SPEC 並取得 Sean 同意。
9. **依賴**：不引入第二套樣式系統或路由（Tailwind、react-router 等）；新增依賴要在 PR 說明理由。
10. **Git**：從 `main` 開分支、用 PR 合併；不直接 push `main`、不 force push、不改 repo 設定；未經 Sean 同意不部署、不啟用 Pages 或 Vercel、不封存或刪除 repo。
11. **Commit 格式**：`<type>(scope): <說明或 FR/AC 編號>`，例如 `feat(privacy): AC-004 cascade delete`。

## 5. 驗證

指令與目前可用狀態見 [`SOP.md`](./SOP.md)。尚未配置的指令（format、integration、coverage、mobile E2E）不得宣稱已通過。
