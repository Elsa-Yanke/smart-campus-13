# Smart Campus Room Availability Checker

Software Engineering - Assignment #05 - Yanke Elza (24B031131)

A one-page React + TypeScript (Vite, Tailwind) app that checks whether a fictional campus room is free for a requested time slot.
It does not create bookings. No login, backend, database or live APIs. All data is fictional.

- Bolt project: https://bolt.new/~/sb1-ik7fyvxa
- Agent instructions: [AGENTS.md](AGENTS.md)

## Rules (acceptance criteria)
Times are whole minutes after midnight; the current time is a fixed input (default 540 = 09:00).

| ID | Rule |
|----|------|
| AC1 | `0 <= start < end <= 1440` and start strictly after the current time |
| AC2 | duration at most 120 minutes (120 allowed, 121 rejected) |
| AC3 | a blocked room is always Unavailable |
| AC4 | overlap with a booking of the selected room is Unavailable; touching endpoints are allowed |
| AC5 | booking data is read-only; changing the selected room re-evaluates the shown result |

Rooms can be filtered by attendees (capacity) and required equipment.

## Room catalog (`src/data/rooms.ts`)
| ID | Capacity | Equipment | Blocked | Bookings |
|----|----------|-----------|---------|----------|
| A101 | 20 | projector, whiteboard | no | 600-660 |
| A102 | 30 | projector, computers, whiteboard | no | 720-780, 900-960 |
| B201 | 6 | whiteboard, display | no | 630-690 |
| B202 | 80 | projector, microphone, whiteboard | yes | - |
| C301 | 10 | camera, microphone, display | no | 660-780 |

## Setup, run, test
Requires Node.js 18+ and npm.
```
npm ci
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
```

## Project structure
```
src/
  main.tsx              entry point
  App.tsx               UI state and handlers
  data/rooms.ts         read-only fictional catalog
  lib/availability.ts   validation + availability decision (pure)
  lib/roomFilters.ts    capacity/equipment filter + selection (pure)
  components/           form, filters, room list, time input, result panel
  **/*.test.ts(x)       vitest unit tests + UI integration test (jsdom)
```
