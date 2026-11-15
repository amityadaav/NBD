import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import "./StatCard.css";

function StatCard({
  title,
  value,
  icon: Icon,
  color = "#0f766e",
  change,
  trend,          // "up" | "down" | "flat" | undefined
  trendValue,     // e.g. "+12%" (optional, shown as a chip)
  accent,         // optional override for tile background tint (defaults to color)
}) {
  const trendIcon =
    trend === "up" ? TrendingUp :
    trend === "down" ? TrendingDown :
    trend === "flat" ? Minus :
    null;

  return (
    <div
      className="stat-card"
      style={{ "--accent": color, "--accent-soft": `${accent || color}1a` }}
    >
      <div className="stat-card-info">
        <p className="stat-card-title">{title}</p>

        <div className="stat-card-value-row">
          <h2 className="stat-card-value">{value}</h2>

          {trendValue && (
            <span className={`stat-card-trend stat-card-trend-${trend || "flat"}`}>
              {trendIcon && <span className="stat-card-trend-icon">{trendIcon}</span>}
              {trendValue}
            </span>
          )}
        </div>

        {change && <span className="stat-card-change">{change}</span>}
      </div>

      {Icon && (
        <div className="stat-card-icon">
          <Icon size={22} strokeWidth={2} />
        </div>
      )}
    </div>
  );
}

export default StatCard;