import { DoorOpen, CalendarClock } from 'lucide-react';
import type { Errors } from '@/lib/availability';
import { TimeInput } from './TimeInput';
import { RoomFilters } from './RoomFilters';
import { RoomList } from './RoomList';
import type { Room } from '@/data/rooms';

type AvailabilityFormProps = {
  attendees: string;
  requiredEquipment: string[];
  filteredRooms: Room[];
  selectedId: string | null;
  noMatch: boolean;
  attendeesError: string | null;
  now: string;
  start: string;
  end: string;
  errors: Errors;
  onAttendeesChange: (value: string) => void;
  onEquipmentToggle: (eq: string) => void;
  onSelectRoom: (id: string) => void;
  onNowChange: (value: string) => void;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onCheck: () => void;
  onReset: () => void;
};

export function AvailabilityForm({
  attendees,
  requiredEquipment,
  filteredRooms,
  selectedId,
  noMatch,
  attendeesError,
  now,
  start,
  end,
  errors,
  onAttendeesChange,
  onEquipmentToggle,
  onSelectRoom,
  onNowChange,
  onStartChange,
  onEndChange,
  onCheck,
  onReset,
}: AvailabilityFormProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:col-span-3">
      <div className="mb-4 flex items-center gap-2 text-slate-700">
        <DoorOpen className="h-5 w-5 text-sky-600" />
        <h2 className="text-base font-semibold">Check Room Availability</h2>
      </div>

      <div className="space-y-5">
        <RoomFilters
          attendees={attendees}
          requiredEquipment={requiredEquipment}
          error={attendeesError ?? undefined}
          onAttendeesChange={onAttendeesChange}
          onEquipmentToggle={onEquipmentToggle}
        />

        <RoomList
          rooms={filteredRooms}
          selectedId={selectedId}
          noMatch={noMatch}
          onSelectRoom={onSelectRoom}
        />

        <TimeInput
          id="now"
          label="Current time (minutes)"
          value={now}
          placeholder="e.g. 540"
          error={errors.now}
          hint="0–1440. Default is 540 (09:00)."
          onChange={onNowChange}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TimeInput
            id="start"
            label="Start (minutes)"
            value={start}
            placeholder="e.g. 700"
            error={errors.start}
            onChange={onStartChange}
          />
          <TimeInput
            id="end"
            label="End (minutes)"
            value={end}
            placeholder="e.g. 760"
            error={errors.end}
            onChange={onEndChange}
          />
        </div>

        <p className="text-xs text-slate-400">
          0 ≤ start &lt; end ≤ 1440. Max duration 120 minutes. Start must be after the current time.
        </p>

        <div className="flex flex-col gap-3 pt-1 sm:flex-row">
          <button
            type="button"
            onClick={onCheck}
            disabled={noMatch || attendeesError !== null}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <CalendarClock className="h-4 w-4" />
            Check availability
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}
