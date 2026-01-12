import { defineStore } from "pinia";
import apiClient from "../api/client";

export const useDebtStore = defineStore("debt", {
  state: () => ({
    debts: [],
    summary: {
      owed: 0,
      owing: 0,
      balance: 0,
    },
    loading: false,
    error: null,
  }),

  getters: {
    debtsOwed: (state) => state.debts.filter((d) => d.type === "owed"),
    debtsOwing: (state) => state.debts.filter((d) => d.type === "owing"),
  },

  actions: {
    async fetchDebts() {
      this.loading = true;
      this.error = null;
      try {
        const res = await apiClient.get("/api/debts");
        this.debts = res.data || [];
        await this.fetchSummary();
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to fetch debts";
        console.error("Error fetching debts:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchDebtsByType(type) {
      this.loading = true;
      this.error = null;
      try {
        const res = await apiClient.get(`/api/debts/type?type=${type}`);
        this.debts = res.data || [];
      } catch (error) {
        this.error =
          error.response?.data?.error || `Failed to fetch ${type} debts`;
        console.error(`Error fetching ${type} debts:`, error);
      } finally {
        this.loading = false;
      }
    },

    async fetchSummary() {
      try {
        const res = await apiClient.get("/api/debts/summary");
        this.summary = res.data || { owed: 0, owing: 0, balance: 0 };
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to fetch summary";
        console.error("Error fetching summary:", error);
      }
    },

    async addDebt(debtData) {
      this.loading = true;
      this.error = null;
      try {
        const res = await apiClient.post("/api/debts", debtData);
        this.debts.unshift(res.data);
        await this.fetchSummary();
        return res.data;
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to add debt";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateDebt(id, debtData) {
      this.loading = true;
      this.error = null;
      try {
        console.log("Updating debt with data:", debtData); // 🔍 DEBUG

        const res = await apiClient.put(`/api/debts/${id}`, debtData);

        console.log("Response from API:", res.data); // 🔍 DEBUG

        const index = this.debts.findIndex((d) => d.id === id);
        if (index !== -1) {
          this.debts[index] = res.data;
        }
        await this.fetchSummary();
        return res.data;
      } catch (error) {
        console.error("Update debt error:", error.response?.data); // 🔍 DEBUG
        this.error = error.response?.data?.error || "Failed to update debt";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteDebt(id) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.delete(`/api/debts/${id}`);
        this.debts = this.debts.filter((d) => d.id !== id);
        await this.fetchSummary();
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to delete debt";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async makePayment(id, paymentData) {
      this.loading = true;
      this.error = null;
      try {
        const res = await apiClient.post(
          `/api/debts/${id}/payments`,
          paymentData
        );
        const index = this.debts.findIndex((d) => d.id === id);
        if (index !== -1) {
          this.debts[index] = res.data;
        }
        await this.fetchSummary();
        return res.data;
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to make payment";
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
