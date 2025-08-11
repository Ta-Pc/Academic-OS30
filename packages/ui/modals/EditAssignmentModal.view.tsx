import React, { useEffect, useRef } from 'react';

export type EditAssignmentModalViewProps = {
  open: boolean;
  title: string;
  initialValue: number | null;
  onChange: (value: number | null) => void;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
  error?: string | null;
};

/**
 * Presentational accessible modal for editing a single assignment score (%).
 * No persistence logic. Caller controls open prop & state.
 */
export function EditAssignmentModalView({ open, title, initialValue, onChange, onSave, onCancel, saving, error }: EditAssignmentModalViewProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastActive = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = React.useState<string>(initialValue == null ? '' : String(initialValue));

  useEffect(() => { setValue(initialValue == null ? '' : String(initialValue)); }, [initialValue, open]);

  useEffect(() => {
    if (open) {
      lastActive.current = (document.activeElement as HTMLElement) || null;
      setTimeout(() => inputRef.current?.focus(), 10);
  const keyHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onCancel(); } };
  window.addEventListener('keydown', keyHandler);
  return () => window.removeEventListener('keydown', keyHandler);
    } else if (lastActive.current) {
      lastActive.current.focus();
    }
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-slate-900/40" onClick={() => !saving && onCancel()} />
      <div ref={dialogRef} className="relative mx-auto mt-24 w-full max-w-sm">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-700">{title}</div>
            <button className="btn btn-secondary btn-sm" onClick={onCancel} aria-label="Close edit assignment modal">×</button>
          </div>
          <div className="card-body space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Score (%)
              <input
                ref={inputRef}
                type="number"
                className="input mt-1"
                value={value}
                min={0}
                max={100}
                step="0.01"
                data-testid="score-input"
                onChange={(e) => { setValue(e.target.value); onChange(e.target.value === '' ? null : Number(e.target.value)); }}
              />
            </label>
            {error && <div className="text-danger-600 text-sm" role="alert">{error}</div>}
            <div className="flex justify-end gap-2">
              <button className="btn btn-ghost" disabled={!!saving} onClick={onCancel}>Cancel</button>
              <button className="btn btn-primary" data-testid="save-score" disabled={!!saving} onClick={onSave}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
