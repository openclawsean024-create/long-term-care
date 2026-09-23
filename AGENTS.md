# AGENTS.md — 長照安心管家

## 1. 權威規格與範圍

- Single Source of Truth: [`PRD/SPEC.md`](./PRD/SPEC.md) v3.0.2。
- 所有實作必須能對應到 SPEC §3 的 FR-001～FR-007 與 §6 DoD。
- 不得把產品做成醫療診斷、處方簽、真實金流、DICOM 病歷或跨國多語產品（SPEC §1.4）。
- 個資、照護紀錄、用藥與緊急聯絡資料屬敏感資料；未完成安全、權限與人審前，不得接入真實個案資料或宣稱 HIPAA 等級合規。
- MVP 先使用可替換的本地 mock / localStorage 邊界；推播、LINE、Email、雲端同步、電話輪撥與真實個資服務必須先補安全設計、測試與人審。

## 2. 開發流程

1. 修改前讀本檔、`SOP.md`、`STATUS.md` 與 SPEC 對應章節。
2. Planner 只產出 bounded plan；Developer 才能修改 workspace；QA 與 Final reviewer 保持 read-only。
3. 每個增量都要補測試或明確記錄為文件／治理變更，並保留 command output 與 exit code。
4. 不得在 agent session 內 push、merge、部署、改 branch protection 或旋轉 secrets。
5. auth、授權、個資加密、資料庫 migration、金流、secrets 與 infra 刪除需 `risk-approved` + Sean 人審。

## 3. 驗證命令

工作目錄是 `web/`；命令執行前先 `cd web`。

| 類型 | Canonical command | 現況 |
|---|---|---|
| Format | 尚未設定 | M1 前補上 formatter policy |
| Lint | `npm run lint` | 尚未在 `web/package.json` 定義，禁止假設已通過 |
| Typecheck | `npm run typecheck` | 已定義 |
| Unit | `npm test` | 已定義，但目前沒有測試檔 |
| Integration | 尚未設定 | M2 前定義 |
| E2E | 尚未設定 | P0 UI 完成前定義 |
| Build | `npm run build` | 已定義 |

部署由 release workflow 管理；在未完成獨立驗收與風險審查前，不得執行 production deploy。任何正式 release 都必須同步 canonical Notion Project DB，並以 60 秒 production HTTP smoke test 驗證。

## 4. Commit 規則

使用 `<type>(scope): <FR / AC ref 或說明>`，例如 `chore(governance): add project operating contract`。

