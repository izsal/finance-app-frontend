import { defineStore } from "pinia";
import apiClient from "../api/client";

export const useTransactionStore = defineStore("transaction", {
  state: () => ({
    transactions: [],
    summary: {
      income: 0,
      expense: 0,
      balance: 0,
    },
    loading: false,
    error: null,
  }),

  getters: {
    incomeTransactions: (state) =>
      state.transactions.filter((t) => t.type === "income"),
    expenseTransactions: (state) =>
      state.transactions.filter((t) => t.type === "expense"),
  },

  actions: {
    async fetchTransactions() {
      this.loading = true;
      this.error = null;
      try {
        const res = await apiClient.get("/api/transactions");
        this.transactions = res.data || [];
        await this.fetchSummary();
      } catch (error) {
        this.error =
          error.response?.data?.error || "Failed to fetch transactions";
        console.error("Error fetching transactions:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchSummary() {
      try {
        const res = await apiClient.get("/api/transactions/summary");
        this.summary = res.data || { income: 0, expense: 0, balance: 0 };
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to fetch summary";
        console.error("Error fetching summary:", error);
      }
    },

    async addTransaction(transactionData) {
      this.loading = true;
      this.error = null;
      try {
        const res = await apiClient.post("/api/transactions", transactionData);
        this.transactions.unshift(res.data);
        await this.fetchSummary();
        return res.data;
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to add transaction";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateTransaction(id, transactionData) {
      this.loading = true;
      this.error = null;
      try {
        const res = await apiClient.put(
          `/api/transactions/${id}`,
          transactionData
        );
        const index = this.transactions.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.transactions[index] = res.data;
        }
        await this.fetchSummary();
        return res.data;
      } catch (error) {
        this.error =
          error.response?.data?.error || "Failed to update transaction";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteTransaction(id) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.delete(`/api/transactions/${id}`);
        this.transactions = this.transactions.filter((t) => t.id !== id);
        await this.fetchSummary();
      } catch (error) {
        this.error =
          error.response?.data?.error || "Failed to delete transaction";
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
