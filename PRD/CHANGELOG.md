# CHANGELOG

## International product direction / 2026-09-24

- Reworked `web/ui-prototype.html` from a generic pastel dashboard into a Careboard command surface with a dark editorial shell, focus queue, resident context dock, care-network switching, locale/role controls, timezone metadata, and explicit local-only status.
- Added productization requirements to `PRD/UI-SPEC.md`: locale-neutral data, status taxonomy, provenance/sync visibility, responsive role views, and translation-ready copy.

## UI prototype / 2026-09-24

- Added `PRD/UI-SPEC.md` with competitor benchmark, M1 information architecture, visual system, and interaction boundaries.
- Added standalone `web/ui-prototype.html` for the care-manager dashboard concept.
- Prototype uses mock data only; no React implementation, real notifications, phone calls, credentials, or personal data.

## Governance baseline / 2026-09-24

- Added project-level `AGENTS.md`, `SOP.md`, `STATUS.md`, and bounded M1 `GOAL.md`.
- Recorded the current scaffold verification evidence and three-way alignment limits.
- No production code, external integration, deployment, or real personal data was changed.

## v3.0.2 / 2026-09-19

- PRD/SPEC.md: 9-section v3.0.2 specification
- .github/workflows/ci.yml: 4-job CI (lint / test / build / deploy to Pages)
- Source scaffold: Vite + React 19 + TypeScript strict
- Source: Sean bulk-repo-init 2026-09-19
