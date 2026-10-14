import { X, Route, Clock3, AlertTriangle, UserRound } from "lucide-react";

const money = (amount) =>
  `${new Intl.NumberFormat("en-US").format(amount || 0)} GNF`;

export default function MissionDrawer({ mission, agent, onClose }) {
  if (!mission) return null;

  const progress =
    mission?.missions[0]?.totalKm > 0
      ? Math.min(
          100,
          (mission?.missions[0]?.coveredKm / mission?.missions[0]?.totalKm) *
            100,
        )
      : 0;

  const violations = mission?.missions[0]?.violations || [];
  const unpaid = violations
    .filter((item) => !item.paid)
    .reduce((sum, item) => sum + item.fineAmountGnf, 0);

  const started = mission?.missions[0]?.startedAt
    ? new Date(mission?.missions[0]?.startedAt).toLocaleString()
    : "Not available";

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
              {mission?.missions[0]?.missionCode}
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

          <h3>{mission?.missions[0]?.roadName} Corridor</h3>
          <p className="drawer-muted">Coyah — Dubréka, Guinea</p>

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
                <strong>{mission?.missions[0]?.coveredKm} km</strong>
                <span>Covered</span>
              </div>
              <div>
                <strong>
                  {Math.max(
                    0,
                    mission?.missions[0]?.totalKm -
                      mission?.missions[0]?.coveredKm,
                  ).toFixed(1)}{" "}
                  km
                </strong>
                <span>Remaining</span>
              </div>
              <div>
                <strong>{mission?.missions[0]?.totalKm} km</strong>
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
            <UserRound size={18} />
            <div>
              <span>Assigned agent</span>
              <strong>{agent?.name || "Unassigned"}</strong>
              {agent && <small>{agent.badgeNumber}</small>}
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
