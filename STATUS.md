# Sprint Status — long-term-care

- Project: 長照安心管家 — 居家照護 B2B2C SaaS
- Repo: `openclawsean024-create/long-term-care`
- Started: 2026-09-19（repo scaffold）
- State: 🟡 **SCAFFOLD / M1 PLANNING / LOCAL AHEAD** — 2026-09-24
- Spec: `PRD/SPEC.md` v3.0.2
- Stack: Vite + React + TypeScript strict（版本需在 M1 統一）

## 三向對齊證據

| 來源 | SHA / 結果 |
|---|---|
| Local HEAD | `HEAD` (`chore(governance): add project operating contract`; see `git log -1`) |
| GitHub `main` | `02db3c96272563772d3ed1c3c70c735420e5625a` |
| Notion canonical Project row | `02db3c96272563772d3ed1c3c70c735420e5625a` |
| Vercel production | 未驗證：本次沒有 `VERCEL_TOKEN` |
| `sync-3way.sh long-term-care --verify` | exit 2；資料不完整，不能宣稱 fully aligned |

目前未 push，故 local HEAD 與 GitHub / Vercel / Notion release SHA 尚未對齊；依 autonomous contract 不在 agent session 內 push。

## 本次增量

- 補齊專案層 `AGENTS.md`、`SOP.md`、`STATUS.md`。
- 建立 bounded M1 scope，明確禁止在安全設計前接真實個資與外部通知。
- 記錄目前驗證命令、CI 路徑錯誤與技術棧版本漂移。

## Deterministic checks（2026-09-24）

| Command | Exit | Evidence |
|---|---:|---|
| `cd web && npm run typecheck` | 0 | `tsc --noEmit` 完成 |
| `cd web && npm test` | 1 | Vitest：No test files found |
| `cd web && npm run build` | 0 | Vite production build 完成 |
| `cd web && npm run lint` | 1 | package script 尚未定義 |
| `sync-3way.sh long-term-care --verify` | 2 | 缺 `gh` CLI 與 `VERCEL_TOKEN`，資料不完整 |

`npm install --no-package-lock` 本次安裝 100 packages；npm audit 回報 7 vulnerabilities（5 moderate、1 high、1 critical），需在依賴基線建立時另行處理，不以 `npm audit fix --force` 當作自動修復。

## 完成度與風險

- 程式碼完成度：scaffold only；FR-001～FR-007 尚未實作。
- Open Issues：至少 3 個已知治理／CI blocker（見 `SOP.md`）。
- 下一步：Sean 覆審 M1 scope；接著由 Developer 修正 web toolchain 與測試基線，再開始 FR-001。
