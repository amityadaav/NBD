// src/components/dashboard/ConfirmDialog.jsx
import { useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, X, Loader2 } from "lucide-react";
import "./ConfirmDialog.css";

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  children,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (open && confirmRef.current) confirmRef.current.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onCancel]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) onCancel();
  };

  return (
    <div className="confirm-dialog-backdrop" onMouseDown={handleBackdropClick}>
      <div
        className={`confirm-dialog confirm-dialog-${variant}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <button
          type="button"
          className="confirm-dialog-close"
          onClick={onCancel}
          disabled={loading}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="confirm-dialog-icon">
          {variant === "danger" ? <AlertCircle size={22} /> :
           variant === "success" ? <CheckCircle2 size={22} /> :
           <AlertCircle size={22} />}
        </div>

        <h3 id="confirm-dialog-title" className="confirm-dialog-title">{title}</h3>
        {message && <p id="confirm-dialog-message" className="confirm-dialog-message">{message}</p>}
        {children && <div className="confirm-dialog-body">{children}</div>}

        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="confirm-dialog-btn confirm-dialog-btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            ref={confirmRef}
            className={`confirm-dialog-btn confirm-dialog-btn-confirm confirm-dialog-btn-${variant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (<><Loader2 size={14} className="confirm-dialog-spin" /> Processing…</>) : (confirmLabel)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;