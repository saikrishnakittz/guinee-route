import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  RefreshCw,
  Clock3,
  Users,
  ChevronDown,
  CircleAlert,
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import StatCard from "./components/Statcard";
import MissionPanel from "./components/MissionPanel";
import VehicleLookup from "./components/VehicleLookup";
import MissionDrawer from "./components/MissionDrawer";

import {
  getDashboardStats,
  getLiveAgents,
  updateAgentStatus,
} from "./services/api";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-US").format(amount || 0);

const statusLabels = {
  ON_DUTY: "On duty",
  ON_MISSION: "On mission",
  BREAK: "On break",
  OFFLINE: "Offline",
};

function AgentPanel({ agents, onStatusChange, updatingId }) {
  return (
    <section className="panel agents-panel" id="agents">
      <div className="panel-heading">
        <div>
          <div className="eyebrow">PERSONNEL MANAGEMENT</div>
          <h2>Field Agents</h2>
          <p className="panel-subtitle">
            Agent status from the operations database
          </p>
        </div>
        <div className="agent-count">
          <Users size={17} /> {agents.length} agents
        </div>
      </div>

      <div className="agent-table-wrap">
        <table className="agent-table">
          <thead>
            <tr>
              <th>AGENT</th>
              <th>BADGE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id}>
                <td>
                  <div className="agent-identity">
                    <div className="agent-avatar">
                      {agent.name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <strong>{agent.name}</strong>
                  </div>
                </td>
                <td className="badge-number">{agent.badgeNumber}</td>
                <td>
                  <div className="status-select-wrap">
                    <span
                      className={`status-dot ${agent.status.toLowerCase()}`}
                    />
                    <select
                      aria-label={`Change status for ${agent.name}`}
                      value={agent.status}
                      disabled={updatingId === agent.id}
                      onChange={(event) =>
                        onStatusChange(agent.id, event.target.value)
                      }
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={13} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {agents.length === 0 && (
          <p className="empty-state">No agent records returned by the API.</p>
        )}
      </div>
    </section>
  );
}

export default function App() {
  const [stats, setStats] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedMission, setSelectedMission] = useState(null);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsData, agentData] = await Promise.all([
        getDashboardStats(),
        getLiveAgents(),
      ]);

      setStats(statsData);
      setAgents(agentData);
      setError("");
    } catch (err) {
      setError(
        "Could not load dashboard data. Check that the backend is running on port 5000.",
      );
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();

    const timer = setInterval(() => loadDashboard(true), 30000);
    return () => clearInterval(timer);
  }, [loadDashboard]);

  async function handleStatusChange(id, status) {
    setUpdatingId(id);
    setNotice("");

    try {
      await updateAgentStatus(id, status);
      await loadDashboard(true);
      setNotice("Agent status updated successfully.");
    } catch (err) {
      setNotice(err.message || "Could not update agent status.");
      await loadDashboard(true);
    } finally {
      setUpdatingId(null);
    }
  }

  const statCards = [
    {
      type: "agents",
      label: "AGENTS ON DUTY",
      value: stats?.agentsOnDuty ?? "—",
      description: `${stats?.totalAgents ?? 0} registered agents`,
      accent: "blue",
    },
    {
      type: "missions",
      label: "ACTIVE MISSIONS",
      value: stats?.activeMissions ?? "—",
      description: "Missions in progress",
      accent: "green",
    },
    {
      type: "offline",
      label: "OFFLINE ALERTS",
      value: stats?.offlineAgents ?? "—",
      description: "Agents requiring attention",
      accent: "orange",
    },
    {
      type: "fines",
      label: "OUTSTANDING FINES",
      value: stats ? `${formatMoney(stats.unpaidFinesGnf)} GNF` : "—",
      description: `${stats?.totalViolations ?? 0} total recorded violations`,
      accent: "purple",
    },
  ];

  return (
    <div className="app-shell" id="overview">
      <Sidebar />

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>GuinéeRoute</span>
            <span>/</span>
            <strong>Overview</strong>
          </div>
          <div className="topbar-actions">
            <span className="system-status">
              <span className="connection-dot" /> System operational
            </span>
            <button
              className="icon-button"
              title="Refresh dashboard"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
            >
              <RefreshCw size={17} className={refreshing ? "spin" : ""} />
            </button>
            <button
              className="icon-button notification-button"
              title="Notifications"
            >
              <Bell size={18} />
              <span />
            </button>
            <div className="topbar-divider" />
            <div className="operator-chip">
              <div className="avatar">OP</div>
              <div>
                <strong>Operator</strong>
                <span>Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow">OPERATIONS COMMAND CENTER</div>
              <h1>
                Good day, Operator <span>👋</span>
              </h1>
              <p>
                Monitor field activity and coordinate operations across the RN1
                corridor.
              </p>
            </div>
            <div className="date-chip">
              <Clock3 size={16} /> Live operations
            </div>
          </section>

          {error && (
            <div className="error-banner">
              <CircleAlert size={18} />
              <span>{error}</span>
              <button onClick={() => loadDashboard(true)}>Retry</button>
            </div>
          )}

          {notice && (
            <div className="notice-banner">
              {notice}
              <button onClick={() => setNotice("")}>Dismiss</button>
            </div>
          )}

          <section className="stats-grid">
            {statCards.map((card) => (
              <StatCard key={card.type} {...card} />
            ))}
          </section>

          {loading && (
            <div className="loading-banner">Loading operations data…</div>
          )}

          <div className="dashboard-grid">
            <MissionPanel
              agents={agents}
              onSelectAgent={setSelectedAgent}
              onSelectMission={setSelectedMission}
            />
            <VehicleLookup />
          </div>

          <AgentPanel
            agents={agents}
            onStatusChange={handleStatusChange}
            updatingId={updatingId}
          />

          {selectedAgent && (
            <div
              className="modal-backdrop"
              onClick={() => setSelectedAgent(null)}
              role="presentation"
            >
              <section
                className="agent-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="agent-modal-title"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  className="modal-close"
                  onClick={() => setSelectedAgent(null)}
                >
                  ×
                </button>
                <div className="eyebrow">FIELD AGENT DETAILS</div>
                <h2 id="agent-modal-title">{selectedAgent.name}</h2>
                <p>Badge: {selectedAgent.badgeNumber}</p>
                <p>
                  Status:{" "}
                  {statusLabels[selectedAgent.status] || selectedAgent.status}
                </p>
                <p>Latitude: {selectedAgent.lat}</p>
                <p>Longitude: {selectedAgent.lng}</p>
                <button
                  className="primary-button"
                  onClick={() => setSelectedAgent(null)}
                >
                  Close
                </button>
              </section>
            </div>
          )}

          <MissionDrawer
            mission={selectedMission}
            agent={
              selectedMission
                ? agents.find((item) =>
                    item.missions?.some(
                      (mission) => mission.id === selectedMission.id,
                    ),
                  )
                : null
            }
            onClose={() => setSelectedMission(null)}
          />

          <footer className="page-footer">
            <span>GUINÉEROUTE · OPERATIONS PLATFORM</span>
            <span>Demo environment · Seeded data</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
