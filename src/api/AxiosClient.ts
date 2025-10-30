import axios from "axios";

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_USER_API_URL}`, // đổi cho khớp BE
  headers: {
    "Content-Type": "application/json",
  },
});

// Gắn token vào mọi request nếu có
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("refreshToken");
  const isAuthUrl =
    config.url?.includes("/api/auth/loginAdmin") ||
    config.url?.includes("/api/auth/logout");

  if (token && !isAuthUrl) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý response lỗi
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;
