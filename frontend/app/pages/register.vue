<template>
  <div class="max-w-md mx-auto mt-20">
    <div class="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      <div v-if="!confirmStep">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-slate-900">Crea tu cuenta</h1>
          <p class="text-slate-500 mt-2">
            Únete a la plataforma de Invox Medical
          </p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-6">
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
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div
            v-if="error"
            class="p-3 rounded-lg bg-red-50 text-red-600 text-sm"
          >
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-50"
          >
            <span v-if="loading">Cargando...</span>
            <span v-else>Registrarse</span>
          </button>
        </form>

        <div class="mt-8 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?
          <NuxtLink
            to="/login"
            class="text-indigo-600 font-semibold hover:underline"
            >Inicia sesión</NuxtLink
          >
        </div>
      </div>

      <div v-else>
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-slate-900">Verifica tu email</h1>
          <p class="text-slate-500 mt-2">
            Introduce el código que te hemos enviado
          </p>
        </div>

        <form @submit.prevent="handleConfirm" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2"
              >Código de verificación</label
            >
            <input
              v-model="code"
              type="text"
              required
              class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-center tracking-widest text-2xl font-bold"
              placeholder="000000"
            />
          </div>

          <div
            v-if="error"
            class="p-3 rounded-lg bg-red-50 text-red-600 text-sm"
          >
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-50"
          >
            <span v-if="loading">Verificando...</span>
            <span v-else>Confirmar cuenta</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { signUp, confirmSignUp } from "aws-amplify/auth";
import { navigateTo } from "nuxt/app";
import { ref } from "vue";

definePageMeta({
  layout: false,
});

const email = ref("");
const password = ref("");
const code = ref("");
const error = ref("");
const loading = ref(false);
const confirmStep = ref(false);

const handleRegister = async () => {
  loading.value = true;
  error.value = "";
  try {
    const { isSignUpComplete, nextStep } = await signUp({
      username: email.value,
      password: password.value,
      options: {
        userAttributes: {
          email: email.value,
        },
      },
    });

    if (nextStep.signUpStep === "CONFIRM_SIGN_UP") {
      confirmStep.value = true;
    } else if (isSignUpComplete) {
      navigateTo("/login");
    }
  } catch (err: any) {
    error.value = err.message || "Error al registrarse";
  } finally {
    loading.value = false;
  }
};

const handleConfirm = async () => {
  loading.value = true;
  error.value = "";
  try {
    await confirmSignUp({
      username: email.value,
      confirmationCode: code.value,
    });
    navigateTo("/login");
  } catch (err: any) {
    error.value = err.message || "Error al confirmar código";
  } finally {
    loading.value = false;
  }
};
</script>
