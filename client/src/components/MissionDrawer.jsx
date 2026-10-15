import { X } from "lucide-react";

export default function MissionDrawer({
  mission,
  agent,
  agents = [],
  onSelectMission,
  onSelectAgent,
  onViewMission,
  onClose,
}) {
  if (!mission) return null;

  // Resolve active mission data
  const activeMission =
    mission?.missions?.[0] ||
    (mission?.missionCode ? mission : null) ||
    mission;

  // Resolve assigned agent
  const activeAgent =
    agent ||
    (mission?.badgeNumber ? mission : null) ||
    agents.find(
      (a) =>
        a.id === activeMission?.agentId ||
        a.id === mission?.agentId ||
        a.name === mission?.agentName,
    ) ||
    agents[0];

  // Mission code
  const missionCode =
    activeMission?.missionCode ||
    mission?.code ||
    activeAgent?.missionCode ||
    "GR-MSN-2026-00984";

  // Status text
  const statusText =
    mission?.status ||
    activeMission?.statusLabel ||
    activeAgent?.statusLabel ||
    "In Progress";

  // Agent Name
  const agentName =
    activeAgent?.name ||
    mission?.agentName ||
    "Mamadou Diallo";

  // Road
  const road =
    activeMission?.roadName ||
    mission?.road ||
    activeAgent?.road ||
    "RN1";

  // From & To endpoints
  let fromLocation = "Coyah Junction";
  let toLocation = "Dubréka Checkpoint";

  const routeStr =
    activeAgent?.route ||
    mission?.route ||
    activeMission?.route ||
    "";

  if (routeStr) {
    const parts = routeStr.split(/→|—|-/).map((s) => s.trim());
    if (parts[0]) {
      fromLocation = parts[0];
      if (fromLocation.toLowerCase() === "coyah") {
        fromLocation = "Coyah Junction";
      }
    }
    if (parts[1]) {
      toLocation = parts[1];
      if (toLocation.toLowerCase() === "dubréka" || toLocation.toLowerCase() === "dubreka") {
        toLocation = "Dubréka Checkpoint";
      }
    }
  }

  // Distance metrics
  const totalKm = Number(activeMission?.totalKm || mission?.totalKm) || 18.6;
  const coveredKm = Number(activeMission?.coveredKm || mission?.coveredKm) || 7.4;
  const remainingKm = Math.max(0, totalKm - coveredKm).toFixed(1);

  // Started time & Duration
  const started =
    activeAgent?.dutyStart ||
    mission?.started ||
    "09:50";

  const duration =
    mission?.duration ||
    activeAgent?.duty ||
    "00h 52m";

  // Reports and Violations
  const reportsCount =
    mission?.reportsCount ??
    (mission?.reports ? mission.reports.length : 1);

  // Violations list
  const violationsList =
    (activeMission?.violations && activeMission.violations.length > 0)
      ? activeMission.violations
      : (mission?.violations && mission.violations.length > 0)
      ? mission.violations
      : (activeAgent?.missions?.[0]?.violations && activeAgent.missions[0].violations.length > 0)
      ? activeAgent.missions[0].violations
      : [
          {
            id: 1,
            violationCode: "GR-VIO-001",
            violationType: "Unauthorized Heavy Vehicle",
            fineAmountGnf: 750000,
            paid: true,
            location: "RN1 km 7.4 (Coyah)",
          },
          {
            id: 2,
            violationCode: "GR-VIO-002",
            violationType: "Expired Registration",
            fineAmountGnf: 300000,
            paid: false,
            location: "RN1 km 11.2 (Dubréka)",
          },
        ];

  const violationsCount =
    activeMission?.violations?.length ??
    (mission?.violations ? mission.violations.length : violationsList.length);

  // GPS & Progress
  const gpsStatus = activeAgent?.gps || "Active";

  const progress =
    mission?.progress ??
    activeAgent?.progress ??
    (totalKm > 0 ? Math.round((coveredKm / totalKm) * 100) : 40);

  const handleViewMission = () => {
    if (onViewMission) {
      onViewMission(activeMission);
    } else if (onSelectMission) {
      onSelectMission(activeMission);
    }
  };

  const handleViewAgent = () => {
    if (onSelectAgent) {
      onSelectAgent(activeAgent);
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div className="cmd-drawer-backdrop" onMouseDown={onClose}>
      <aside
        className="cmd-mission-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mission-drawer-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="cmd-drawer-header">
          <h2 id="mission-drawer-title">Mission Detail</h2>
          <button
            type="button"
            className="cmd-drawer-close-btn"
            onClick={onClose}
            aria-label="Close mission detail"
          >
            <X size={18} />
          </button>
        </header>

        {/* Body Content */}
        <div className="cmd-drawer-body">
          {/* Top Code and Badges */}
          <div className="cmd-drawer-top-info">
            <div className="cmd-drawer-code">{missionCode}</div>
            <div className="cmd-drawer-badges">
              <span className="cmd-drawer-badge badge-blue">
                <span className="badge-dot" /> {statusText}
              </span>
              <span className="cmd-drawer-badge badge-green">
                <span className="badge-dot" /> On Time
              </span>
            </div>
          </div>

          {/* Section Title */}
          <div className="cmd-drawer-section-title">MISSION DETAILS</div>

          {/* Details Card */}
          <div className="cmd-drawer-details-box">
            <div className="cmd-drawer-detail-row">
              <span className="row-label">Agent</span>
              <span className="row-value">{agentName}</span>
            </div>
            <div className="cmd-drawer-detail-row">
              <span className="row-label">Corridor / Road</span>
              <span className="row-value">{road} · Coyah ⇄ Dubréka</span>
            </div>
            <div className="cmd-drawer-detail-row">
              <span className="row-label">From</span>
              <span className="row-value">{fromLocation}</span>
            </div>
            <div className="cmd-drawer-detail-row">
              <span className="row-label">To</span>
              <span className="row-value">{toLocation}</span>
            </div>
            <div className="cmd-drawer-detail-row">
              <span className="row-label">Total Distance</span>
              <span className="row-value">{totalKm} km</span>
            </div>
            <div className="cmd-drawer-detail-row">
              <span className="row-label">Covered</span>
              <span className="row-value">{coveredKm} km</span>
            </div>
            <div className="cmd-drawer-detail-row">
              <span className="row-label">Remaining</span>
              <span className="row-value">{remainingKm} km</span>
            </div>
            <div className="cmd-drawer-detail-row">
              <span className="row-label">Started</span>
              <span className="row-value">{started}</span>
            </div>
            <div className="cmd-drawer-detail-row">
              <span className="row-label">Duration</span>
              <span className="row-value">{duration}</span>
            </div>
            <div className="cmd-drawer-detail-row">
              <span className="row-label">Reports</span>
              <span className="row-value">{reportsCount}</span>
            </div>
            <div className="cmd-drawer-detail-row">
              <span className="row-label">Violations</span>
              <span className="row-value">{violationsCount} recorded</span>
            </div>
            <div className="cmd-drawer-detail-row">
              <span className="row-label">GPS Tracking</span>
              <span className="row-value val-active">{gpsStatus}</span>
            </div>
          </div>

          {/* Progress Section */}
          <div className="cmd-drawer-progress-wrap">
            <div className="cmd-drawer-prog-header">
              <span className="prog-lbl">Progress</span>
              <span className="prog-val">{progress}%</span>
            </div>
            <div className="cmd-drawer-prog-track">
              <div
                className="cmd-drawer-prog-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="cmd-drawer-prog-bounds">
              <span>{fromLocation} (0 km)</span>
              <span>{toLocation} ({totalKm} km)</span>
            </div>
            <div className="cmd-drawer-prog-stats-chips">
              <span className="chip-item"><strong>{coveredKm} km</strong> covered</span>
              <span className="chip-item"><strong>{remainingKm} km</strong> remaining</span>
              <span className="chip-item"><strong>{duration}</strong> elapsed</span>
            </div>
          </div>

          {/* Recorded Violations Section */}
          <div className="cmd-drawer-section-title">
            RECORDED VIOLATIONS ({violationsList.length})
          </div>

          <div className="cmd-drawer-violations-list">
            {violationsList.map((vio, index) => (
              <div
                key={vio.id || index}
                className="cmd-drawer-violation-card"
              >
                <div className="cmd-vio-card-header">
                  <span className="cmd-vio-code">{vio.violationCode || `GR-VIO-00${index + 1}`}</span>
                  <span
                    className={`cmd-vio-badge ${
                      vio.paid ? "badge-paid" : "badge-pending"
                    }`}
                  >
                    {vio.paid ? "● Paid Cash" : "● Fine Issued"}
                  </span>
                </div>
                <div className="cmd-vio-type">
                  {vio.violationType || vio.type || "Traffic Violation"}
                </div>
                <div className="cmd-vio-meta">
                  <span className="cmd-vio-amount">
                    {vio.fineAmountGnf
                      ? `GNF ${vio.fineAmountGnf.toLocaleString()}`
                      : vio.fine || "GNF 750,000"}
                  </span>
                  <span>· {vio.location || "Corridor RN1"}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="cmd-drawer-actions">
            <button
              type="button"
              className="cmd-drawer-btn-view-mission"
              onClick={handleViewMission}
            >
              View Mission →
            </button>
            <button
              type="button"
              className="cmd-drawer-btn-view-agent"
              onClick={handleViewAgent}
            >
              View Agent →
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
