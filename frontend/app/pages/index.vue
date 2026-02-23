<template>
  <div class="max-w-7xl mx-auto w-full">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Historial</h1>
        <p class="text-slate-500 mt-1">
          Todas tus transcripciones en un solo lugar
        </p>
      </div>

      <NuxtLink
        to="/transcribe"
        class="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clip-rule="evenodd"
          />
        </svg>
        Nueva
      </NuxtLink>
    </div>

    <div
      v-if="loading && items.length === 0"
      class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm"
    >
      <div
        class="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4"
      ></div>
      <p class="text-slate-500">Cargando tu historial...</p>
    </div>

    <div
      v-else-if="items?.length === 0"
      class="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm"
    >
      <div
        class="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>
      <h3 class="text-xl font-bold text-slate-900 mb-2">
        Aún no tienes transcripciones
      </h3>
      <p class="text-slate-500 mb-8">
        Empieza subiendo un archivo de audio o usa el micrófono.
      </p>
      <NuxtLink
        to="/transcribe"
        class="text-indigo-600 font-bold hover:underline"
        >Empieza ahora →</NuxtLink
      >
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="item in items"
        :key="item.id"
        class="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3
                class="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors"
              >
                {{ item.title }}
              </h3>
              <span
                :class="[
                  'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider',
                  statusClasses(item.status),
                ]"
              >
                {{ statusLabel(item.status) }}
              </span>
            </div>
            <p class="text-sm text-slate-400 flex items-center gap-2 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {{ formatDate(item.createdAt) }}
            </p>
            <p class="text-slate-600 line-clamp-2 text-sm leading-relaxed">
              {{ item.text || "Procesando transcripción..." }}
            </p>
          </div>

          <div class="flex flex-col gap-2 ml-4">
            <button
              @click="downloadTranscription(item)"
              v-if="item.status === 'completed'"
              class="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-all border border-slate-100"
              title="Descargar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
            <button
              @click="deleteTranscription(item)"
              class="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all border border-slate-100"
              title="Borrar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-if="lastKey" class="pt-8 text-center">
        <button
          @click="loadMore"
          :disabled="loading"
          class="px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          {{ loading ? "Cargando más..." : "Cargar más resultados" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ITranscription } from "../../../shared";

const items = ref<ITranscription[]>([]);
const lastKey = ref<string | null>(null);
const loading = ref(true);
const config = useRuntimeConfig();
const authStore = useAuthStore();
let pollInterval: any = null;

const fetchHistory = async (key: string | null = null, silent = false) => {
  if (!silent) loading.value = true;
  try {
    const token = await authStore.getToken();
    const url = new URL(`${config.public.apiUrl}/transcriptions`);
    if (key) url.searchParams.append("lastKey", key);

    const response = await $fetch<any>(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (key) {
      // Loading more results: Append new items
      const newItems = response.data.filter((ni: any) => !items.value.find(i => i.id === ni.id));
      items.value.push(...newItems);
      lastKey.value = response.lastKey;
    } else if (silent) {
      // Polling update: Update status/text of existing items without resetting the whole list
      response.data.forEach((ni: any) => {
        const index = items.value.findIndex(i => i.id === ni.id);
        if (index !== -1) {
          // Update existing item
          items.value[index] = { ...items.value[index], ...ni };
        } else {
          // If it's a completely new item (e.g. just uploaded), add it to the top
          items.value.unshift(ni);
        }
      });
      // Do NOT update lastKey during polling to avoid resetting pagination
    } else {
      // Initial load: Replace everything
      items.value = response.data;
      lastKey.value = response.lastKey;
    }

    // Check if we need to continue polling
    checkPolling();
  } catch (error) {
    console.error("Error fetching history:", error);
  } finally {
    if (!silent) loading.value = false;
  }
};

const checkPolling = () => {
  const hasProcessing = items.value.some(i => i.status === 'processing');
  if (hasProcessing && !pollInterval) {
    pollInterval = setInterval(() => fetchHistory(null, true), 5000);
  } else if (!hasProcessing && pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
};

const loadMore = () => {
  if (lastKey.value) {
    fetchHistory(lastKey.value);
  }
};

onMounted(() => {
  fetchHistory();
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
};

const statusClasses = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-600";
    case "processing":
      return "bg-amber-50 text-amber-600 animate-pulse";
    case "failed":
      return "bg-red-50 text-red-600";
    default:
      return "bg-slate-50 text-slate-600";
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case "completed":
      return "Completado";
    case "processing":
      return "En curso";
    case "failed":
      return "Error";
    default:
      return status;
  }
};

const downloadTranscription = (item: ITranscription) => {
  const blob = new Blob([item.text], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${item.title.replace(/\s+/g, "_")}_transcripcion.txt`;
  a.click();
  window.URL.revokeObjectURL(url);
};

const deleteTranscription = async (item: ITranscription) => {
  if (!confirm(`¿Estás seguro de que quieres borrar "${item.title}"?`)) return;

  try {
    const token = await authStore.getToken();
    await $fetch(`${config.public.apiUrl}/transcriptions`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        createdAt: item.createdAt
      }
    });

    // Remove from local list
    items.value = items.value.filter(i => i.id !== item.id);
  } catch (err: any) {
    alert('Error al borrar la transcripción: ' + (err.message || 'Error desconocido'));
  }
};
</script>
