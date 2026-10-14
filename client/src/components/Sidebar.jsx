import {
  Activity,
  LayoutDashboard,
  Map,
  Radio,
  ShieldCheck,
  CarFront,
  UserRound,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  { label: "Overview", icon: LayoutDashboard, to: "/" },
  { label: "Live Operations", icon: Radio, to: "/#live-operations" },
  { label: "Missions", icon: Map, to: "/#missions" },
  { label: "Agents", icon: ShieldCheck, to: "/#agents" },
  { label: "Vehicles", icon: CarFront, to: "/#vehicles" },
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
        {navigation.map(({ label, icon: Icon, to }, index) => (
          <NavLink
            key={label}
            to={to}
            end={index === 0}
            className={({ isActive }) =>
              `nav-item ${isActive && index === 0 ? "active" : ""}`
            }
            onClick={() => {
              if (
                label === "Live Operations" ||
                label === "Overview" ||
                to === "/#live-operations" ||
                to === "/"
              ) {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <Icon size={19} />
            <span>{label}</span>

            {label === "Live Operations" && <span className="nav-live-dot" />}
          </NavLink>
        ))}

        <NavLink
          to="/field-agent"
          className={({ isActive }) =>
            `nav-item field-agent-nav ${isActive ? "active" : ""}`
          }
        >
          <UserRound size={19} />
          <span>Field Agent</span>
        </NavLink>
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
