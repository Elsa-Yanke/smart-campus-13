import { Users, Wrench } from 'lucide-react';

const EQUIPMENT_ITEMS = ['projector', 'whiteboard', 'computers', 'microphone', 'camera', 'display'] as const;

type RoomFiltersProps = {
  attendees: string;
  requiredEquipment: string[];
  error?: string;
  onAttendeesChange: (value: string) => void;
  onEquipmentToggle: (eq: string) => void;
};

export function RoomFilters({
  attendees,
  requiredEquipment,
  error,
  onAttendeesChange,
  onEquipmentToggle,
}: RoomFiltersProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="mb-3 flex items-center gap-2 text-slate-700">
        <Users className="h-4 w-4 text-sky-600" />
        <h3 className="text-sm font-semibold">Requirements</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="attendees" className="mb-1.5 block text-sm font-medium text-slate-700">
            Attendees
          </label>
          <input
            id="attendees"
            type="number"
            min="0"
            value={attendees}
            onChange={(e) => onAttendeesChange(e.target.value)}
            aria-invalid={error ? true : undefined}
            className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 ${
              error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-sky-500'
            }`}
          />
          {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-slate-700">
            <Wrench className="h-4 w-4 text-sky-600" />
            <span className="text-sm font-medium">Required equipment</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {EQUIPMENT_ITEMS.map((eq) => (
              <label
                key={eq}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={requiredEquipment.includes(eq)}
                  onChange={() => onEquipmentToggle(eq)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="capitalize">{eq}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
