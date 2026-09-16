import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({
  open,
  title = "Konfirmasi",
  message = "Apakah kamu yakin ingin melanjutkan?",
  confirmText = "Hapus",
  cancelText = "Batal",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <AlertTriangle size={24} />
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {message}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Memproses..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}