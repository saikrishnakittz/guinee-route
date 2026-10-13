import { Users, Radio, WifiOff, Banknote } from "lucide-react";

const icons = {
  agents: Users,
  totalAgents: Users,
  missions: Radio,
  offline: WifiOff,
  fines: Banknote,
};

export default function StatCard({ type, label, value, description, accent }) {
  const Icon = icons[type];

  return (
    <article className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className={`stat-icon ${accent}`}>
          <Icon size={20} />
        </span>
      </div>

      <div className="stat-value">{value}</div>
      <div className="stat-description">{description}</div>
    </article>
  );
}
