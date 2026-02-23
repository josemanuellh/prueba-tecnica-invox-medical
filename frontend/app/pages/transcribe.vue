<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Nueva Transcripción</h1>
        <p class="text-slate-500 mt-1">Elige cómo quieres procesar tu audio</p>
      </div>

      <div
        class="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100"
      >
        <button
          @click="mode = 'file'"
          :class="[
            'px-6 py-2 rounded-lg text-sm font-medium transition-all',
            mode === 'file'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50',
          ]"
        >
          Fichero
        </button>
        <button
          @click="mode = 'realtime'"
          :class="[
            'px-6 py-2 rounded-lg text-sm font-medium transition-all',
            mode === 'realtime'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50',
          ]"
        >
          Tiempo real
        </button>
      </div>
    </div>

    <!-- Mode: File Upload -->
    <div
      v-if="mode === 'file'"
      class="bg-white p-8 rounded-2xl shadow-xl border border-slate-100"
    >
      <div
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        :class="[
          'border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer',
          isDragging
            ? 'border-indigo-600 bg-indigo-50'
            : 'border-slate-200 hover:border-indigo-400',
        ]"
        @click="fileInput?.click()"
      >
        <input
          type="file"
          ref="fileInput"
          class="hidden"
          accept="audio/*"
          @change="handleFileSelect"
        />

        <div
          class="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <h3 class="text-lg font-semibold text-slate-900">
          {{
            selectedFile
              ? selectedFile.name
              : "Haz clic para subir o arrastra un audio"
          }}
        </h3>
        <p class="text-slate-500 mt-1">
          Formatos soportados: MP3, WAV, M4A (Máximo 20MB)
        </p>
      </div>

      <div class="mt-8">
        <label class="block text-sm font-medium text-slate-700 mb-2"
          >Título de la transcripción (opcional)</label
        >
        <input
          v-model="title"
          type="text"
          placeholder="Eje: Reunión de equipo - 22 Oct"
          class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      <div v-if="uploadProgress > 0" class="mt-8">
        <div class="flex justify-between text-sm mb-2">
          <span class="text-slate-600">Subiendo fichero...</span>
          <span class="font-semibold text-indigo-600"
            >{{ uploadProgress }}%</span
          >
        </div>
        <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            class="h-full bg-indigo-600 transition-all duration-300"
            :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
      </div>

      <div
        v-if="error"
        class="mt-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm"
      >
        {{ error }}
      </div>

      <button
        @click="uploadFile"
        :disabled="!selectedFile || isUploading"
        class="w-full mt-8 py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:shadow-none"
      >
        {{ isUploading ? "Subiendo..." : "Empezar transcripción" }}
      </button>
    </div>

    <!-- Mode: Real-time -->
    <div
      v-else
      class="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center"
    >
      <div class="py-12">
        <div
          :class="[
            'w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 transition-all',
            isRecording
              ? 'bg-red-100 text-red-600'
              : 'bg-slate-100 text-slate-400',
          ]"
        >
          <svg
            v-if="!isRecording"
            xmlns="http://www.w3.org/2000/svg"
            class="h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          <div v-else class="flex items-center gap-1">
            <span
              v-for="i in 5"
              :key="i"
              class="w-2 bg-red-600 rounded-full animate-pulse"
              :style="{
                height: 10 + Math.random() * 40 + 'px',
                animationDelay: i * 0.1 + 's',
              }"
            ></span>
          </div>
        </div>

        <h2 class="text-2xl font-bold text-slate-900 mb-2">
          {{ isRecording ? "Escuchando..." : "Pulsa el botón para hablar" }}
        </h2>
        <p class="text-slate-500 max-w-sm mx-auto">
          {{
            isRecording
              ? "La transcripción se procesará al finalizar la grabación"
              : "Se activará el micrófono de tu ordenador para transcribir en directo"
          }}
        </p>

        <div
          v-if="realtimeText"
          class="mt-8 p-6 bg-slate-50 rounded-2xl text-left italic text-slate-700 min-h-[100px] border border-slate-100"
        >
          {{ realtimeText }}
        </div>

        <button
          @click="toggleRecording"
          :class="[
            'mt-8 px-12 py-4 rounded-xl font-bold text-lg transition-all shadow-lg',
            isRecording
              ? 'bg-red-600 text-white shadow-red-200 hover:bg-red-700'
              : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700',
          ]"
        >
          {{ isRecording ? "Detener grabación" : "Empezar a hablar" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from 'nuxt/app';
import { ref } from 'vue';
const fileInput = ref<HTMLInputElement | null>(null);

const mode = ref("file");
const isDragging = ref(false);
const selectedFile = ref<File | null>(null);
const isUploading = ref(false);
const uploadProgress = ref(0);
const title = ref("");
const error = ref("");
const config = useRuntimeConfig();
const authStore = useAuthStore();

const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    validateAndSetFile(file);
  }
};

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    validateAndSetFile(file);
  }
};

const validateAndSetFile = (file: File) => {
  if (file.size > 20 * 1024 * 1024) {
    error.value = "El archivo es demasiado grande. El límite es 20MB.";
    selectedFile.value = null;
    return;
  }
  error.value = "";
  selectedFile.value = file;
};

const uploadFile = async () => {
  if (!selectedFile.value) return;

  isUploading.value = true;
  error.value = "";

  try {
    const token = await authStore.getToken();

    // obtener URL firmada de S3
    const { uploadUrl, transcriptionId, createdAt } = await $fetch<any>(
      `${config.public.apiUrl}/transcriptions/upload-url`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          filename: selectedFile.value.name,
          contentType: selectedFile.value.type,
          title: title.value,
        },
      },
    );

    // subir a S3
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", selectedFile.value.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        uploadProgress.value = Math.round((e.loaded / e.total) * 100);
      }
    };

    const uploadPromise = new Promise((resolve, reject) => {
      xhr.onload = () =>
        xhr.status === 200
          ? resolve(true)
          : reject(new Error("Failed to upload"));
      xhr.onerror = () => reject(new Error("Network error"));
    });

    xhr.send(selectedFile.value);
    await uploadPromise;

    // iniciar procesamiento con Speechmatics (en segundo plano lo recogera el webhook activo con ngrok)
    // obtenemos el fileKey del response de upload-url
    const userId = (await authStore.getUser())?.userId;
    const fileKey = `${userId}/${transcriptionId}-${selectedFile.value.name}`;

    $fetch(`${config.public.apiUrl}/transcriptions/process`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        transcriptionId,
        createdAt,
        fileKey,
      },
    }).catch((err: any) => console.error('Error procesando transcripción:', err));

    // redirigir al historial
    navigateTo("/");
  } catch (err: any) {
    error.value = err.message || "Error al procesar la subida";
  } finally {
    isUploading.value = false;
  }
};

const { isRecording, realtimeText, startRecording, stopRecording } = useRealtimeTranscription();

const toggleRecording = async () => {
  if (isRecording.value) {
    stopRecording();
    // guardar el resultado final
    if (realtimeText.value && realtimeText.value !== 'Escuchando...') {
      await saveRealtimeTranscription();
    }
  } else {
    try {
      error.value = "";
      const token = await authStore.getToken();
      
      // obtener token de tiempo real del backend
      const response = await $fetch<any>(`${config.public.apiUrl}/transcriptions/rt-token`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // grabar
      await startRecording(response.token);
    } catch (err: any) {
      error.value = "Error al iniciar el micrófono o conectar con el servidor.";
      console.error(err);
    }
  }
};

const saveRealtimeTranscription = async () => {
  try {
    const token = await authStore.getToken();
    await $fetch(`${config.public.apiUrl}/transcriptions/save-realtime`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: {
        text: realtimeText.value,
        title: title.value || `Grabación en directo - ${new Date().toLocaleString()}`
      }
    });
    navigateTo("/");
  } catch (err) {
    console.error('Error guardando transcripción:', err);
  }
};
</script>
