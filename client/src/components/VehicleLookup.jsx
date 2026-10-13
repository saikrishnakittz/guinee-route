import { useState } from "react";
import { Search, CarFront, AlertTriangle } from "lucide-react";
import { lookupVehicle } from "../services/api";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-US").format(amount || 0) + " GNF";

export default function VehicleLookup() {
  const [plate, setPlate] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setVehicle(null);
    setError("");

    if (!plate.trim()) {
      setError("Enter a license plate number.");
      return;
    }

    setLoading(true);

    try {
      const result = await lookupVehicle(plate.trim());
      setVehicle(result);
    } catch (err) {
      setError(err.message || "Vehicle lookup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel vehicle-panel" id="vehicles">
      <div className="panel-heading">
        <div>
          <div className="eyebrow">VEHICLE INTELLIGENCE</div>
          <h2>Vehicle Lookup</h2>
          <p className="panel-subtitle">
            Search registered vehicles and violations
          </p>
        </div>
        <div className="vehicle-icon">
          <CarFront size={22} />
        </div>
      </div>

      <form className="lookup-form" onSubmit={handleSubmit}>
        <label htmlFor="plate">License plate number</label>
        <div className="search-field">
          <Search size={18} />
          <input
            id="plate"
            value={plate}
            onChange={(event) => setPlate(event.target.value)}
            placeholder="e.g. GN-1234-AA"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

      {vehicle && (
        <div className="vehicle-result">
          <div className="vehicle-result-header">
            <div className="plate-symbol">
              <CarFront size={23} />
            </div>
            <div>
              <strong>{vehicle.licensePlate}</strong>
              <p>Registered vehicle</p>
            </div>
            <span className="status-pill paid-pill">Found</span>
          </div>

          <div className="vehicle-detail">
            <span>Registered owner</span>
            <strong>{vehicle.owner}</strong>
          </div>

          <div className="fine-summary">
            <div>
              <span>Outstanding fines</span>
              <strong>{formatMoney(vehicle.unpaidFinesGnf)}</strong>
            </div>
            <AlertTriangle size={21} />
          </div>

          <div className="violation-heading">
            Violations ({vehicle.violations?.length || 0})
          </div>

          {vehicle.violations?.length ? (
            vehicle.violations.map((violation) => (
              <div className="violation-row" key={violation.id}>
                <div>
                  <strong>{violation.violationType}</strong>
                  <p>{violation.violationCode}</p>
                  {violation.mission && <p>{violation.mission.missionCode}</p>}
                </div>
                <div className="violation-amount">
                  <strong>{formatMoney(violation.fineAmountGnf)}</strong>
                  <span
                    className={violation.paid ? "paid-text" : "unpaid-text"}
                  >
                    {violation.paid ? "Paid" : "Unpaid"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="empty-state">No violations recorded.</p>
          )}
        </div>
      )}

      {!vehicle && !error && (
        <div className="lookup-empty">
          <Search size={25} />
          <p>Search a plate to view vehicle and violation records.</p>
          <span>Try GN-1234-AA with the seeded demo data.</span>
        </div>
      )}
    </section>
  );
}
