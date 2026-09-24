# 長照安心管家 — 開發 SOP

## 規格對齊狀態（2026-09-24）

- ✅ `PRD/SPEC.md` v3.0.2 已在 repo。
- ⚠️ GitHub `main` 與 Notion canonical Project row 仍指向 `02db3c96272563772d3ed1c3c70c735420e5625a`；本地 M1 commit 已前進，尚未 push 或同步 release metadata。
- ⚠️ Vercel URL 已記錄為 `https://long-term-care.vercel.app`，但本次無 `VERCEL_TOKEN`，尚未完成 production SHA / HTTP 驗證。
- ✅ M1 mock-only React 工作台已實作 FR-001～FR-007 的前端可演示流程；未接真實個資、通知、電話或雲端服務。
- ⚠️ 尚未完成 production DoD：沒有真實 auth/RBAC、加密同步、外部通知、E2E、CI 對齊或 Vercel release。

## M1 — 可驗證產品骨架

目標：把 scaffold 變成可安全演示的照護工作台，不接真實個資與外部通知。

- 建立三種角色的最小導覽：照服員、家屬、個案管理師。
- 先完成 FR-001 個案資料的 mock CRUD 與敏感欄位遮罩，不落真實資料。
- 建立 FR-004 照護日誌的本地 mock timeline，明確標示 local-only。
- 建立 FR-002 排班的週視圖骨架與衝突顯示；輪班建議先以 deterministic mock。
- 每個 P0 行為都有 unit test；UI 互動補 E2E。
- 在接入通知、用藥、SOS 前，先完成 threat model、權限模型、失敗降級與人審。

## 驗證 SOP

```bash
cd web
npm run lint
npm run typecheck
npm test
npm run build
```

目前 integration 與 E2E 尚未配置；不得把缺少命令當成通過。CI workflow 在現況仍以 repo root 執行 `npm ci`，與 `web/package.json` 不一致，列為下一個 integrator blocker。

## 故意不做

- ❌ 醫療診斷、處方簽、DICOM 與保險請款。
- ❌ 真實個案資料、真實推播／LINE／Email、真實電話輪撥。
- ❌ 登入、RBAC、雲端資料庫或加密同步，直到安全設計與人審完成。
- ❌ 生產部署、Vercel 設定與 GitHub workflow 修正，直到 M1 驗收並取得必要人審。

## 已知 blocker

- `web/` 的 React 19 與 SPEC 對齊；仍沒有 integration 或 E2E 設定。
- `.github/workflows/ci.yml` 在 repo root 執行 npm 命令，但 package.json 位於 `web/`；修正 CI 前不得宣稱 GHA 四 jobs 全綠。
