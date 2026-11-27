import { describe, it, expect } from 'vitest';
import { ROOMS } from '@/data/rooms';
import type { Room } from '@/data/rooms';
import { filterRooms, reconcileSelection, validateAttendees } from '@/lib/roomFilters';
import { checkAvailability } from '@/lib/availability';

const NOW = 540;

const B202 = ROOMS.find((r) => r.id === 'B202') as Room;

describe('filterRooms', () => {
  it('F1 attendees 20 includes A101 (exact capacity)', () => {
    const result = filterRooms(ROOMS, 20, []);
    expect(result.some((r) => r.id === 'A101')).toBe(true);
  });

  it('F1 attendees 21 excludes A101 (insufficient capacity)', () => {
    const result = filterRooms(ROOMS, 21, []);
    expect(result.some((r) => r.id === 'A101')).toBe(false);
  });

  it('F2 [projector, computers] returns only A102', () => {
    const result = filterRooms(ROOMS, 0, ['projector', 'computers']);
    expect(result.map((r) => r.id)).toEqual(['A102']);
  });

  it('F2 [camera, projector] returns no room (a partial match is not enough)', () => {
    const result = filterRooms(ROOMS, 0, ['camera', 'projector']);
    expect(result).toEqual([]);
  });

  it('F3 attendees 50 returns B202, and checkAvailability for B202 is Unavailable for slots 600-660, 720-780 and 900-1000', () => {
    const result = filterRooms(ROOMS, 50, []);
    expect(result.map((r) => r.id)).toEqual(['B202']);

    const slots: [number, number][] = [[600, 660], [720, 780], [900, 1000]];
    for (const [s, e] of slots) {
      const r = checkAvailability(NOW, s, e, B202);
      expect(r.kind).toBe('unavailable');
      expect(r.message).toContain('blocked');
    }
  });

  it('F4 attendees 100 returns an empty list', () => {
    const result = filterRooms(ROOMS, 100, []);
    expect(result).toEqual([]);
  });

  it('F1 — returns only rooms with capacity >= attendees', () => {
    const result = filterRooms(ROOMS, 25, []);
    expect(result.every((r) => r.capacity >= 25)).toBe(true);
    expect(result.map((r) => r.id).sort()).toEqual(['A102', 'B202']);
  });

  it('F1 boundary — capacity exactly equal to attendees is included', () => {
    const result = filterRooms(ROOMS, 20, []);
    expect(result.some((r) => r.id === 'A101')).toBe(true);
  });

  it('F2 — returns only rooms containing ALL required equipment', () => {
    const result = filterRooms(ROOMS, 0, ['projector', 'whiteboard']);
    expect(result.map((r) => r.id).sort()).toEqual(['A101', 'A102', 'B202']);
  });

  it('F2 — room missing one required item is excluded', () => {
    const result = filterRooms(ROOMS, 0, ['projector', 'microphone']);
    expect(result.map((r) => r.id)).toEqual(['B202']);
  });

  it('F2 — empty required equipment matches all rooms', () => {
    const result = filterRooms(ROOMS, 0, []);
    expect(result.length).toBe(ROOMS.length);
  });

  it('F1 + F2 combined — capacity and equipment both applied', () => {
    const result = filterRooms(ROOMS, 30, ['projector', 'whiteboard']);
    expect(result.map((r) => r.id)).toEqual(['A102', 'B202']);
  });

  it('F3 — blocked rooms stay in the list (shown but never available)', () => {
    const result = filterRooms(ROOMS, 0, ['projector']);
    expect(result.some((r) => r.id === 'B202' && r.blocked)).toBe(true);
  });

  it('returns empty array when no room matches', () => {
    const result = filterRooms(ROOMS, 100, []);
    expect(result).toEqual([]);
  });
});

describe('validateAttendees', () => {
  it('rejects empty input', () => {
    expect(validateAttendees('')).not.toBeNull();
  });

  it('rejects -5', () => {
    expect(validateAttendees('-5')).not.toBeNull();
  });

  it('rejects 2.5', () => {
    expect(validateAttendees('2.5')).not.toBeNull();
  });

  it('rejects 1001', () => {
    expect(validateAttendees('1001')).not.toBeNull();
  });

  it('accepts boundary values 1 and 1000', () => {
    expect(validateAttendees('1')).toBeNull();
    expect(validateAttendees('1000')).toBeNull();
  });
});

describe('reconcileSelection', () => {
  it('F5 reconcileSelection keeps a still-visible id', () => {
    const filtered = filterRooms(ROOMS, 0, []);
    expect(reconcileSelection(filtered, 'A102')).toBe('A102');
  });

  it('F5 reconcileSelection falls back to the first room', () => {
    const filtered = filterRooms(ROOMS, 0, []);
    expect(reconcileSelection(filtered, 'ZZ999')).toBe(filtered[0].id);
  });

  it('F5 reconcileSelection returns null for an empty list', () => {
    expect(reconcileSelection([], 'A101')).toBeNull();
    expect(reconcileSelection([], null)).toBeNull();
  });

  it('returns first room id if selectedId is null', () => {
    const filtered = filterRooms(ROOMS, 0, []);
    expect(reconcileSelection(filtered, null)).toBe(filtered[0].id);
  });
});
