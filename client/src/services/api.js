// const API_BASE_URL = "https://guinee-route-api.onrender.com/api/v1" || "http://localhost:5000/api/v1";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

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

export const getLiveAgents = () => request("/agents/live");

export const updateAgentStatus = (id, status) =>
  request(`/agents/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const lookupVehicle = (plate) =>
  request(`/vehicles/lookup?plate=${encodeURIComponent(plate)}`);
