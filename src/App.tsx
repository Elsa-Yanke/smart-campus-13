import { useEffect, useMemo, useRef, useState } from 'react';
import { Building2 } from 'lucide-react';
import { ROOMS } from '@/data/rooms';
import type { Room } from '@/data/rooms';
import { filterRooms, reconcileSelection } from '@/lib/roomFilters';
import { clampInt, computeResult, type Result, type Errors } from '@/lib/availability';
import { AvailabilityForm } from '@/components/AvailabilityForm';
import { ResultPanel } from '@/components/ResultPanel';

type AppResult = Result | null;

export default function App() {
  const [now, setNow] = useState('540');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [attendees, setAttendees] = useState('1');
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>('A101');
  const [result, setResult] = useState<AppResult>(null);
  const [errors, setErrors] = useState<Errors>({});
  const resultRef = useRef<HTMLDivElement>(null);

  const filteredRooms = useMemo(
    () => filterRooms(ROOMS, clampInt(attendees) ?? 0, requiredEquipment),
    [attendees, requiredEquipment],
  );

  const reconciledId = useMemo(
    () => reconcileSelection(filteredRooms, selectedId),
    [filteredRooms, selectedId],
  );

  const selectedRoom: Room | null = useMemo(
    () => filteredRooms.find((r) => r.id === reconciledId) ?? null,
    [filteredRooms, reconciledId],
  );

  const noMatch = filteredRooms.length === 0;

  useEffect(() => {
    if (result) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [result]);

  useEffect(() => {
    setSelectedId(reconciledId);
  }, [reconciledId]);

  // F5: recompute when the selected room changes if a result is already shown.
  useEffect(() => {
    if (result && selectedRoom) {
      const { result: recomputed, errors: fieldErrors } = computeResult(now, start, end, selectedRoom);
      setResult(recomputed);
      setErrors(fieldErrors);
    } else if (result && !selectedRoom) {
      setResult(null);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom]);

  function resetResult() {
    setResult(null);
  }

  function handleCheck() {
    if (!selectedRoom) return;
    resetResult();
    const { result: errs, errors: fieldErrors } = computeResult(now, start, end, selectedRoom);
    setErrors(fieldErrors);
    setResult(errs);
  }

  function handleReset() {
    setNow('540');
    setStart('');
    setEnd('');
    setAttendees('1');
    setRequiredEquipment([]);
    setSelectedId('A101');
    setResult(null);
    setErrors({});
  }

  function toggleEquipment(eq: string) {
    setRequiredEquipment((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq],
    );
    resetResult();
  }

  function handleSelectRoom(id: string) {
    setSelectedId(id);
  }

  function handleNowChange(value: string) {
    setNow(value);
    resetResult();
    setErrors((p) => ({ ...p, now: undefined }));
  }

  function handleStartChange(value: string) {
    setStart(value);
    resetResult();
    setErrors((p) => ({ ...p, start: undefined }));
  }

  function handleEndChange(value: string) {
    setEnd(value);
    resetResult();
    setErrors((p) => ({ ...p, end: undefined }));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Smart Campus Room Availability
              </h1>
              <p className="text-sm text-slate-500">
                Check whether a room is free for a requested time slot.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-5">
          <AvailabilityForm
            attendees={attendees}
            requiredEquipment={requiredEquipment}
            filteredRooms={filteredRooms}
            selectedId={reconciledId}
            noMatch={noMatch}
            now={now}
            start={start}
            end={end}
            errors={errors}
            onAttendeesChange={(v) => { setAttendees(v); resetResult(); }}
            onEquipmentToggle={toggleEquipment}
            onSelectRoom={handleSelectRoom}
            onNowChange={handleNowChange}
            onStartChange={handleStartChange}
            onEndChange={handleEndChange}
            onCheck={handleCheck}
            onReset={handleReset}
          />

          <div ref={resultRef}>
            <ResultPanel selectedRoom={selectedRoom} result={result} />
          </div>
        </div>

        <footer className="mt-auto pt-8 text-center text-xs text-slate-400">
          Fictional data for demonstration. This tool checks availability only — it does not create bookings.
        </footer>
      </div>
    </div>
  );
}
