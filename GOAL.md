# Goal — 長照安心管家 M1

## Objective

在不接觸真實個資、不宣稱醫療或合規能力的前提下，完成一個可測試的居家照護工作台骨架，讓照服員、家屬與個案管理師能看懂核心流程與下一步。

## Acceptance criteria

- AC-001：使用者能在 mock 資料下切換三種角色，且每個角色看到清楚的工作入口。
- AC-002：個案資料以 local-only mock CRUD 呈現；敏感欄位預設遮罩，刪除與清除狀態可驗證。
- AC-003：照護日誌能新增、查看、排序 timeline；每筆資料顯示來源與時間。
- AC-004：排班週視圖能顯示至少一個衝突案例，並以 deterministic 規則標示衝突。
- AC-005：P0 domain 行為有 unit tests，核心 UI 流程有 E2E；typecheck、test、build 有可重跑證據。
- AC-006：文件明確標示 local-only、非醫療診斷、非真實通知，且未寫入真實個資或 credentials。

## Out of scope

真實登入／RBAC、資料庫、雲端同步、LINE／Email／推播、SOS 實際撥號、用藥提醒服務、支付、部署與任何 production data。

## Exit gate

M1 完成前需由 Sean 覆審 scope，並通過專案 `AGENTS.md` 所列 deterministic checks；未通過不得進入外部整合或 production release。
