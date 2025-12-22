import { defineStore } from "pinia";
import apiClient from "../api/client";

export const useCategoryStore = defineStore("category", {
  state: () => ({
    categories: {
      income: [],
      expense: [],
    },
    loading: false,
    error: null,
  }),

  getters: {
    incomeCategories: (state) => state.categories.income,
    expenseCategories: (state) => state.categories.expense,
    getCategoryNameById: (state) => (id) => {
      const allCategories = [
        ...state.categories.income,
        ...state.categories.expense,
      ];
      const category = allCategories.find((cat) => cat.id === id);
      return category ? category.name : "";
    },
  },

  actions: {
    async fetchCategories(type) {
      this.loading = true;
      this.error = null;
      try {
        const res = await apiClient.get(`/api/categories?type=${type}`);
        this.categories[type] = res.data || [];
        return res.data;
      } catch (error) {
        this.error =
          error.response?.data?.error || `Failed to fetch ${type} categories`;
        console.error(`Error fetching ${type} categories:`, error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addCategory(categoryData) {
      this.loading = true;
      this.error = null;
      try {
        const res = await apiClient.post("/api/categories", categoryData);
        // Add to the appropriate category list
        if (res.data.type === "income") {
          this.categories.income.push(res.data);
        } else {
          this.categories.expense.push(res.data);
        }
        return res.data;
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to add category";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateCategory(id, categoryData) {
      this.loading = true;
      this.error = null;
      try {
        const res = await apiClient.put(`/api/categories/${id}`, categoryData);

        // Update in the appropriate category list
        if (categoryData.type === "income") {
          const index = this.categories.income.findIndex((c) => c.id === id);
          if (index !== -1) {
            this.categories.income[index] = res.data;
          }

          // If type changed, move to the other list
          const expenseIndex = this.categories.expense.findIndex(
            (c) => c.id === id
          );
          if (expenseIndex !== -1) {
            this.categories.expense.splice(expenseIndex, 1);
            this.categories.income.push(res.data);
          }
        } else {
          const index = this.categories.expense.findIndex((c) => c.id === id);
          if (index !== -1) {
            this.categories.expense[index] = res.data;
          }

          // If type changed, move to the other list
          const incomeIndex = this.categories.income.findIndex(
            (c) => c.id === id
          );
          if (incomeIndex !== -1) {
            this.categories.income.splice(incomeIndex, 1);
            this.categories.expense.push(res.data);
          }
        }

        return res.data;
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to update category";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteCategory(id, type) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.delete(`/api/categories/${id}`);

        // Remove from the appropriate category list
        if (type === "income") {
          this.categories.income = this.categories.income.filter(
            (c) => c.id !== id
          );
        } else {
          this.categories.expense = this.categories.expense.filter(
            (c) => c.id !== id
          );
        }
      } catch (error) {
        this.error = error.response?.data?.error || "Failed to delete category";
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
