import {
  LayoutDashboard,
  Map,
  Route,
  Users,
  AlertTriangle,
  Milestone,
  FileWarning,
  Wrench,
  ShieldAlert,
  CarFront,
  Building2,
  Receipt,
  CreditCard,
  Scale,
  BarChart3,
  UserCheck,
  KeyRound,
  Globe,
  Settings,
  Workflow,
  History,
  Activity,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navSections = [
  {
    title: "COMMAND",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, to: "/", active: true },
      { label: "Live Map", icon: Map, to: "/#live-map" },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { label: "Missions", icon: Route, to: "/#missions", badge: 18 },
      { label: "Agents", icon: Users, to: "/#agents", badge: 42 },
      {
        label: "Emergencies",
        icon: AlertTriangle,
        to: "/#emergencies",
        badge: 1,
        badgeType: "danger",
      },
    ],
  },
  {
    title: "ROAD MANAGEMENT",
    items: [
      { label: "Roads", icon: Milestone, to: "/#roads" },
      {
        label: "Damage Reports",
        icon: FileWarning,
        to: "/#damage-reports",
        badge: 27,
      },
      { label: "Repairs", icon: Wrench, to: "/#repairs", badge: 8 },
    ],
  },
  {
    title: "ENFORCEMENT",
    items: [
      { label: "Violations", icon: ShieldAlert, to: "/#enforcement" },
      { label: "Vehicles", icon: CarFront, to: "/#vehicles" },   
    ],
  },
  {
    title: "FINANCE",
    items: [
      { label: "Fines", icon: Receipt, to: "/#finance" },
      { label: "Payments", icon: CreditCard, to: "/#payments" },
      {
        label: "Reconciliation",
        icon: Scale,
        to: "/#reconciliation",
        badge: "!",
        badgeType: "warning",
      },
    ],
  },
  {
    title: "ANALYTICS",
    items: [
      { label: "Reports", icon: BarChart3, to: "/#reports" },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      { label: "Geography", icon: Globe, to: "/#geography" },
      { label: "Integrations", icon: Workflow, to: "/#integrations" },
      { label: "Audit Logs", icon: History, to: "/#audit" },
    ],
  },
];

function handleNavClick(to) {
  const sectionId = to.split("#")[1];

  if (!sectionId) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  // Allow the URL hash to update before scrolling.
  requestAnimationFrame(() => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="brand">
        <div className="brand-flag" aria-label="Guinea Flag" title="République de Guinée">
          <span className="flag-stripe flag-red" />
          <span className="flag-stripe flag-yellow" />
          <span className="flag-stripe flag-green" />
        </div>
        <div>
          <div className="brand-name">
            GuinéeRoute <span className="brand-dot" />
          </div>
          <div className="brand-subtitle">ADMIN PLATFORM</div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="navigation sidebar-nav-scroll">
        {navSections.map((section) => (
          <div key={section.title} className="sidebar-group">
            <div className="nav-label">{section.title}</div>
            <div className="nav-group-items">
              {section.items.map(
                ({ label, icon: Icon, to, badge, badgeType, active }) => (
                  <NavLink
                    key={label}
                    to={to}
                    end={to === "/"}
                    className={({ isActive }) =>
                      `nav-item ${isActive && to === "/" ? "active" : ""
                      }`
                    }
                    onClick={() => handleNavClick(to)}
                  >
                    <Icon size={17} className="nav-icon" />
                    <span className="nav-text">{label}</span>

                    {badge !== undefined && (
                      <span
                        className={`sidebar-badge ${badgeType ? `badge-${badgeType}` : ""
                          }`}
                      >
                        {badge}
                      </span>
                    )}
                  </NavLink>
                ),
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Profile */}
      <div className="sidebar-bottom">
        <div className="profile">
          <div className="avatar avatar-ic">IC</div>
          <div className="profile-info">
            <strong>Ibrahima Camara</strong>
            <span>National Supervisor</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
