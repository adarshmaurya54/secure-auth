import axios from "axios";

export const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

const refreshApi = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

let isRefreshing = false;

let failedQueue: Array<{
    resolve: () => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (
    error?: unknown
) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve();
        }
    });

    failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const shouldRefresh = error.response?.status === 401 && !originalRequest._retry &&
      ![
        "/auth/login",
        "/auth/register",
        "/auth/verify-email",
        "/auth/forgot-password",
        "/auth/reset-password",
      ].some((route) =>
        originalRequest.url?.includes(
          route
        )
      );

    // if refresh not needed
    if (!shouldRefresh) {
      return Promise.reject(
        error
      );
    }

    // queue pending requests
    if (isRefreshing) {
      return new Promise(
        (resolve, reject) => {
          failedQueue.push({
            resolve: () =>
              resolve(
                api(
                  originalRequest
                )
              ),
            reject,
          });
        }
      );
    }

    originalRequest._retry = true;

    isRefreshing = true;

    try {
      console.log("refresh called");

      await refreshApi.post(
        "/auth/refresh"
      );

      processQueue();

      return api(
        originalRequest
      );
    } catch (
      refreshError
    ) {
      processQueue(
        refreshError
      );

      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.replace(
          "/login"
        );
      }

      return Promise.reject(
        refreshError
      );
    } finally {
      isRefreshing = false;
    }
  }
);