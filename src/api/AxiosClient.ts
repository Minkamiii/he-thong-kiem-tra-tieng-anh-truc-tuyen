import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_USER_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const refreshToken = localStorage.getItem("refreshToken");

  const isAuthUrl =
    config.url?.includes("/api/auth/loginAdmin") ||
    config.url?.includes("/api/auth/refresh") ||
    config.url?.includes("/api/auth/logout");

  if (refreshToken && !isAuthUrl) {
    config.headers.Authorization = `Bearer ${refreshToken}`;
  }

  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(p =>
    error ? p.reject(error) : p.resolve(token)
  );
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newRefreshToken) => {
          originalRequest.headers.Authorization = `Bearer ${newRefreshToken}`;
          return axiosClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        localStorage.clear();
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_USER_API_URL}/api/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const newRefreshToken = res.data?.refreshToken;
        if (!newRefreshToken) throw new Error("No refresh token");

        localStorage.setItem("refreshToken", newRefreshToken);

        processQueue(null, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newRefreshToken}`;
        return axiosClient(originalRequest);

      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = "/";
        alert("Login session expried. Please login again")
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
