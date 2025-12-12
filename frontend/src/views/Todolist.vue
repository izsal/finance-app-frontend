<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card>
          <v-card-title class="text-h4 text-center pa-4"
            >Todo List</v-card-title
          >

          <v-card-text>
            <v-alert v-if="!hasToken" type="error" prominent>
              Anda belum login. Mengalihkan ke halaman login...
            </v-alert>

            <v-form v-else @submit.prevent="add" class="add-form">
              <v-row>
                <v-col cols="8">
                  <v-text-field
                    v-model="newTitle"
                    label="Add new todo..."
                    required
                    outlined
                    dense
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-btn type="submit" color="primary" block>Add Todo</v-btn>
                </v-col>
              </v-row>
            </v-form>

            <v-alert
              v-if="hasToken && store.todos.length === 0"
              type="info"
              prominent
            >
              No todos yet. Add one above!
            </v-alert>

            <div v-if="hasToken && store.todos.length > 0">
              <v-list>
                <v-list-item
                  v-for="todo in store.todos"
                  :key="todo.id || todo.ID"
                >
                  <v-list-item-content>
                    <v-list-item-title>
                      <v-checkbox
                        :input-value="todo.completed"
                        @change="toggle(todo)"
                        hide-details
                      >
                        <template v-slot:label>
                          <span :class="{ 'completed-text': todo.completed }">
                            {{ todo.title }}
                          </span>
                        </template>
                      </v-checkbox>
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn icon @click="del(todo.id || todo.ID)" color="error">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </div>

            <v-alert v-if="error" type="error" prominent>
              {{ error }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useTodoStore } from "../stores/todo";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const store = useTodoStore();
const auth = useAuthStore();
const router = useRouter();

const newTitle = ref("");
const error = ref("");

// Gunakan getter dari auth store untuk reactive state
const hasToken = computed(() => auth.isAuthenticated);

onMounted(async () => {
  // Pastikan auth store ter-update dengan token dari localStorage
  console.log("📋 TodoList mounted");
  console.log(
    "💾 Token from localStorage:",
    localStorage.getItem("token") ? "EXISTS" : "NOT FOUND"
  );

  auth.checkAuth();
  console.log(
    "🔐 Auth state after checkAuth - token:",
    auth.token ? "EXISTS" : "NOT FOUND"
  );
  console.log("🔐 isAuthenticated:", auth.isAuthenticated);

  if (!hasToken.value) {
    console.log("❌ No token found, redirecting to login");
    error.value = "Anda belum login. Mengalihkan ke halaman login...";
    setTimeout(() => router.push("/login"), 800);
    return;
  }

  try {
    console.log("📝 Fetching todos...");
    await store.fetchTodos();
    console.log("✅ Todos loaded successfully");
  } catch (e) {
    console.error("❌ Error fetching todos:", e);
    error.value = "Gagal load todo. Silakan login ulang.";
    setTimeout(() => router.push("/login"), 1500);
  }
});

function add() {
  if (!hasToken.value) return;
  if (newTitle.value.trim()) {
    store.addTodo(newTitle.value).catch((e) => {
      console.error("Error adding todo:", e);
      error.value = "Gagal menambahkan todo";
    });
    newTitle.value = "";
  }
}

function toggle(todo) {
  if (!hasToken.value) return;
  store.toggleTodo(todo).catch((e) => {
    console.error("Error toggling todo:", e);
    error.value = "Gagal mengubah status todo";
  });
}

function del(id) {
  if (!hasToken.value) return;
  store.deleteTodo(id).catch((e) => {
    console.error("Error deleting todo:", e);
    error.value = "Gagal menghapus todo";
  });
}
</script>

<style scoped>
.v-list-item.completed .v-list-item__title {
  text-decoration: line-through;
  opacity: 0.7;
}

.completed-text {
  text-decoration: line-through;
  opacity: 0.7;
}

.add-form {
  margin-bottom: 20px;
}
</style>
