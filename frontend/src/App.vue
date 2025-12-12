<template>
  <div id="app">
    <!-- Show Login & Register layout when NOT authenticated -->
    <template v-if="!authStore.isAuthenticated">
      <router-view />
    </template>

    <!-- Show App Layout when authenticated -->
    <template v-else>
      <AppLayout />
    </template>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useAuthStore } from "./stores/auth";
import AppLayout from "./layouts/AppLayout.vue";

const authStore = useAuthStore();

onMounted(() => {
  authStore.checkAuth();
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
