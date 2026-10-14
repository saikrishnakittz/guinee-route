import { useState } from "react";
import {
  X,
  Route,
  Clock3,
  AlertTriangle,
  UserRound,
  Navigation,
  MapPin,
  Timer,
} from "lucide-react";
import {
  getPointOnRN1,
  RN1_CORRIDOR_LENGTH,
  formatDuration,
} from "../utils/corridor";

const money = (amount) =>
  `${new Intl.NumberFormat("en-US").format(amount || 0)} GNF`;

export default function MissionDrawer({
  mission,
  agent,
  agents = [],
  onSelectMission,
  onClose,
}) {
  const [hoveredAgent, setHoveredAgent] = useState(null);

  if (!mission) return null;

  // Resolve active mission data whether mission is an agent with .missions or a mission object
  const activeMission =
    mission?.missions?.[0] ||
    (mission?.missionCode ? mission : null) ||
    mission;

  // Resolve assigned agent
  const activeAgent =
    agent ||
    (mission?.badgeNumber ? mission : null) ||
    agents.find((a) => a.id === activeMission?.agentId);

  const totalKm = Number(activeMission?.totalKm) || 0;
  const coveredKm = Number(activeMission?.coveredKm) || 0;
  const remainingKm = Math.max(0, totalKm - coveredKm);
  const progressRatio =
    totalKm > 0 ? Math.min(1, Math.max(0, coveredKm / totalKm)) : 0;
  const progress = progressRatio * 100;

  const violations = activeMission?.violations || [];
  const unpaid = violations
    .filter((item) => !item.paid)
    .reduce((sum, item) => sum + (item.fineAmountGnf || 0), 0);

  const started = activeMission?.startedAt
    ? new Date(activeMission.startedAt).toLocaleString()
    : "Not available";

  const duration = formatDuration(activeMission?.startedAt);

  // Calculate active agent marker coordinates on the RN1 corridor curve
  const activeAgentPt = getPointOnRN1(progressRatio);

  // All active agents on RN1 corridor for full corridor view awareness
  const corridorAgents =
    agents.length > 0
      ? agents.filter(
          (a) =>
            a.status === "ON_MISSION" ||
            a.missions?.some(
              (m) => m.status === "ACTIVE" || m.roadName === "RN1",
            ) ||
            (a.missions && a.missions.length > 0),
        )
      : activeAgent
        ? [activeAgent]
        : [];

  return (
    <div className="drawer-backdrop" onMouseDown={onClose}>
      <aside
        className="mission-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mission-drawer-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="drawer-header">
          <div>
            <span className="eyebrow">MISSION DETAILS</span>
            <h2 id="mission-drawer-title">
              {activeMission?.missionCode || "Active Mission"}
            </h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close mission details"
          >
            <X size={19} />
          </button>
        </header>

        <div className="drawer-body">
          <div className="drawer-status">
            <span className="connection-dot" /> Active mission
          </div>

          <h3>{activeMission?.roadName || "RN1"} Corridor</h3>
          <p className="drawer-muted">Coyah — Dubréka, Guinea</p>

          {/* Interactive Map / Corridor View */}
          <section
            className="drawer-map-card"
            aria-label="Interactive Map / Corridor View"
          >
            <div className="drawer-map-header">
              <span className="eyebrow">
                INTERACTIVE MAP / CORRIDOR VIEW
              </span>
              <span className="map-live-pill">
                <span className="connection-dot" /> LIVE RN1
              </span>
            </div>

            <div className="drawer-map-visual map-visual">
              <div className="map-grid" />
              <svg
                className="route-svg"
                viewBox="0 0 600 250"
                preserveAspectRatio="none"
                role="img"
                aria-label="Corridor RN1 Coyah to Dubréka with agent markers"
              >
                {/* Background road bed */}
                <path
                  d="M 38 195 C 120 180, 110 95, 215 120 S 340 215, 410 125 S 505 80, 565 42"
                  stroke="#cbd5e1"
                  strokeWidth="13"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Road surface */}
                <path
                  d="M 38 195 C 120 180, 110 95, 215 120 S 340 215, 410 125 S 505 80, 565 42"
                  stroke="#ffffff"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Dashed route guide */}
                <path
                  d="M 38 195 C 120 180, 110 95, 215 120 S 340 215, 410 125 S 505 80, 565 42"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="6 5"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Active progress corridor trail */}
                <path
                  d="M 38 195 C 120 180, 110 95, 215 120 S 340 215, 410 125 S 505 80, 565 42"
                  stroke="#2563eb"
                  strokeWidth="5"
                  strokeDasharray={RN1_CORRIDOR_LENGTH}
                  strokeDashoffset={
                    RN1_CORRIDOR_LENGTH * (1 - progressRatio)
                  }
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>

              {/* Origin Town: Coyah */}
              <div className="map-place coyah drawer-map-town">
                <span className="map-town-dot" />
                <strong>Coyah</strong>
              </div>

              {/* Destination Town: Dubréka */}
              <div className="map-place dubreka drawer-map-town">
                <span className="map-town-dot" />
                <strong>Dubréka</strong>
              </div>

              {/* Agent Markers along RN1 Corridor */}
              {corridorAgents.map((corridorAgent, idx) => {
                const isSelected =
                  corridorAgent.id === activeAgent?.id ||
                  corridorAgent.badgeNumber === activeAgent?.badgeNumber;

                const m = corridorAgent.missions?.[0];
                const ratio =
                  isSelected
                    ? progressRatio
                    : m?.totalKm > 0
                      ? Math.min(1, Math.max(0, m.coveredKm / m.totalKm))
                      : idx === 0
                        ? 0.398
                        : 0.267;

                const pt = getPointOnRN1(ratio);
                const pos = {
                  left: `${(pt.x / 600) * 100}%`,
                  top: `${(pt.y / 250) * 100}%`,
                };

                return (
                  <button
                    key={corridorAgent.id || idx}
                    type="button"
                    className={`agent-marker drawer-agent-marker ${
                      isSelected ? "active-marker" : "secondary-marker"
                    }`}
                    style={pos}
                    title={`${corridorAgent.name} (${corridorAgent.badgeNumber}) — ${m?.missionCode || "Active on RN1"}`}
                    aria-label={`Agent marker: ${corridorAgent.name}, badge ${corridorAgent.badgeNumber}`}
                    onClick={() => {
                      if (!isSelected && onSelectMission) {
                        onSelectMission(corridorAgent);
                      }
                    }}
                    onMouseEnter={() => setHoveredAgent(corridorAgent)}
                    onMouseLeave={() => setHoveredAgent(null)}
                  >
                    {isSelected && <span className="marker-radar-pulse" />}
                    <Navigation size={isSelected ? 15 : 12} />
                  </button>
                );
              })}

              {/* Floating callout for the active agent position */}
              <div
                className="drawer-marker-callout"
                style={{
                  left: `${(activeAgentPt.x / 600) * 100}%`,
                  top: `${(activeAgentPt.y / 250) * 100}%`,
                }}
              >
                <span>{activeAgent?.name || "Active Agent"}</span>
                <small>
                  {coveredKm} / {totalKm} km ({Math.round(progress)}%)
                </small>
              </div>

              {/* Corridor Map Legend */}
              <div className="map-legend">
                <span>
                  <i className="legend-blue" /> Covered (
                  {Math.round(progress)}%)
                </span>
                <span>
                  <i className="legend-white" /> RN1 Corridor
                </span>
              </div>
            </div>
          </section>

          {/* Route Completion Progress */}
          <div className="drawer-progress">
            <div className="drawer-progress-heading">
              <span>Route completion</span>
              <strong>{Math.round(progress)}%</strong>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="drawer-distance">
              <div>
                <strong>{coveredKm} km</strong>
                <span>Covered</span>
              </div>
              <div>
                <strong>{remainingKm.toFixed(1)} km</strong>
                <span>Remaining</span>
              </div>
              <div>
                <strong>{totalKm} km</strong>
                <span>Total route</span>
              </div>
            </div>
          </div>

          <div className="drawer-info-row">
            <Clock3 size={18} />
            <div>
              <span>Mission started</span>
              <strong>{started}</strong>
            </div>
          </div>

          <div className="drawer-info-row">
            <Timer size={18} />
            <div>
              <span>Mission duration</span>
              <strong>{duration}</strong>
            </div>
          </div>

          <div className="drawer-info-row">
            <UserRound size={18} />
            <div>
              <span>Assigned agent</span>
              <strong>{activeAgent?.name || "Unassigned"}</strong>
              {activeAgent && <small>{activeAgent.badgeNumber}</small>}
            </div>
          </div>

          <div className="drawer-section-heading">
            <div>
              <AlertTriangle size={17} /> Recorded violations
            </div>
            <span>{violations.length}</span>
          </div>

          {violations.length === 0 ? (
            <p className="drawer-muted">
              No violations linked to this mission.
            </p>
          ) : (
            violations.map((violation) => (
              <div className="drawer-violation" key={violation.id}>
                <div>
                  <strong>{violation.violationType}</strong>
                  <p>{violation.violationCode}</p>
                </div>
                <div>
                  <strong>{money(violation.fineAmountGnf)}</strong>
                  <span
                    className={violation.paid ? "paid-text" : "unpaid-text"}
                  >
                    {violation.paid ? "Paid" : "Unpaid"}
                  </span>
                </div>
              </div>
            ))
          )}

          <div className="drawer-fines">
            <span>Unpaid fines for this mission</span>
            <strong>{money(unpaid)}</strong>
          </div>

          <p className="drawer-disclaimer">
            Route and violation details reflect the seeded demonstration
            database.
          </p>
        </div>
      </aside>
    </div>
  );
}
