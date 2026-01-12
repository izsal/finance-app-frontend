<template>
  <v-app theme="light">
    <!-- Navbar -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>App Finance Sederhana dengan Todo</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text @click="logout">
        <i class="lni lni-exit mr-2"></i>
        Logout
      </v-btn>
    </v-app-bar>

    <!-- Sidebar -->
    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list nav dense>
        <v-list-item-group active-class="deep-purple--text text--accent-4">
          <v-list-item to="/dashboard">
            <v-list-item-icon>
              <i class="lni lni-dashboard-square-1"></i>
            </v-list-item-icon>
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item>
          <v-list-item to="/todolist">
            <v-list-item-icon>
              <i class="lni lni-check-square-2"></i>
            </v-list-item-icon>
            <v-list-item-title>Todo List</v-list-item-title>
          </v-list-item>
          <v-list-item to="/finance">
            <v-list-item-icon>
              <i class="lni lni-wallet-1"></i>
            </v-list-item-icon>
            <v-list-item-title>Finance</v-list-item-title>
          </v-list-item>
        </v-list-item-group>

        <!-- Category Management Section -->
        <v-list-group>
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props">
              <v-list-item-icon>
                <i class="lni lni-folder-1"></i>
              </v-list-item-icon>
              <v-list-item-title>Categories</v-list-item-title>
            </v-list-item>
          </template>

          <v-list-item to="/categories/income">
            <v-list-item-title>Income Categories</v-list-item-title>
          </v-list-item>

          <v-list-item to="/categories/expense">
            <v-list-item-title>Expense Categories</v-list-item-title>
          </v-list-item>
        </v-list-group>

        <!-- Debt Management Section -->
        <v-list-group>
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props">
              <v-list-item-icon>
                <i class="lni lni-dollar"></i>
              </v-list-item-icon>
              <v-list-item-title>Debts</v-list-item-title>
            </v-list-item>
          </template>

          <v-list-item to="/debts">
            <v-list-item-title>Debt Dashboard</v-list-item-title>
          </v-list-item>
        </v-list-group>
      </v-list>

      <template v-slot:append>
        <div class="pa-4">
          <v-divider></v-divider>
          <div class="text-center mt-4">
            <i class="lni lni-user-4 mr-2"></i>
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

<style scoped>
.v-list-item-icon i.lni {
  font-size: 24px;
  color: inherit;
  display: inline-block;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  vertical-align: middle;
  width: 24px;
  height: 24px;
}

.v-list-item-icon i.lni::before {
  display: inline-block;
  font-family: "Lineicons" !important;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.v-btn i.lni {
  font-size: 20px;
  vertical-align: middle;
  display: inline-block;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  width: 20px;
  height: 20px;
}

.v-btn i.lni::before {
  display: inline-block;
  font-family: "Lineicons" !important;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

i.lni {
  font-family: "Lineicons" !important;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

i.lni::before {
  display: inline-block;
  font-family: "Lineicons" !important;
}
</style>
