import axios from "axios";

const axiosInstance = axios.create({
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
  (response) => response.data.data,

  async (error) => {
    const { response, config } = error;

    if (!response) return Promise.reject(error);

    const code = response.data?.code;

    if (config.skipAuthRedirect) {
      return Promise.reject(error);
    }

    if (code === "SESSION_EXPIRED") {
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (
      (code === "ACCESS_TOKEN_MISSING" || code === "INVALID_TOKEN") &&
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

            resolve(axiosInstance(config));
          });
        });
      }

      isRefreshing = true;
      try {
        await axiosInstance.post("/auth/refresh");
        isRefreshing = false;
        onRefreshed();
        return axiosInstance(config);
      } catch (refreshError) {
        isRefreshing = false;
        onRefreshFailed(refreshError);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
