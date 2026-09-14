import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

const refreshAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

function onRefreshed() {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
}

function onRefreshFailed(error) {
  refreshSubscribers.forEach((callback) => callback(error));
  refreshSubscribers = [];
}

axiosInstance.interceptors.response.use(
  (response) => {
    const payload = response.data;
    const data = payload?.data;

    if (data && typeof data === "object") {
      Object.defineProperty(data, "message", {
        value: payload.message,
        enumerable: false,
        configurable: true,
      });
      return data;
    }

    return data ?? payload;
  },

  async (error) => {
    const { response, config } = error;

    if (!response) return Promise.reject(error);

    const code = response.data?.code;
    const skipAuthRedirect = config?.skipAuthRedirect;

    if (code === "SESSION_EXPIRED") {
      if (!skipAuthRedirect) window.location.href = "/login";
      return Promise.reject(error);
    }

    if (
      (code === "ACCESS_TOKEN_MISSING" ||
        code === "INVALID_TOKEN" ||
        code === "TOKEN_EXPIRED") &&
      !config._retry
    ) {
      config._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((refreshError) => {
            if (refreshError) {
              reject(refreshError);
              return;
            }

            resolve(axiosInstance({ ...config, withCredentials: true }));
          });
        });
      }

      isRefreshing = true;
      try {
        await refreshAxiosInstance.post("/auth/refresh");
        isRefreshing = false;
        onRefreshed();
        return axiosInstance({ ...config, withCredentials: true });
      } catch (refreshError) {
        isRefreshing = false;
        onRefreshFailed(refreshError);
        if (!skipAuthRedirect) window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
