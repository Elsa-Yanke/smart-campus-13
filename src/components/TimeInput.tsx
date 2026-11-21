import type { Errors } from '@/lib/availability';

type TimeInputProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  hint?: string;
  onChange: (value: string) => void;
};

const fieldBase =
  'w-full rounded-lg border bg-white px-3.5 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-0';

export function TimeInput({
  id,
  label,
  value,
  placeholder,
  error,
  hint,
  onChange,
}: TimeInputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${fieldBase} ${
          error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-sky-500'
        }`}
      />
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export type { Errors };
