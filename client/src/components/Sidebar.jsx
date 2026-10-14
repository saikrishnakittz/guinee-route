import {
  Activity,
  LayoutDashboard,
  Map,
  Radio,
  ShieldCheck,
  CarFront,
  Settings,
  ChevronLeft,
} from "lucide-react";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Live Operations", icon: Radio },
  { label: "Missions", icon: Map },
  { label: "Agents", icon: ShieldCheck },
  { label: "Vehicles", icon: CarFront },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Activity size={23} />
        </div>
        <div>
          <div className="brand-name">GuinéeRoute</div>
          <div className="brand-subtitle">COMMAND CENTER</div>
        </div>
      </div>

      <div className="nav-label">WORKSPACE</div>

      <nav className="navigation">
        {navigation.map(({ label, icon: Icon }, index) => (
          <a
            href={
              index === 0
                ? "#overview"
                : `#${label.toLowerCase().replaceAll(" ", "-")}`
            }
            key={label}
            className={`nav-item ${index === 0 ? "active" : ""}`}
          >
            <Icon size={19} />
            <span>{label}</span>
            {label === "Live Operations" && <span className="nav-live-dot" />}
          </a>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="connection-card">
          <span className="connection-dot" />
          <div>
            <strong>System connected</strong>
            <p>API connection ready</p>
          </div>
        </div>    

        <div className="profile">
          <div className="avatar">OP</div>
          <div className="profile-info">
            <strong>Operations Admin</strong>
            <span>Command Center</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
