import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Attach token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// If backend reports unauthorized for a tokened session,
// clear stale auth state and force a fresh login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const hadToken = !!localStorage.getItem("token");
      if (hadToken) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (window.location.pathname !== "/login") {
          const next = encodeURIComponent(
            `${window.location.pathname}${window.location.search}${window.location.hash}`,
          );
          window.location.assign(`/login?expired=1&next=${next}`);
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
