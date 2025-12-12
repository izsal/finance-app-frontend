import { defineStore } from "pinia";
import apiClient from "../api/client";

export const useTodoStore = defineStore("todo", {
  state: () => ({
    todos: [],
  }),
  actions: {
    async fetchTodos() {
      try {
        console.log("📝 Fetching todos from API...");
        const res = await apiClient.get("/api/todos");
        this.todos = res.data || [];
        console.log(
          "✅ Todos fetched successfully:",
          this.todos.length,
          "items"
        );
      } catch (error) {
        console.error("❌ Error fetching todos:", error);
        throw error;
      }
    },

    async addTodo(title) {
      try {
        console.log("➕ Adding todo:", title);
        const res = await apiClient.post("/api/todos", { title });
        this.todos.push(res.data);
        console.log("✅ Todo added successfully");
      } catch (error) {
        console.error("❌ Error adding todo:", error);
        throw error;
      }
    },

    async toggleTodo(todo) {
      try {
        console.log(
          "🔄 Toggling todo:",
          todo.id || todo.ID,
          "to",
          !todo.completed
        );
        const todoId = todo.id || todo.ID;
        const res = await apiClient.put(`/api/todos/${todoId}`, {
          title: todo.title,
          completed: !todo.completed,
        });

        // Update local state
        this.todos = this.todos.map((t) => {
          const currentId = t.id || t.ID;
          return currentId === todoId ? res.data : t;
        });
        console.log("✅ Todo toggled successfully");
      } catch (error) {
        console.error("❌ Error toggling todo:", error);
        // Revert optimistic update if needed
        throw error;
      }
    },

    async deleteTodo(id) {
      try {
        console.log("🗑️ Deleting todo:", id);
        await apiClient.delete(`/api/todos/${id}`);

        // Update local state
        this.todos = this.todos.filter((t) => {
          const currentId = t.id || t.ID;
          return currentId !== id;
        });
        console.log("✅ Todo deleted successfully");
      } catch (error) {
        console.error("❌ Error deleting todo:", error);
        throw error;
      }
    },
  },
});
