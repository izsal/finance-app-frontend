import { defineStore } from "pinia";
import apiClient from "../api/client";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || "",
    username: localStorage.getItem("username") || "",
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(username, password) {
      try {
        console.log("🚀 Attempting login for:", username);
        const res = await apiClient.post("/api/login", { username, password });
        console.log("✅ Login successful, response:", res.data);

        this.token = res.data.token;
        this.username = username;
        localStorage.setItem("token", this.token);
        localStorage.setItem("username", username);

        console.log(
          "💾 Token saved to localStorage:",
          this.token.substring(0, 20) + "..."
        );
        console.log("💾 Username saved:", username);

        return { success: true };
      } catch (error) {
        console.log("❌ Login failed:", error.response?.data || error.message);
        // Handle different error types
        if (error.response?.data?.errors) {
          // Validation errors dari backend
          return { success: false, errors: error.response.data.errors };
        } else if (error.response?.data?.error) {
          // Single error message dari backend
          return { success: false, message: error.response.data.error };
        } else {
          // Network atau error lainnya
          return { success: false, message: "Login failed. Please try again." };
        }
      }
    },
    async register(username, password) {
      try {
        await apiClient.post("/api/register", { username, password });
        return { success: true };
      } catch (error) {
        // Handle different error types
        if (error.response?.data?.errors) {
          // Validation errors dari backend
          return { success: false, errors: error.response.data.errors };
        } else if (error.response?.data?.error) {
          // Single error message dari backend
          return { success: false, message: error.response.data.error };
        } else {
          // Network atau error lainnya
          return {
            success: false,
            message: "Registration failed. Please try again.",
          };
        }
      }
    },
    logout() {
      this.token = "";
      this.username = "";
      localStorage.removeItem("token");
      localStorage.removeItem("username");
    },
    checkAuth() {
      // Sync token dan username dari localStorage
      const savedToken = localStorage.getItem("token");
      const savedUsername = localStorage.getItem("username");

      if (savedToken) {
        this.token = savedToken;
      }
      if (savedUsername) {
        this.username = savedUsername;
      }
    },
  },
});
