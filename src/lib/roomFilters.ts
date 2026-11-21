import type { Room } from '@/data/rooms';

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
