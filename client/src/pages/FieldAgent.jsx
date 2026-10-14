import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Clock3,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Truck,
  UserRound,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Home,
  ArrowLeft,
} from "lucide-react";
import "./FieldAgent.css";

import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api/v1" || "https://guinee-route-api.onrender.com/api/v1";

const STATUS_OPTIONS = [
  { value: "ON_DUTY", label: "On Duty" },
  { value: "BREAK", label: "Break" },
  { value: "ON_MISSION", label: "On Mission" },
];

const STATUS_LABELS = {
  ON_DUTY: "On Duty",
  ON_MISSION: "On Mission",
  BREAK: "On Break",
  OFFLINE: "Offline",
};

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

function formatDistance(value) {
  return `${Number(value || 0).toFixed(1)} km`;
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("en-US")} GNF`;
}

function getElapsedSeconds(startTime) {
  if (!startTime) return 0;

  const start = new Date(startTime).getTime();
  if (Number.isNaN(start)) return 0;

  return Math.max(0, Math.floor((Date.now() - start) / 1000));
}

async function readResponse(response) {
  const json = await response.json().catch(() => ({}));

  if (!response.ok || json.success === false) {
    throw new Error(json.message || `Request failed (${response.status})`);
  }

  return json;
}

export default function FieldAgent() {
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [statusStartedAt, setStatusStartedAt] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [pageError, setPageError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const [plate, setPlate] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [vehicleError, setVehicleError] = useState("");

  const navigate = useNavigate();

  const selectedAgent = useMemo(
    () => agents.find((agent) => String(agent.id) === String(selectedAgentId)),
    [agents, selectedAgentId],
  );

  const activeMission = selectedAgent?.missions?.find(
    (mission) => mission.status === "ACTIVE",
  );

  const loadAgents = useCallback(async () => {
    setLoadingAgents(true);
    setPageError("");

    try {
      const response = await fetch(`${API_BASE}/agents/live`);
      const json = await readResponse(response);
      const data = Array.isArray(json.data) ? json.data : [];

      setAgents(data);

      setSelectedAgentId((currentId) => {
        if (data.some((agent) => String(agent.id) === String(currentId))) {
          return currentId;
        }

        return data.length ? String(data[0].id) : "";
      });
    } catch (error) {
      setPageError(error.message || "Unable to load agents.");
    } finally {
      setLoadingAgents(false);
    }
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  // The status timer is a frontend demo timer. Its start time is not
  // persisted by the current backend status endpoint.
  useEffect(() => {
    if (!selectedAgent) {
      setElapsed(0);
      return;
    }

    const startedAt =
      statusStartedAt[selectedAgent.id] ||
      selectedAgent.updatedAt ||
      selectedAgent.createdAt;

    const updateTimer = () => setElapsed(getElapsedSeconds(startedAt));

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);

    return () => clearInterval(timerId);
  }, [selectedAgent, statusStartedAt]);

  async function updateAgentStatus(status) {
    if (!selectedAgent) return;

    setUpdatingStatus(true);
    setStatusMessage("");
    setPageError("");

    try {
      const response = await fetch(
        `${API_BASE}/agents/${selectedAgent.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );

      const json = await readResponse(response);
      const updatedAgent = json.data;

      setAgents((current) =>
        current.map((agent) =>
          agent.id === updatedAgent.id
            ? { ...agent, ...updatedAgent, missions: agent.missions }
            : agent,
        ),
      );

      setStatusStartedAt((current) => ({
        ...current,
        [selectedAgent.id]: new Date().toISOString(),
      }));

      setStatusMessage(`Status updated to ${STATUS_LABELS[status]}.`);
    } catch (error) {
      setPageError(error.message || "Could not update agent status.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function searchVehicle(event) {
    event.preventDefault();

    const normalizedPlate = plate.trim().toUpperCase();
    if (!normalizedPlate) {
      setVehicleError("Enter a vehicle registration plate.");
      setVehicle(null);
      return;
    }

    setVehicleLoading(true);
    setVehicleError("");
    setVehicle(null);

    try {
      const response = await fetch(
        `${API_BASE}/vehicles/lookup?plate=${encodeURIComponent(normalizedPlate)}`,
      );
      const json = await readResponse(response);
      setVehicle(json.data);
    } catch (error) {
      setVehicleError(error.message || "Vehicle lookup failed.");
    } finally {
      setVehicleLoading(false);
    }
  }

  const totalKm = Number(activeMission?.totalKm || 0);
  const coveredKm = Number(activeMission?.coveredKm || 0);
  const remainingKm = Math.max(0, totalKm - coveredKm);
  const progress = totalKm > 0 ? Math.min(100, (coveredKm / totalKm) * 100) : 0;

  const unpaidViolations =
    vehicle?.violations?.filter((violation) => !violation.paid) || [];

  const paidViolations =
    vehicle?.violations?.filter((violation) => violation.paid) || [];

  const unpaidFines =
    vehicle?.unpaidFinesGnf ??
    unpaidViolations.reduce(
      (total, violation) => total + Number(violation.fineAmountGnf || 0),
      0,
    );

  return (
    <main className="field-agent-page">
      <button
        type="button"
        className="home-button"
        onClick={() => navigate("/")}
      >
        <ArrowLeft size={18} />
        <Home size={18} />
        <span>Back to Home</span>
      </button>
      <header className="field-agent-header">
        <div>
          <p className="field-eyebrow">FIELD OPERATIONS</p>
          <h1>Field Agent Console</h1>
          <p className="field-description">
            Manage your shift, follow your active mission, and check vehicle
            records.
          </p>
        </div>

        <button
          className="field-icon-button"
          type="button"
          onClick={loadAgents}
          disabled={loadingAgents}
          aria-label="Refresh agent data"
          title="Refresh agent data"
        >
          <RefreshCw size={17} className={loadingAgents ? "field-spin" : ""} />
        </button>
      </header>

      {pageError && (
        <div className="field-alert field-alert-error" role="alert">
          <AlertTriangle size={18} />
          <span>{pageError}</span>
        </div>
      )}

      {statusMessage && (
        <div className="field-alert field-alert-success" role="status">
          <CheckCircle2 size={18} />
          <span>{statusMessage}</span>
        </div>
      )}

      <section className="field-card field-agent-card">
        <div className="field-card-heading">
          <div className="field-heading-icon">
            <UserRound size={20} />
          </div>
          <div>
            <h2>Agent Status & Shift</h2>
            <p>Choose the agent whose status you want to manage.</p>
          </div>
        </div>

        {loadingAgents && agents.length === 0 ? (
          <p className="field-muted">Loading agents...</p>
        ) : agents.length === 0 ? (
          <p className="field-muted">No agents returned by the API.</p>
        ) : (
          <>
            <label className="field-label" htmlFor="field-agent-select">
              Field agent
            </label>
            <select
              id="field-agent-select"
              className="field-select"
              value={selectedAgentId}
              onChange={(event) => {
                setSelectedAgentId(event.target.value);
                setStatusMessage("");
              }}
            >
              {agents.map((agent) => (
                <option key={agent.id} value={String(agent.id)}>
                  {agent.badgeNumber} — {agent.name}
                </option>
              ))}
            </select>

            {selectedAgent && (
              <>
                <div className="field-agent-summary">
                  <div className="field-agent-avatar">
                    {selectedAgent.name
                      ?.split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div className="field-agent-identity">
                    <strong>{selectedAgent.name}</strong>
                    <span>{selectedAgent.badgeNumber}</span>
                  </div>

                  <span
                    className={`field-status-pill field-status-${selectedAgent.status?.toLowerCase()}`}
                  >
                    <i />
                    {STATUS_LABELS[selectedAgent.status] ||
                      selectedAgent.status}
                  </span>
                </div>

                <div className="field-timer-panel">
                  <Clock3 size={22} />
                  <div>
                    <span className="field-label">Elapsed timer</span>
                    <strong>{formatDuration(elapsed)}</strong>
                    <small>Since the recorded start of this timer</small>
                  </div>
                </div>

                <p className="field-label field-status-label">
                  Change agent status
                </p>
                <div className="field-status-actions">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`field-status-button ${selectedAgent.status === option.value ? "selected" : ""
                        }`}
                      disabled={
                        updatingStatus || selectedAgent.status === option.value
                      }
                      onClick={() => updateAgentStatus(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="field-help-text">
                  Status changes are saved through the backend. The shift timer
                  currently runs in this browser session.
                </p>
              </>
            )}
          </>
        )}
      </section>

      <section className="field-card">
        <div className="field-card-heading">
          <div className="field-heading-icon field-purple">
            <MapPin size={20} />
          </div>
          <div>
            <h2>Active Mission</h2>
            <p>Mission progress and route details.</p>
          </div>
        </div>

        {!selectedAgent ? (
          <p className="field-muted">
            Select an agent to view mission details.
          </p>
        ) : !activeMission ? (
          <div className="field-empty-state">
            <Activity size={25} />
            <strong>No active mission assigned</strong>
            <p>
              {selectedAgent.name} currently has no active mission in the API
              response.
            </p>
          </div>
        ) : (
          <>
            <div className="field-mission-top">
              <div>
                <span className="field-label">MISSION CODE</span>
                <h3>{activeMission.missionCode}</h3>
              </div>
              <span className="field-status-pill field-status-on_mission">
                <i />
                Active
              </span>
            </div>

            <div className="field-route-banner">
              <MapPin size={18} />
              <div>
                <strong>{activeMission.roadName || "RN1"}</strong>
                <span>Coyah – Dubréka corridor</span>
              </div>
            </div>

            <div className="field-progress-heading">
              <span>Mission progress</span>
              <strong>{Math.round(progress)}%</strong>
            </div>
            <div
              className="field-progress-track"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Mission progress"
            >
              <div style={{ width: `${progress}%` }} />
            </div>

            <div className="field-distance-grid">
              <div>
                <span>Covered</span>
                <strong>{formatDistance(coveredKm)}</strong>
              </div>
              <div>
                <span>Remaining</span>
                <strong>{formatDistance(remainingKm)}</strong>
              </div>
              <div>
                <span>Total route</span>
                <strong>{formatDistance(totalKm)}</strong>
              </div>
            </div>

            <div className="field-mission-duration">
              <Clock3 size={16} />
              <span>Mission elapsed time</span>
              <strong>
                {formatDuration(getElapsedSeconds(activeMission.startedAt))}
              </strong>
            </div>

            <div className="field-violations-heading">
              <ShieldCheck size={17} />
              <strong>Recorded violations</strong>
              <span>{activeMission.violations?.length || 0}</span>
            </div>

            {activeMission.violations?.length ? (
              <div className="field-violation-list">
                {activeMission.violations.map((violation) => (
                  <div className="field-violation-row" key={violation.id}>
                    <div>
                      <strong>{violation.violationType}</strong>
                      <span>{violation.violationCode}</span>
                    </div>
                    <div className="field-violation-amount">
                      <strong>{formatMoney(violation.fineAmountGnf)}</strong>
                      <span className={violation.paid ? "paid" : "unpaid"}>
                        {violation.paid ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="field-muted">
                No violations recorded for this mission.
              </p>
            )}
          </>
        )}
      </section>

      <section className="field-card">
        <div className="field-card-heading">
          <div className="field-heading-icon field-orange">
            <Truck size={20} />
          </div>
          <div>
            <h2>Quick Vehicle Lookup</h2>
            <p>Search vehicle records and outstanding fines by plate.</p>
          </div>
        </div>

        <form className="field-vehicle-search" onSubmit={searchVehicle}>
          <label className="field-label" htmlFor="vehicle-plate">
            Registration plate
          </label>
          <div className="field-search-row">
            <input
              id="vehicle-plate"
              className="field-input"
              value={plate}
              onChange={(event) => setPlate(event.target.value.toUpperCase())}
              placeholder="e.g. GN-1234-AA"
              autoComplete="off"
            />
            <button
              className="field-search-button"
              type="submit"
              disabled={vehicleLoading}
            >
              {vehicleLoading ? (
                <RefreshCw size={17} className="field-spin" />
              ) : (
                <Search size={17} />
              )}
              Search
            </button>
          </div>
        </form>

        {vehicleError && (
          <div className="field-alert field-alert-error" role="alert">
            <AlertTriangle size={17} />
            <span>{vehicleError}</span>
          </div>
        )}

        {vehicle && (
          <div className="field-vehicle-result">
            <div className="field-vehicle-summary">
              <div className="field-vehicle-icon">
                <Truck size={21} />
              </div>
              <div>
                <strong>{vehicle.licensePlate}</strong>
                <span>Owner: {vehicle.owner}</span>
              </div>
              <span className="field-registration-label">Record found</span>
            </div>

            <div className="field-fines-total">
              <div className="field-fines-icon">
                <Wallet size={19} />
              </div>
              <div>
                <span>Outstanding fines</span>
                <strong>{formatMoney(unpaidFines)}</strong>
              </div>
            </div>

            <div className="field-fine-stats">
              <div>
                <span>Total violations</span>
                <strong>{vehicle.violations?.length || 0}</strong>
              </div>
              <div>
                <span>Unpaid</span>
                <strong>{unpaidViolations.length}</strong>
              </div>
              <div>
                <span>Paid</span>
                <strong>{paidViolations.length}</strong>
              </div>
            </div>

            {vehicle.violations?.length > 0 && (
              <div className="field-violation-list">
                {vehicle.violations.map((violation) => (
                  <div className="field-violation-row" key={violation.id}>
                    <div>
                      <strong>{violation.violationType}</strong>
                      <span>
                        {violation.violationCode}
                        {violation.mission?.missionCode
                          ? ` · ${violation.mission.missionCode}`
                          : ""}
                      </span>
                    </div>
                    <div className="field-violation-amount">
                      <strong>{formatMoney(violation.fineAmountGnf)}</strong>
                      <span className={violation.paid ? "paid" : "unpaid"}>
                        {violation.paid ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
