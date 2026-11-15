# 長照安心管家 — 開發與驗證 SOP

> 狀態：文件依 `PRD/SPEC.md` v4.0 重建（2026-11-16）。M1 **建議暫緩，需 Sean 決定後才開發**（`GOAL.md`）。

## 1. 開工前

1. 讀 `AGENTS.md`、`GOAL.md`、`STATUS.md` 與 `PRD/SPEC.md` 的對應章節（§4 FR、§6 資料、§8 法規、§12 合併清單）。
2. 確認這次的變更對應到哪一條 AC；不在 `GOAL.md` 內的需求先改 SPEC，並取得 Sean 同意。
3. 從 `main` 開分支；所有指令都在 `web/` 目錄執行。

## 2. 驗證指令（依 `web/package.json` 查證，2026-11-16）

| 類型 | 指令 | 狀態 | 備註 |
|---|---|---|---|
| 安裝 | `npm ci` | 已配置 | 使用 `web/package-lock.json` |
| Lint | `npm run lint` | 已配置 | `eslint src`；目前不含 `e2e/` 與設定檔（AC-001 擴大範圍） |
| Typecheck | `npm run typecheck` | 已配置 | `tsc --noEmit`；只涵蓋 `src`（AC-001 擴大範圍） |
| Unit | `npm test` | 已配置 | `vitest run`；17 個 tests |
| Build | `npm run build` | 已配置 | `tsc --noEmit && vite build` |
| E2E | `npm run e2e` | 已配置 | Playwright Chromium；要先 `npm run build`（webServer 用 `vite preview`）；第一次需要 `npx playwright install chromium` |
| 一次全跑 | `npm run check` | **尚未配置** | AC-001 新增 |
| Format | — | **尚未配置** | — |
| Integration | — | **尚未配置** | M2 |
| Coverage | — | **尚未配置** | — |
| Mobile E2E | — | **尚未配置** | SPEC §5 |

標準順序：

```bash
cd web
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run e2e
```

尚未配置的指令不得宣稱已通過；不得把「沒有這個指令」當成通過。

## 3. 資料安全檢查（每個 PR）

```bash
# 憑證樣式字串（應無結果）
git grep -nIE "(sk-[A-Za-z0-9]{10,}|AKIA[0-9A-Z]{12,}|ghp_[A-Za-z0-9]{20,}|-----BEGIN)" -- web .github
# 外部請求與撥號（M1 應無結果；AC-008）
git grep -nE "tel:|fetch\(|sendBeacon|XMLHttpRequest|WebSocket|EventSource" -- web/src
# CI 不吞錯（應無結果；AC-001）
grep -nE "continue-on-error|\|\| echo|\|\| true" .github/workflows/ci.yml
```

AC-002 完成後，再加上 `npm test -- src/fixtures-safety.test.ts`（掃描假資料範圍以外的電話與地址）。

## 4. CI

- `.github/workflows/ci.yml`：`lint`（typecheck＋lint）、`test`、`build`、`e2e` 平行執行；`deploy` 要等四者都通過，並在 `main` push 時把 `web/dist` 推到 `gh-pages` 分支。
- 最近一次 `main` run：`36297617070`（2026-09-27）全部成功。
- GitHub Pages 目前未啟用（API 回 404），所以 `gh-pages` 分支沒有對外發布。是否啟用、以及 `deploy` 要不要改成手動觸發，由 Sean 決定（AC-001 建議改為手動）。

## 5. 本機環境限制（2026-11-16 文件重建時）

- 文件重建所用的 Mac 無法執行 `git`、`python3`，也沒有 node，所以本 SOP 的指令**未在本機執行**；狀態以 CI 紀錄為準。
- 實作者在有 Node 22 的環境中要重跑全部指令，並把 exit code 記在 `STATUS.md`。

## 6. 故意不做（M1）

- 醫療判讀、劑量建議、設備串接。
- 真實個資、真人照片、照片功能。
- 真實通知、`tel:` 撥號、電話輪撥。
- 後端、登入、雲端同步、加密（M2）。
- 計費、長照 2.0 核銷或介接（M3 評估）。
- 部署 production、啟用 Pages 或 Vercel、修改 repo 設定。

## 7. 完成一個 AC 時

1. 跑完 §2 的全部已配置指令與 §3 的檢查，記下 exit code。
2. 更新 `STATUS.md` 的 FR 對照與 AC 進度。
3. PR 標題用 `<type>(scope): AC-00x …`，內文附上指令結果與 CI run 連結。
