import axios from "axios";

// Buat instance axios dengan base URL dari environment variable
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Interceptor untuk menambahkan token authorization secara otomatis
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("API Request:", config.method.toUpperCase(), config.url);
    console.log("Token found:", token ? "Yes" : "No");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Authorization header:", config.headers.Authorization);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk handle response errors
apiClient.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log("API Error:", error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      // Token expired atau tidak valid
      console.log("Unauthorized - redirecting to login");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
