<template>
  <v-app theme="light">
    <!-- Navbar -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>App Finance Sederhana dengan Todo</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text @click="logout">
        <v-icon left>mdi-logout</v-icon>
        Logout
      </v-btn>
    </v-app-bar>

    <!-- Sidebar -->
    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list nav dense>
        <v-list-item-group active-class="deep-purple--text text--accent-4">
          <v-list-item to="/dashboard">
            <v-list-item-icon>
              <v-icon>mdi-view-dashboard</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item>
          <v-list-item to="/todolist">
            <v-list-item-icon>
              <v-icon>mdi-format-list-checks</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Todo List</v-list-item-title>
          </v-list-item>
          <v-list-item to="/finance">
            <v-list-item-icon>
              <v-icon>mdi-cash-multiple</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Finance</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>

      <template v-slot:append>
        <div class="pa-4">
          <v-divider></v-divider>
          <div class="text-center mt-4">
            <v-icon small class="mr-2">mdi-account</v-icon>
            <span>Welcome, {{ authStore.username }}!</span>
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main style="background-color: #ffffff">
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const drawer = ref(false);
const authStore = useAuthStore();
const router = useRouter();

function logout() {
  authStore.logout();
  router.push("/login");
}
</script>
