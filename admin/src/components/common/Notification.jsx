import { useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export default function Notification({
  message,
  type = "success", // "success" | "error" | "info"
  onClose,
  duration = 4000,
}) {
  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
  };

  const colors = {
    success: { bg: "hsl(150 55% 96%)", border: "hsl(150 55% 82%)", text: "hsl(152 55% 30%)" },
    error: { bg: "hsl(0 84% 97%)", border: "hsl(0 84% 88%)", text: "hsl(0 72% 44%)" },
    info: { bg: "hsl(205 78% 96%)", border: "hsl(205 78% 86%)", text: "hsl(205 78% 36%)" },
  };

  const theme = colors[type];

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 16px",
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        borderRadius: "10px",
        color: theme.text,
        boxShadow: "0 8px 24px -8px rgba(15, 23, 42, 0.15)",
        animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        fontFamily: "Inter, sans-serif",
        maxWidth: "360px",
      }}
    >
      {icons[type]}
      <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 500, flex: 1 }}>
        {message}
      </p>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "currentColor",
          opacity: 0.6,
          padding: 0,
          display: "flex",
        }}
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}