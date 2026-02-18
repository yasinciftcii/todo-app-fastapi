import { AlertTriangle, Trash2 } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start gap-3 p-5">
          <div
            className={[
              "mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl",
              danger ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-800",
            ].join(" ")}
          >
            {danger ? <Trash2 size={18} /> : <AlertTriangle size={18} />}
          </div>

          <div className="flex-1">
            <div className="text-base font-semibold text-gray-900">{title}</div>
            {description ? (
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={[
              "rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60",
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-900 hover:bg-black",
            ].join(" ")}
          >
            {loading ? "Working..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
