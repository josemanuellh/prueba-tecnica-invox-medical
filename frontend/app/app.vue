<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans">
    <header
      class="bg-white border-b border-slate-200 sticky top-0 z-10 min-h-[64px]"
    >
      <nav
        v-if="authStore.isAuthenticated"
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
      >
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"
          >
            <span class="text-white font-bold">V</span>
          </div>
          <span class="text-xl font-bold tracking-tight text-slate-900"
            >Invox Medical</span
          >
        </div>

        <div class="flex items-center gap-6">
          <NuxtLink
            to="/"
            class="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            active-class="text-indigo-600"
          >
            Historial
          </NuxtLink>
          <NuxtLink
            to="/transcribe"
            class="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            active-class="text-indigo-600"
          >
            Transcribir
          </NuxtLink>
          <button
            @click="logout"
            class="text-sm font-medium px-4 py-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NuxtPage />
    </main>

    <footer
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-200 text-center"
    ></footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
const authStore = useAuthStore();

onMounted(async () => {
  await authStore.checkAuth();
});

const logout = async () => {
  await authStore.logout();
};
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.2s ease-in-out;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
