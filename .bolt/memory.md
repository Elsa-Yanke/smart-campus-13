# Project memory

## Product intent & audience

- Room-based web application (rooms, room selection); broader feature set not yet fully inferred.

## Brand personality & voice

- Production-grade; beautiful, non-cookie-cutter designs per user direction.

## Visual design & UX direction

- Stack: Vite + React (JSX), Tailwind CSS, Lucide React icons, React hooks.
- Path alias: `@/` → `src/` (use `@/components/Foo`, not deep relative paths).
- No additional UI theme or icon packages unless explicitly requested or absolutely necessary.

## Decisions, constraints & rationale

- Follow `AGENTS.md` for task workflow/instructions.
- Available npm scripts: `typecheck`, `test`, `build`.
- `@supabase/supabase-js` was removed (unused in `src/`, carried high-severity `ws` vuln via `@supabase/realtime-js`); `package.json` and `package-lock.json` updated accordingly.
- Build footprint: ~1576 modules transformed successfully.
- Test suite: 60 tests passing.

## Open questions & assumptions

- Pre-existing failing test in `App.test.tsx` (F5 UI scenario): `handleSelectRoom` clears the result before the F5 effect can recompute — application bug, not caused by dependency removal. Needs investigation/fix.