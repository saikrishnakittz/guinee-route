import {
  Users,
  Route,
  ClipboardList,
  ShieldAlert,
  CreditCard,
  Wallet,
  WifiOff,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

const iconMap = {
  agents: Users,
  missions: Route,
  offline: WifiOff,
  reports: ClipboardList,
  violations: ShieldAlert,
  fines: CreditCard,
  cash: Wallet,
  alert: AlertTriangle,
};

export default function StatCard({
  type,
  label,
  value,
  description,
  trend,
  trendType = "positive",
}) {
  const Icon = iconMap[type] || Users;

  return (
    <article className="cmd-kpi-card stat-card">
      <div className="cmd-kpi-top stat-top">
        <span className="cmd-kpi-label stat-label">{label}</span>
        <span className="cmd-kpi-icon stat-icon-wrap">
          <Icon size={14} />
        </span>
      </div>

      <div className="cmd-kpi-main stat-main-row">
        <div className="cmd-kpi-value stat-value">{value}</div>
        {trend && (
          <span className={`cmd-kpi-trend stat-trend-chip trend-${trendType}`}>
            {trend}
          </span>
        )}
      </div>

      <div className="cmd-kpi-sub stat-description">{description}</div>
    </article>
  );
}
