# Sprint Status — long-term-care

- Project: 長照安心管家 — 居家照護 B2B2C SaaS
- Repo: `openclawsean024-create/long-term-care`
- Started: 2026-09-19（repo scaffold）
- State: 🟡 **M1 MOCK-ONLY MVP / LOCAL AHEAD** — 2026-09-24
- Spec: `PRD/SPEC.md` v3.0.2
- Stack: Vite + React 19 + TypeScript strict + ESLint flat config

## 三向對齊證據

| 來源 | SHA / 結果 |
|---|---|
| Local HEAD | `HEAD` (see `git log -1`; M1 implementation commit `8a0a41a`) |
| GitHub `main` | `02db3c96272563772d3ed1c3c70c735420e5625a` |
| Notion canonical Project row | `02db3c96272563772d3ed1c3c70c735420e5625a` |
| Vercel production | 未驗證：本次沒有 `VERCEL_TOKEN` |
| `sync-3way.sh long-term-care --verify` | exit 2；資料不完整，不能宣稱 fully aligned |

目前未 push，故 local HEAD 與 GitHub / Vercel / Notion release SHA 尚未對齊；依 autonomous contract 不在 agent session 內 push。

## 本次增量

- 補齊專案層 `AGENTS.md`、`SOP.md`、`STATUS.md`。
- 建立 bounded M1 scope，明確禁止在安全設計前接真實個資與外部通知。
- 記錄目前驗證命令、CI 路徑錯誤與技術棧版本漂移。
- 完成競品對標、`PRD/UI-SPEC.md` 與獨立 `web/ui-prototype.html`；Sean 確認後進入正式 React。
- 第二版改為 Careboard 國際產品方向：dark editorial shell、focus queue、resident context dock、locale／role／sync metadata；仍只使用 mock data。
- 完成 React mock-only 工作台：角色切換、FR-001 個案 mock CRUD／敏感欄位遮罩、FR-002 排班衝突、FR-003 通知路由視圖、FR-004 local timeline、FR-005 用藥確認、FR-006 SOS 安全預覽、FR-007 報表。
- 補上 domain unit tests、ESLint gate、React 19 依賴與 lockfile；本地瀏覽器 QA 驗證導覽、搜尋、個案切換與遮罩。

## Deterministic checks（2026-09-24）

| Command | Exit | Evidence |
|---|---:|---|
| `cd web && npm run lint` | 0 | ESLint 完成 |
| `cd web && npm run typecheck` | 0 | React 19 / TypeScript strict 完成 |
| `cd web && npm test` | 0 | 4 domain tests passed |
| `cd web && npm run build` | 0 | Vite production build 完成 |
| `git diff --check` | 0 | whitespace check 完成 |
| `sync-3way.sh long-term-care --verify` | 2 | 缺 `gh` CLI 與 `VERCEL_TOKEN`，資料不完整 |

Prototype static check：exit 0（required markers、inline JavaScript parse、`git diff --check`）。React localhost QA 已驗證工作台載入、導覽、個案搜尋、個案切換與敏感欄位遮罩。

`npm install --no-package-lock` 本次安裝 100 packages；npm audit 回報 7 vulnerabilities（5 moderate、1 high、1 critical），需在依賴基線建立時另行處理，不以 `npm audit fix --force` 當作自動修復。

## 完成度與風險

- 程式碼完成度：M1 mock-only frontend complete；外部服務與 production safety 尚未完成。
- Open Issues：CI path、integration/E2E、auth/RBAC、加密同步、外部通知與 deployment release gate（見 `SOP.md`）。
- 下一步：Sean 覆審正式 React 工作台；若要 production 化，再由 Planner 建立安全／權限／整合規格並進行人審。
