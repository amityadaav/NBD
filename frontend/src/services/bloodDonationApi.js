
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const bloodDonationApi = {
  registerDonor: (payload) =>
    apiRequest("/api/blood/donors/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getDonors: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiRequest(`/api/blood/donors?${params.toString()}`);
  },

  createBloodRequest: (payload) =>
    apiRequest("/api/blood/requests", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getBloodRequests: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiRequest(`/api/blood/requests?${params.toString()}`);
  },
};
