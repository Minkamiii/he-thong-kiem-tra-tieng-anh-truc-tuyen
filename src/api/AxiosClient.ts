import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8081/userservice", // đổi cho khớp BE
  headers: {
    "Content-Type": "application/json",
  },
});

// Gắn token vào mọi request nếu có
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  const isAuthUrl =
    config.url?.includes("/api/auth/loginAdmin") ;

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
