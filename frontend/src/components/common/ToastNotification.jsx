import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const ICON_MAP = {
  success: { Icon: CheckCircle2, color: "var(--color-success)" },
  error: { Icon: AlertCircle, color: "var(--color-danger)" },
  info: { Icon: Info, color: "var(--color-primary)" },
};

export default function ToastNotification({ toasts = [], onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const { Icon, color } = ICON_MAP[toast.type] || ICON_MAP.info;
        return (
          <div key={toast.id} className={`toast ${toast.type || "info"}`}>
            <Icon size={18} color={color} style={{ flexShrink: 0, marginTop: 1 }} />
            <div className="toast-content">
              {toast.title && <div className="toast-title">{toast.title}</div>}
              {toast.message && (
                <div className="toast-message">{toast.message}</div>
              )}
            </div>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              style={{ padding: 2 }}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
