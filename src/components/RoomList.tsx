import { Ban } from 'lucide-react';
import type { Room } from '@/data/rooms';

type RoomListProps = {
  rooms: Room[];
  selectedId: string | null;
  noMatch: boolean;
  onSelectRoom: (id: string) => void;
};

export function RoomList({ rooms, selectedId, noMatch, onSelectRoom }: RoomListProps) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-slate-700">Available rooms</h3>

      {noMatch ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-4 text-center">
          <p className="text-sm text-slate-500">No rooms match your requirements</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rooms.map((room) => {
            const isSelected = room.id === selectedId;
            return (
              <li key={room.id}>
                <button
                  type="button"
                  onClick={() => onSelectRoom(room.id)}
                  className={`w-full rounded-xl border p-3.5 text-left transition ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{room.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Capacity: {room.capacity}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {room.equipment.join(', ')}
                      </p>
                    </div>
                    {room.blocked && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                        <Ban className="h-3 w-3" />
                        Blocked
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
