<template>
  <div class="register-container">
    <v-card class="mx-auto pa-6" max-width="400">
      <v-card-title class="text-h5 text-center mb-4">Register</v-card-title>

      <v-form @submit.prevent="register">
        <v-text-field
          v-model="username"
          label="Username"
          :error-messages="fieldErrors.username"
          outlined
          clearable
          class="mb-4"
        ></v-text-field>

        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          :error-messages="fieldErrors.password"
          outlined
          clearable
          class="mb-4"
        ></v-text-field>

        <v-btn
          type="submit"
          color="primary"
          block
          :loading="isLoading"
          class="mt-2"
        >
          {{ isLoading ? "Registering..." : "Register" }}
        </v-btn>
      </v-form>

      <div class="text-center mt-4">
        <router-link to="/login">Already have an account? Login</router-link>
      </div>

      <!-- Success message -->
      <v-alert v-if="success" type="success" prominent class="mt-4">
        Registration successful! Redirecting to login...
      </v-alert>

      <!-- General error message -->
      <v-alert v-if="generalError" type="error" prominent class="mt-4">
        {{ generalError }}
      </v-alert>
    </v-card>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const username = ref("");
const password = ref("");
const generalError = ref("");
const success = ref(false);
const isLoading = ref(false);
const fieldErrors = reactive({
  username: "",
  password: "",
});

const store = useAuthStore();
const router = useRouter();

// Clear errors when user types
function clearErrors() {
  generalError.value = "";
  fieldErrors.username = "";
  fieldErrors.password = "";
}

async function register() {
  clearErrors();
  isLoading.value = true;

  try {
    const result = await store.register(username.value, password.value);

    if (result.success) {
      success.value = true;
      setTimeout(() => router.push("/login"), 2000);
    } else {
      // Handle validation errors
      if (result.errors) {
        fieldErrors.username = result.errors.username || "";
        fieldErrors.password = result.errors.password || "";
      }
      // Handle general error message
      if (result.message) {
        generalError.value = result.message;
      }
    }
  } catch (e) {
    generalError.value = e.stack;
  } finally {
    isLoading.value = false;
  }
}

// Clear field errors when user starts typing
function onUsernameInput() {
  if (fieldErrors.username) fieldErrors.username = "";
}

function onPasswordInput() {
  if (fieldErrors.password) fieldErrors.password = "";
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}
</style>
