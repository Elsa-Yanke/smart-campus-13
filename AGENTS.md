# AGENTS.md - Smart Campus Room Availability Checker

Instructions for any AI coding agent (Bolt.new, Claude, Codex, Cursor) working in this repository.
If your tool does not load this file automatically, the human will paste it into the prompt.

## 1. Purpose and scope
- One-page React + TypeScript app that checks whether a fictional campus room is free for a requested time slot.
- It only CHECKS availability. It never creates, edits or deletes bookings.
- Out of scope: login, payments, backend, database, live APIs, real personal data.

## 2. Architecture
| Path | Responsibility |
|------|----------------|
| `src/main.tsx` | entry point, renders `App` |
| `src/App.tsx` | UI state (inputs, selected room, result) and event handlers |
| `src/data/rooms.ts` | fictional room catalog, read-only (`readonly` types + `Object.freeze`) |
| `src/lib/availability.ts` | pure rules: input parsing, validation, availability decision |
| `src/lib/roomFilters.ts` | pure rules: capacity/equipment filter, selection reconciliation |
| `src/components/*.tsx` | presentational components (form, filters, room list, time input, result panel) |
| `src/**/*.test.ts(x)` | vitest tests (unit + one UI integration file using jsdom) |

Business rules live in `src/lib` as pure functions. Components must not duplicate rule logic.

## 3. Acceptance criteria (must stay true after every change)
- **AC1 Valid interval:** `0 <= start < end <= 1440` and `start > now`; otherwise Unavailable with "Invalid request" and a field message.
- **AC2 Duration:** at most 120 minutes (120 allowed, 121 rejected).
- **AC3 Blocked room:** a blocked room (B202) is always Unavailable, also when it matches the filters.
- **AC4 Overlap:** overlap with an existing booking of the SELECTED room is Unavailable; touching endpoints (e.g. 660-720 after 600-660) are allowed.
- **AC5 Read-only data and live result:** booking data is never mutated; changing the selected room re-evaluates the shown result for the new room.

## 4. Setup and safe commands
Node.js 18+ and npm. Install from the lockfile only:
```
npm ci
npm run dev          # local dev server
npm run typecheck    # tsc --noEmit -p tsconfig.app.json
npm run lint         # eslint .
npm test             # vitest run (55+ tests)
npm run build        # vite build -> dist/
```
These commands are safe to run at any time. Report the real output (pass/fail totals), never a summary from memory.

## 5. Coding conventions
- TypeScript strict mode; no `any`; keep data types `readonly`.
- Import project modules with the `@/` alias (`@/lib/availability`).
- Prefer small pure functions and minimal diffs. One change per task.
- Do not add a design pattern unless a concrete maintainability problem is named first.
- UI text in English; times are whole minutes after midnight.

## 6. Test expectations
- Every bug fix gets a regression test that fails before and passes after.
- Do not delete, skip (`.skip`, `.only`) or weaken existing assertions to make tests pass.
- A change is done only when typecheck, test and build pass; state any lint error that remains.

## 7. Forbidden actions
- No secrets, API keys, `.env` values or real personal data in code, tests or prompts.
- No production deployment or Publish, and no git push/force-push, without explicit human approval.
- No destructive commands: `rm -rf`, deleting tests or data files, `git reset --hard`, `npm audit fix --force`.
- No new, removed or upgraded dependencies (package.json / package-lock.json) unless the task explicitly asks for it and the human reviews the diff.
- No backend, database, auth or network calls (Supabase is NOT used by this project).
- Do not edit `src/data/rooms.ts` bookings or the acceptance criteria unless asked.

## 8. Review gates
1. Before editing: list the files you plan to change and why.
2. After editing: show the diff summary (files, functions, lines) and the real output of typecheck, lint, test, build.
3. A human reviews the diff and the test output and approves before the change is kept, published or merged.
4. Read-only tasks (review, analysis) must not change any file.

## 9. Known open items
- Note: `.bolt/prompt` is Bolt's default template prompt ("fully featured, production-worthy"). For this repository the minimal-change rules in this file take priority.
