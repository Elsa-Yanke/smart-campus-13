import type { Room } from '@/data/rooms';

export const ATTENDEES_ERROR = 'Enter a whole number of attendees (1-1000).';

export function validateAttendees(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed === '') return ATTENDEES_ERROR;
  if (!/^-?\d+$/.test(trimmed)) return ATTENDEES_ERROR;
  const n = Number(trimmed);
  if (n < 1 || n > 1000) return ATTENDEES_ERROR;
  return null;
}

export function filterRooms(
  rooms: readonly Room[],
  attendees: number,
  requiredEquipment: readonly string[],
): Room[] {
  return rooms.filter(
    (room) =>
      room.capacity >= attendees &&
      requiredEquipment.every((eq) => room.equipment.includes(eq)),
  );
}

export function reconcileSelection(
  filteredRooms: readonly Room[],
  selectedId: string | null,
): string | null {
  if (filteredRooms.length === 0) return null;
  if (selectedId !== null && filteredRooms.some((r) => r.id === selectedId)) {
    return selectedId;
  }
  return filteredRooms[0].id;
}
