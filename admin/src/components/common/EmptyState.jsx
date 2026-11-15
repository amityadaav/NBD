import { Inbox } from "lucide-react";
import "./EmptyState.css";

export default function EmptyState({
  icon: Icon = Inbox,
  title = "No data found",
  description = "There is nothing here yet.",
  action,
}) {
  return (
    <div className="es-container">
      <div className="es-icon-wrap">
        <Icon size={28} />
      </div>
      <h3 className="es-title">{title}</h3>
      <p className="es-desc">{description}</p>
      {action && <div className="es-action">{action}</div>}
    </div>
  );
}