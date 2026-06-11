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
        const originalRequest =
            error.config;

        // if not 401 → reject
        if (
            error.response?.status !==
            401
        ) {
            return Promise.reject(
                error
            );
        }

        // stop infinite loop
        if (
            originalRequest._retry
        ) {
            return Promise.reject(
                error
            );
        }

        // never intercept refresh endpoint
        if (
            originalRequest.url?.includes(
                "/auth/refresh"
            )
        ) {
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

        originalRequest._retry =
            true;

        isRefreshing = true;

        try {
            console.log(
                "refresh called"
            );

            await refreshApi.post(
                "/auth/refresh"
            );

            processQueue();

            // retry once only
            return api(
                originalRequest
            );
        } catch (
        refreshError
        ) {
            processQueue(
                refreshError
            );

            // redirect only if refresh fails
            if (typeof window !== "undefined") {
                if (window.location.pathname !=="/login") {
                    window.location.replace(
                        "/login"
                    );
                }
            }

            return Promise.reject(
                refreshError
            );
        } finally {
            isRefreshing = false;
        }
    }
);