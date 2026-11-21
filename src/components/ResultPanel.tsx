import { Clock, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import type { Room } from '@/data/rooms';
import type { Result } from '@/lib/availability';
import { toClock } from '@/lib/availability';

type ResultPanelProps = {
  selectedRoom: Room | null;
  result: Result | null;
};

function formatBooking(b: { start: number; end: number }): string {
  return `${toClock(b.start)}–${toClock(b.end)} (${b.start}–${b.end})`;
}

export function ResultPanel({ selectedRoom, result }: ResultPanelProps) {
  return (
    <aside aria-live="polite" className="flex flex-col gap-6 md:col-span-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-slate-700">
          <Clock className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Existing bookings
          </h3>
        </div>

        {selectedRoom ? (
          <>
            <p className="text-sm font-medium text-slate-700">{selectedRoom.name}</p>
            <p className="text-xs text-slate-400">Read-only — not editable.</p>
            {selectedRoom.blocked && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                <ShieldAlert className="h-3 w-3" />
                Blocked
              </div>
            )}
            {selectedRoom.bookings.length > 0 ? (
              <ul className="mt-3 space-y-1.5">
                {selectedRoom.bookings.map((b, i) => (
                  <li
                    key={i}
                    className="rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700"
                  >
                    {formatBooking(b)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-400">
                No existing bookings.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-400">No room selected.</p>
        )}
      </div>

      {result && (
        <div
          className={`rounded-2xl border p-5 shadow-sm transition ${
            result.kind === 'available'
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-red-200 bg-red-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {result.kind === 'available' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 text-red-600" />
            )}
            <h3
              className={`text-base font-semibold ${
                result.kind === 'available' ? 'text-emerald-800' : 'text-red-800'
              }`}
            >
              {result.kind === 'available' ? 'Available' : 'Unavailable'}
            </h3>
          </div>
          <p
            className={`mt-2 text-sm ${
              result.kind === 'available' ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            {result.message}
          </p>
        </div>
      )}

      {!result && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 text-center">
          <p className="text-sm text-slate-400">
            Fill in a time slot and tap <span className="font-medium text-slate-500">Check availability</span>.
          </p>
        </div>
      )}
    </aside>
  );
}
