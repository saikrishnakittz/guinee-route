const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "" && val !== "All Regions" && val !== "All Supervisors" && val !== "All Guinea" && val !== "Agent Status") {
      query.append(key, val);
    }
  });
  const str = query.toString();
  return str ? `?${str}` : "";
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "API request failed");
  }

  return result.data;
}

export const getDashboardStats = () => request("/dashboard/stats");

export const getDashboardOverview = (params = {}) =>
  request(`/dashboard/overview${buildQuery(params)}`);

export const getLiveAgents = (params = {}) =>
  request(`/agents/live${buildQuery(params)}`);

export const updateAgentStatus = (id, status) =>
  request(`/agents/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const getMissions = (params = {}) =>
  request(`/missions${buildQuery(params)}`);

export const getMissionById = (id) =>
  request(`/missions/${id}`);

export const getDamageReports = (params = {}) =>
  request(`/damage-reports${buildQuery(params)}`);

export const createDamageReport = (payload) =>
  request("/damage-reports", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateDamageReportStatus = (id, status) =>
  request(`/damage-reports/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const getViolations = (params = {}) =>
  request(`/violations${buildQuery(params)}`);

export const updateViolationPayment = (id, payload) =>
  request(`/violations/${id}/payment`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const getActivities = (params = {}) =>
  request(`/activities${buildQuery(params)}`);

export const lookupVehicle = (plate) =>
  request(`/vehicles/lookup?plate=${encodeURIComponent(plate)}`);

