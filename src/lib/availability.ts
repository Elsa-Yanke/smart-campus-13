import type { Room } from '@/data/rooms';

export type ResultReason = 'ok' | 'invalid' | 'blocked' | 'too-long' | 'overlap';

export type Result =
  | { kind: 'available'; reason: 'ok'; message: string }
  | { kind: 'unavailable'; reason: Exclude<ResultReason, 'ok'>; message: string };

export type Errors = { now?: string; start?: string; end?: string };

export function toClock(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function clampInt(raw: string): number | null {
  if (raw.trim() === '') return null;
  if (!/^-?\d+$/.test(raw.trim())) return null;
  return Number(raw.trim());
}

export function validateInterval(
  nowMin: number,
  startMin: number,
  endMin: number,
): Errors {
  const errs: Errors = {};

  if (Number.isNaN(nowMin)) {
    errs.now = 'Enter a whole number of minutes (0–1440).';
  } else if (nowMin < 0 || nowMin > 1440) {
    errs.now = 'Current time must be between 0 and 1440.';
  }

  if (Number.isNaN(startMin)) {
    errs.start = 'Enter a whole number of minutes (0–1440).';
  } else if (startMin < 0 || startMin > 1440) {
    errs.start = 'Start must be between 0 and 1440.';
  }

  if (Number.isNaN(endMin)) {
    errs.end = 'Enter a whole number of minutes (0–1440).';
  } else if (endMin < 0 || endMin > 1440) {
    errs.end = 'End must be between 0 and 1440.';
  }

  if (!errs.start && !errs.end && !Number.isNaN(startMin) && !Number.isNaN(endMin)) {
    if (startMin >= endMin) {
      errs.end = 'End must be greater than start.';
    }
  }

  if (
    !errs.now &&
    !errs.start &&
    !Number.isNaN(nowMin) &&
    !Number.isNaN(startMin) &&
    startMin <= nowMin
  ) {
    errs.start = `Start must be strictly after the current time (${nowMin}).`;
  }

  return errs;
}

export const validate = validateInterval;

export function checkAvailability(
  nowMin: number,
  startMin: number,
  endMin: number,
  room: Room,
): Result {
  const errs = validateInterval(nowMin, startMin, endMin);
  if (Object.keys(errs).length > 0) {
    const reason = [errs.now, errs.start, errs.end].filter(Boolean).join(' ');
    return {
      kind: 'unavailable',
      reason: 'invalid',
      message: `Invalid request: ${reason}`,
    };
  }

  if (room.blocked) {
    return {
      kind: 'unavailable',
      reason: 'blocked',
      message: `Room ${room.id} is currently blocked and cannot be booked.`,
    };
  }

  const duration = endMin - startMin;
  if (duration > 120) {
    return {
      kind: 'unavailable',
      reason: 'too-long',
      message: `Requested duration is ${duration} minutes. Maximum allowed is 120 minutes.`,
    };
  }

  const firstOverlap = room.bookings.find(
    (b) => startMin < b.end && endMin > b.start,
  );
  if (firstOverlap) {
    return {
      kind: 'unavailable',
      reason: 'overlap',
      message: `Overlaps existing booking (${toClock(firstOverlap.start)}–${toClock(firstOverlap.end)}).`,
    };
  }

  return {
    kind: 'available',
    reason: 'ok',
    message: `Room ${room.id} is available from ${toClock(startMin)} to ${toClock(endMin)} (${duration} min).`,
  };
}

export function computeResult(
  now: string,
  start: string,
  end: string,
  room: Room,
): { result: Result; errors: Errors } {
  const nowMin = clampInt(now);
  const startMin = clampInt(start);
  const endMin = clampInt(end);

  const result = checkAvailability(
    nowMin ?? NaN,
    startMin ?? NaN,
    endMin ?? NaN,
    room,
  );

  const errors: Errors =
    result.reason === 'invalid'
      ? validateInterval(nowMin ?? NaN, startMin ?? NaN, endMin ?? NaN)
      : {};

  return { result, errors };
}
