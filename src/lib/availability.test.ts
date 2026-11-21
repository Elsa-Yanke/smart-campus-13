import { describe, it, expect } from 'vitest';
import { ROOMS } from '@/data/rooms';
import type { Room } from '@/data/rooms';
import { checkAvailability, computeResult } from '@/lib/availability';

const NOW = 540;

const A101 = ROOMS.find((r) => r.id === 'A101') as Room;
const A102 = ROOMS.find((r) => r.id === 'A102') as Room;
const B201 = ROOMS.find((r) => r.id === 'B201') as Room;
const B202 = ROOMS.find((r) => r.id === 'B202') as Room;

function unavailable(r: { kind: string }) {
  expect(r.kind).toBe('unavailable');
}

function available(r: { kind: string }) {
  expect(r.kind).toBe('available');
}

describe('availability regression tests', () => {
  it('AC1 start equals now (540-570) -> Unavailable', () => {
    const r = checkAvailability(NOW, 540, 570, A101);
    unavailable(r);
  });

  it('AC1 reversed interval (700-650) -> Unavailable', () => {
    const r = checkAvailability(NOW, 700, 650, A101);
    unavailable(r);
  });

  it('AC1 end after day end (1400-1441) -> Unavailable', () => {
    const r = checkAvailability(NOW, 1400, 1441, A101);
    unavailable(r);
  });

  it('AC2 exactly 120 minutes on A101 (720-840) -> Available', () => {
    const r = checkAvailability(NOW, 720, 840, A101);
    available(r);
  });

  it('AC2 121 minutes on A101 (720-841) -> Unavailable', () => {
    const r = checkAvailability(NOW, 720, 841, A101);
    unavailable(r);
  });

  it('AC3 blocked room B202, valid slot 720-780 -> Unavailable', () => {
    const r = checkAvailability(NOW, 720, 780, B202);
    unavailable(r);
    expect(r.message).toContain('blocked');
  });

  it('AC4 touching on A101 (660-720) -> Available', () => {
    const r = checkAvailability(NOW, 660, 720, A101);
    available(r);
  });

  it('AC4 overlap on A101 (630-690) -> Unavailable', () => {
    const r = checkAvailability(NOW, 630, 690, A101);
    unavailable(r);
    expect(r.message).toContain('Overlaps existing booking');
  });

  it('AC5 the ROOMS catalog is deep-equal to a copy taken before all checks', () => {
    const snapshot: typeof ROOMS = [
      { id: 'A101', name: 'Seminar Room A101', capacity: 20, equipment: ['projector', 'whiteboard'], blocked: false, bookings: [{ start: 600, end: 660 }] },
      { id: 'A102', name: 'Computer Lab A102', capacity: 30, equipment: ['projector', 'computers', 'whiteboard'], blocked: false, bookings: [{ start: 720, end: 780 }, { start: 900, end: 960 }] },
      { id: 'B201', name: 'Meeting Room B201', capacity: 6, equipment: ['whiteboard', 'display'], blocked: false, bookings: [{ start: 630, end: 690 }] },
      { id: 'B202', name: 'Lecture Hall B202', capacity: 80, equipment: ['projector', 'microphone', 'whiteboard'], blocked: true, bookings: [] },
      { id: 'C301', name: 'Video Studio C301', capacity: 10, equipment: ['camera', 'microphone', 'display'], blocked: false, bookings: [{ start: 660, end: 780 }] },
    ] as unknown as typeof ROOMS;

    expect(ROOMS).toEqual(snapshot);
  });

  it('AC5 chosen room data: 630-690 is Available on A102', () => {
    const r = checkAvailability(NOW, 630, 690, A102);
    available(r);
  });

  it('AC5 chosen room data: 630-690 is Unavailable on A101', () => {
    const r = checkAvailability(NOW, 630, 690, A101);
    unavailable(r);
  });

  it('AC5 chosen room data: 630-690 is Unavailable on B201', () => {
    const r = checkAvailability(NOW, 630, 690, B201);
    unavailable(r);
  });
});

describe('result reason', () => {
  it('reason ok — available result has reason "ok"', () => {
    const r = checkAvailability(NOW, 700, 760, A101);
    expect(r.kind).toBe('available');
    expect(r.reason).toBe('ok');
  });

  it('reason invalid — start equals now has reason "invalid"', () => {
    const r = checkAvailability(NOW, 540, 570, A101);
    expect(r.kind).toBe('unavailable');
    expect(r.reason).toBe('invalid');
  });

  it('reason blocked — blocked room B202 has reason "blocked"', () => {
    const r = checkAvailability(NOW, 720, 780, B202);
    expect(r.kind).toBe('unavailable');
    expect(r.reason).toBe('blocked');
  });

  it('reason too-long — 121-minute slot has reason "too-long"', () => {
    const r = checkAvailability(NOW, 720, 841, A101);
    expect(r.kind).toBe('unavailable');
    expect(r.reason).toBe('too-long');
  });

  it('reason overlap — overlapping slot on A101 has reason "overlap"', () => {
    const r = checkAvailability(NOW, 630, 690, A101);
    expect(r.kind).toBe('unavailable');
    expect(r.reason).toBe('overlap');
  });

  it('computeResult returns field errors for an invalid request', () => {
    const { result, errors } = computeResult('540', '540', '570', A101);
    expect(result.reason).toBe('invalid');
    expect(errors.start).toBeDefined();
  });
});
