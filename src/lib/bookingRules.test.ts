import { describe, it, expect } from 'vitest';
import { ROOMS } from '@/data/rooms';
import type { Room } from '@/data/rooms';
import {
  toClock,
  clampInt,
  validate,
  checkAvailability,
} from '@/lib/availability';

const A101 = ROOMS.find((r) => r.id === 'A101') as Room;
const B202 = ROOMS.find((r) => r.id === 'B202') as Room;

describe('fixtures (unchanged)', () => {
  it('ROOM is A101', () => {
    expect(A101.id).toBe('A101');
  });

  it('BOOKING is 600–660 (10:00–11:00)', () => {
    expect(A101.bookings[0]).toEqual({ start: 600, end: 660 });
    expect(toClock(A101.bookings[0].start)).toBe('10:00');
    expect(toClock(A101.bookings[0].end)).toBe('11:00');
  });
});

describe('toClock', () => {
  it('formats minutes to HH:MM', () => {
    expect(toClock(0)).toBe('00:00');
    expect(toClock(540)).toBe('09:00');
    expect(toClock(660)).toBe('11:00');
    expect(toClock(1440)).toBe('24:00');
  });
});

describe('clampInt', () => {
  it('returns null for empty string', () => {
    expect(clampInt('')).toBeNull();
    expect(clampInt('   ')).toBeNull();
  });

  it('returns null for non-integer input', () => {
    expect(clampInt('abc')).toBeNull();
    expect(clampInt('12.5')).toBeNull();
  });

  it('returns the integer for valid input', () => {
    expect(clampInt('540')).toBe(540);
    expect(clampInt('  540  ')).toBe(540);
    expect(clampInt('-10')).toBe(-10);
  });
});

describe('validate (AC1 input validation)', () => {
  // AC1: inputs must be whole numbers in [0,1440]; start < end; start > now.
  it('flags NaN values', () => {
    const errs = validate(NaN, NaN, NaN);
    expect(errs.now).toBeDefined();
    expect(errs.start).toBeDefined();
    expect(errs.end).toBeDefined();
  });

  it('flags out-of-range values', () => {
    expect(validate(-1, 100, 200).now).toBeDefined();
    expect(validate(100, -1, 200).start).toBeDefined();
    expect(validate(100, 200, 1441).end).toBeDefined();
  });

  it('flags reversed interval (start >= end)', () => {
    const errs = validate(100, 200, 200);
    expect(errs.end).toBe('End must be greater than start.');
  });

  it('flags start not strictly after now (start <= now)', () => {
    const errs = validate(100, 100, 200);
    expect(errs.start).toContain('strictly after the current time');
  });

  it('passes for valid inputs', () => {
    const errs = validate(540, 700, 760);
    expect(errs.now).toBeUndefined();
    expect(errs.start).toBeUndefined();
    expect(errs.end).toBeUndefined();
  });
});

describe('checkAvailability — regression cases', () => {
  // AC1 (via validation path): invalid input yields an unavailable result.
  it('AC1 — invalid input produces an unavailable "Invalid request" result', () => {
    const r = checkAvailability(NaN, 700, 760, A101);
    expect(r.kind).toBe('unavailable');
    expect(r.message).toContain('Invalid request');
  });

  // AC1 + start-after-now: a past-time / non-future start is rejected by validation.
  it('past time — start <= now is rejected with "strictly after" message', () => {
    // now=700, start=700 (not strictly after now) → validation error
    const r = checkAvailability(700, 700, 760, A101);
    expect(r.kind).toBe('unavailable');
    expect(r.message).toContain('strictly after the current time');
  });

  it('past time — start < now is rejected', () => {
    // now=800, start=700 (before now) → validation error
    const r = checkAvailability(800, 700, 760, A101);
    expect(r.kind).toBe('unavailable');
    expect(r.message).toContain('strictly after the current time');
  });

  // AC1 (via validation): reversed interval (start >= end) is rejected.
  it('reversed interval — end <= start is rejected with "End must be greater than start"', () => {
    const r = checkAvailability(540, 760, 700, A101);
    expect(r.kind).toBe('unavailable');
    expect(r.message).toContain('End must be greater than start');
  });

  // AC2: duration must not exceed 120 minutes.
  it('AC2 — 121-minute duration is rejected', () => {
    // start=700, end=821 → duration 121 > 120, and no overlap with 600–660.
    const r = checkAvailability(540, 700, 821, A101);
    expect(r.kind).toBe('unavailable');
    expect(r.message).toContain('121 minutes');
    expect(r.message).toContain('Maximum allowed is 120 minutes');
  });

  // AC2 boundary: exactly 120 minutes is allowed (not weakened).
  it('AC2 boundary — exactly 120-minute duration is available when no overlap', () => {
    // start=700, end=820 → duration 120, no overlap with 600–660.
    const r = checkAvailability(540, 700, 820, A101);
    expect(r.kind).toBe('available');
    expect(r.message).toContain('120 min');
  });

  // AC3: a blocked room is always rejected, regardless of time validity.
  it('AC3 — blocked room is rejected even with a valid, non-overlapping slot', () => {
    const r = checkAvailability(540, 700, 760, B202);
    expect(r.kind).toBe('unavailable');
    expect(r.message).toContain('blocked');
  });

  // AC4: overlap with the existing booking is rejected.
  it('AC4 — overlap with existing booking (600–660) is rejected', () => {
    // start=630, end=700 overlaps [600,660); duration 70 <= 120.
    const r = checkAvailability(540, 630, 700, A101);
    expect(r.kind).toBe('unavailable');
    expect(r.message).toContain('Overlaps existing booking');
    expect(r.message).toContain('10:00–11:00');
  });

  // AC4 boundary: touching endpoints do NOT overlap (start == booking.end is allowed).
  it('AC4 boundary — touching at start == booking.end (660) is available', () => {
    // start=660, end=720 touches the existing booking's end; duration 60 <= 120.
    const r = checkAvailability(540, 660, 720, A101);
    expect(r.kind).toBe('available');
    expect(r.message).toContain('available from 11:00 to 12:00');
  });

  // AC4 boundary: touching at end == BOOKING.start is allowed.
  it('AC4 boundary — touching at end == booking.start (600) is available', () => {
    // start=540 (strictly after now=540? No — 540 <= 540 would fail).
    // Use now=400, start=500, end=600 → duration 100, touches BOOKING.start.
    const r = checkAvailability(400, 500, 600, A101);
    expect(r.kind).toBe('available');
    expect(r.message).toContain('available from 08:20 to 10:00');
  });

  // AC5: a valid, non-overlapping, within-limit slot is available.
  it('AC5 — valid non-overlapping slot is available', () => {
    const r = checkAvailability(540, 700, 760, A101);
    expect(r.kind).toBe('available');
    expect(r.message).toContain('Room A101 is available');
    expect(r.message).toContain('60 min');
  });

  // AC6 (implied): invalid input always returns kind 'unavailable' with a message.
  it('AC6 — invalid input never returns an available result', () => {
    const cases: Parameters<typeof checkAvailability>[] = [
      [NaN, 700, 760, A101],
      [540, NaN, 760, A101],
      [540, 700, NaN, A101],
      [-1, 700, 760, A101],
      [540, -1, 760, A101],
      [540, 700, 1441, A101],
      [540, 760, 700, A101],
      [700, 700, 760, A101],
    ];
    for (const args of cases) {
      const r = checkAvailability(...args);
      expect(r.kind).toBe('unavailable');
      expect(r.message.length).toBeGreaterThan(0);
    }
  });
});
