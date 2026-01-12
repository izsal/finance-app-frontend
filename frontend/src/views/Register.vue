<template>
  <div class="register-page">
    <div class="background-container">
      <div class="shape"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
    <div class="register-container">
      <v-card class="register-card mx-auto pa-8" max-width="450" elevation="8">
        <v-img
          src="/logo.png" 
          height="80"
          contain
          class="mb-6 logo-animation"
        ></v-img>
        <v-card-title class="text-h4 font-weight-bold text-center mb-6">Create Account</v-card-title>
        
        <v-form @submit.prevent="register">
          <v-text-field
            v-model="username"
            label="Username"
            :error-messages="fieldErrors.username"
            @input="onUsernameInput"
            prepend-inner-icon="mdi-account"
            variant="outlined"
            clearable
            class="mb-4 input-animation"
          ></v-text-field>

          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            :error-messages="fieldErrors.password"
            @input="onPasswordInput"
            prepend-inner-icon="mdi-lock"
            variant="outlined"
            clearable
            class="mb-6 input-animation"
          ></v-text-field>

          <v-btn
            type="submit"
            color="primary"
            block
            :loading="isLoading"
            height="50"
            class="mt-4 register-btn"
            :class="{'pulse-animation': !isLoading}"
          >
            {{ isLoading ? "Registering..." : "Register" }}
          </v-btn>
        </v-form>

        <div class="text-center mt-6">
          <router-link to="/login" class="login-link">
            Already have an account? <span class="font-weight-bold">Login</span>
          </router-link>
        </div>

        <v-expand-transition>
          <v-alert v-if="success" type="success" prominent class="mt-6 success-animation">
            Registration successful! Redirecting to login...
          </v-alert>
        </v-expand-transition>

        <v-expand-transition>
          <v-alert v-if="generalError" type="error" prominent class="mt-6 error-animation">
            {{ generalError }}
          </v-alert>
        </v-expand-transition>
      </v-card>
    </div>
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
.register-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.background-container {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  width: 500px;
  height: 500px;
  top: -250px;
  right: -100px;
  animation: float 8s ease-in-out infinite;
}

.shape-2 {
  width: 300px;
  height: 300px;
  bottom: -150px;
  left: -50px;
  top: auto;
  right: auto;
  background: rgba(255, 255, 255, 0.08);
  animation: float 6s ease-in-out infinite;
  animation-delay: 2s;
}

.shape-3 {
  width: 200px;
  height: 200px;
  bottom: 30%;
  right: 10%;
  top: auto;
  left: auto;
  background: rgba(255, 255, 255, 0.05);
  animation: float 10s ease-in-out infinite;
  animation-delay: 1s;
}

.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  position: relative;
  z-index: 2;
}

.register-card {
  border-radius: 16px !important;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9) !important;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: transform 0.3s ease;
}

.register-card:hover {
  transform: translateY(-5px);
}

.register-btn {
  border-radius: 10px !important;
  text-transform: none !important;
  font-size: 1.1rem !important;
  letter-spacing: 1px;
  font-weight: 600 !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 15px rgba(0, 0, 0, 0.3) !important;
}

.login-link {
  color: #7e57c2;
  text-decoration: none;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: #5e35b1;
  text-decoration: underline;
}

.input-animation {
  transition: all 0.3s ease;
}

.input-animation:focus-within {
  transform: scale(1.02);
}

.logo-animation {
  animation: fadeIn 1s ease-out;
}

.error-animation {
  animation: shake 0.5s ease-in-out;
}

.success-animation {
  animation: slideDown 0.5s ease-out;
}

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
  100% {
    transform: translateY(0) rotate(0deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%, 100% {transform: translateX(0);}
  10%, 30%, 50%, 70%, 90% {transform: translateX(-5px);}
  20%, 40%, 60%, 80% {transform: translateX(5px);}
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(103, 58, 183, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(103, 58, 183, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(103, 58, 183, 0);
  }
}

/* Responsive for mobile view */
@media (max-width: 600px) {
  .register-card {
    margin: 0 20px;
  }
}
</style>
