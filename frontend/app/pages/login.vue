<template>
  <div class="max-w-md mx-auto mt-20">
    <div class="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900">Bienvenido</h1>
        <p class="text-slate-500 mt-2">
          Inicia sesión en tu cuenta de Invox Medical
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2"
            >Email</label
          >
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2"
            >Contraseña</label
          >
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        <div v-if="error" class="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-50"
        >
          <span v-if="loading">Cargando...</span>
          <span v-else>Iniciar sesión</span>
        </button>
      </form>

      <div class="mt-8 text-center text-sm text-slate-500">
        ¿No tienes cuenta?
        <NuxtLink
          to="/register"
          class="text-indigo-600 font-semibold hover:underline"
          >Regístrate ahora</NuxtLink
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { signIn } from "aws-amplify/auth";
import { navigateTo } from "nuxt/app";

definePageMeta({
  layout: false,
});

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);
const authStore = useAuthStore();

const handleLogin = async () => {
  loading.value = true;
  error.value = "";
  try {
    await signIn({ username: email.value, password: password.value });
    await authStore.checkAuth();
    navigateTo("/");
  } catch (err: any) {
    error.value = err.message || "Error al iniciar sesión";
  } finally {
    loading.value = false;
  }
};
</script>
