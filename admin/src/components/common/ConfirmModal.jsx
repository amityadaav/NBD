import { AlertTriangle, X } from "lucide-react";
import "./ConfirmModal.css";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", // "danger" | "warning" | "primary"
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="cm-backdrop" onClick={loading ? null : onClose}>
      <div
        className="cm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cm-header">
          <div className={`cm-icon-wrap cm-icon-${type}`}>
            <AlertTriangle size={22} />
          </div>
          <button
            className="cm-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="cm-body">
          <h3 id="cm-title">{title}</h3>
          <p>{message}</p>
        </div>

        <div className="cm-actions">
          <button
            type="button"
            className="cm-btn cm-btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`cm-btn cm-btn-${type}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}