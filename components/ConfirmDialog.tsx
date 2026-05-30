"use client";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirming: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  title,
  message,
  confirming,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
        <h2 id="confirm-title" className="text-lg font-semibold text-slate-950">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={onCancel}
            disabled={confirming}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
            onClick={onConfirm}
            disabled={confirming}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
