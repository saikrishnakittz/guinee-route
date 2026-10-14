import { MapPin, Navigation, Route } from "lucide-react";
import { getPointOnRN1 } from "../utils/corridor";

export default function MissionPanel({
  agents,
  onSelectAgent,
  onSelectMission,
}) {
  const missions = [
    ...new Map(
      agents.flatMap((agent) =>
        (agent.missions || []).map((mission) => [
          mission.id,
          { ...mission, agentName: agent.name, agentId: agent.id },
        ]),
      ),
    ).values(),
  ];

  return (
    <section className="panel mission-panel" id="missions">
      <div className="panel-heading">
        <div>
          <div className="eyebrow">FIELD SURVEILLANCE</div>
          <h2>RN1 Corridor Monitoring</h2>
          <p className="panel-subtitle">Coyah — Dubréka, Guinea</p>
        </div>
        <span className="live-badge">
          <span className="connection-dot" /> LIVE DATA
        </span>
      </div>

      <div className="map-visual">
        <div className="map-grid" />
        <svg
          className="route-svg"
          viewBox="0 0 600 250"
          preserveAspectRatio="none"
          role="img"
          aria-label="Illustrative RN1 corridor with agent positions"
        >
          <path
            d="M 38 195 C 120 180, 110 95, 215 120 S 340 215, 410 125 S 505 80, 565 42"
            stroke="#cbd5e1"
            strokeWidth="13"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 38 195 C 120 180, 110 95, 215 120 S 340 215, 410 125 S 505 80, 565 42"
            stroke="#ffffff"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 38 195 C 120 180, 110 95, 215 120 S 340 215, 410 125 S 505 80, 565 42"
            stroke="#2563eb"
            strokeWidth="3"
            strokeDasharray="7 6"
            fill="none"
            strokeLinecap="round"
          />
        </svg>

        <div className="map-place coyah">
          <span className="map-town-dot" />
          <strong>Coyah</strong>
        </div>
        <div className="map-place dubreka">
          <span className="map-town-dot" />
          <strong>Dubréka</strong>
        </div>

        {agents
          .filter(
            (agent) =>
              agent.status === "ON_MISSION" ||
              agent.missions?.some(
                (m) => m.status === "ACTIVE" || m.roadName === "RN1",
              ) ||
              (agent.missions && agent.missions.length > 0),
          )
          .map((agent, index) => {
            const mission = agent.missions?.[0];
            const progressRatio =
              mission?.totalKm > 0
                ? Math.min(1, Math.max(0, mission.coveredKm / mission.totalKm))
                : agent.lat
                  ? Math.min(
                      1,
                      Math.max(0, (agent.lat - 9.705) / (9.73 - 9.705)),
                    )
                  : index === 0
                    ? 0.398
                    : 0.267;
            const pt = getPointOnRN1(progressRatio);
            const position = {
              left: `${(pt.x / 600) * 100}%`,
              top: `${(pt.y / 250) * 100}%`,
            };

            return (
              <button
                key={agent.id}
                className="agent-marker"
                style={position}
                title={`${agent.name} (${agent.badgeNumber}) — ${mission?.missionCode || "Active on RN1"}`}
                onClick={() => {
                  if (agent.missions?.length > 0 && onSelectMission) {
                    onSelectMission(agent);
                  } else if (onSelectAgent) {
                    onSelectAgent(agent);
                  }
                }}
                aria-label={`Agent ${agent.name}, ${agent.badgeNumber}`}
              >
                <span className="marker-radar-pulse" />
                <Navigation size={16} />
              </button>
            );
          })}

        <div className="map-legend">
          <span>
            <i className="legend-blue" /> Active mission
          </span>
          <span>
            <i className="legend-white" /> Road corridor
          </span>
        </div>
        <div className="map-disclaimer">
          Illustrative corridor · Seeded coordinates
        </div>
      </div>

      <div className="mission-summary">
        <div>
          <div className="eyebrow">ACTIVE MISSIONS</div>
          <strong>{missions.length} missions in progress</strong>
        </div>
        <Route size={21} className="muted-icon" />
      </div>

      <div className="mission-list">
        {missions.length === 0 && (
          <p className="empty-state">No active missions currently assigned.</p>
        )}

        {missions.map((mission) => {
          const progress =
            mission.totalKm > 0
              ? Math.min(100, (mission.coveredKm / mission.totalKm) * 100)
              : 0;

          return (
            <article className="mission-item" key={mission.id}>
              <div className="mission-item-top">
                <div>
                  <strong>{mission.missionCode}</strong>
                  <p>
                    <MapPin size={13} /> {mission.roadName} Corridor
                  </p>
                </div>
                <span className="status-pill active-pill">Active</span>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mission-item-bottom">
                <span>{mission.coveredKm} km covered</span>
                <strong>{Math.round(progress)}%</strong>
                <span>{mission.totalKm} km total</span>
              </div>

              <div className="mission-actions">
                <button
                  className="text-link"
                  onClick={() =>
                    onSelectAgent(
                      agents.find((agent) => agent.id === mission.agentId),
                    )
                  }
                >
                  View assigned agent
                </button>
                <button
                  className="text-link"
                  onClick={() => {
                    const assignedAgent = agents.find(
                      (agent) => agent.id === mission.agentId,
                    );

                    if (assignedAgent) onSelectMission(assignedAgent);
                  }}
                >
                  View mission details
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
