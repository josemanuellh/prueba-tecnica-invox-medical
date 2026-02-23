import { ref } from 'vue';
import { RealtimeClient } from '@speechmatics/real-time-client';

export const useRealtimeTranscription = () => {
    const isRecording = ref(false);
    const realtimeText = ref('');
    const finalTranscript = ref('');
    let client: RealtimeClient | null = null;
    let audioContext: AudioContext | null = null;
    let scriptProcessor: ScriptProcessorNode | null = null;
    let stream: MediaStream | null = null;

    const startRecording = async (token: string) => {
        try {
            isRecording.value = true;
            realtimeText.value = 'Conectando...';
            finalTranscript.value = '';

            client = new RealtimeClient();

            client.addEventListener('receiveMessage', ({ data }: any) => {
                if (data.message === 'AddTranscript') {
                    if (data.results && data.results.length > 0) {
                        const words = data.results.map((r: any) => r.alternatives?.[0]?.content).join(' ');
                        const isPunctuation = data.results[0].type === 'punctuation';

                        finalTranscript.value += (isPunctuation || finalTranscript.value === '' ? '' : ' ') + words;
                        realtimeText.value = finalTranscript.value;
                    }
                } else if (data.message === 'AddPartialTranscript') {
                    if (data.results && data.results.length > 0) {
                        const partial = data.results.map((r: any) => r.alternatives?.[0]?.content).join(' ');
                        realtimeText.value = finalTranscript.value + (finalTranscript.value === '' ? '' : ' ') + partial;
                    }
                } else if (data.message === 'RecognitionStarted') {
                    realtimeText.value = 'Escuchando...';
                    startAudioCapture();
                } else if (data.message === 'Error') {
                    console.error('error:', data);
                    stopRecording();
                }
            });

            await client.start(token, {
                transcription_config: {
                    language: 'es',
                    operating_point: 'enhanced',
                    enable_partials: true,
                    max_delay: 1.0
                },
                audio_format: {
                    type: 'raw',
                    encoding: 'pcm_s16le',
                    sample_rate: 16000
                }
            });

        } catch (err) {
            console.error('error:', err);
            stopRecording();
        }
    };

    const startAudioCapture = async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContext = new AudioContext({ sampleRate: 16000 }); // Speechmatics prefiere 16kHz
            const source = audioContext.createMediaStreamSource(stream);

            scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

            scriptProcessor.onaudioprocess = (e) => {
                if (!isRecording.value || !client) return;

                const inputData = e.inputBuffer.getChannelData(0);
                const pcmData = convertFloat32ToInt16(inputData);
                client.sendAudio(pcmData);
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);
        } catch (err) {
            console.error('error:', err);
            stopRecording();
        }
    };

    const convertFloat32ToInt16 = (buffer: Float32Array) => {
        // convertimos Float32 a Int16 para ahorrar ancho de banda
        let l = buffer.length;
        const buf = new Int16Array(l);
        while (l--) {
            const val = buffer[l] ?? 0;
            buf[l] = Math.min(1, val) * 0x7FFF;
        }
        return buf.buffer;
    };

    const stopRecording = () => {
        isRecording.value = false;

        if (client) {
            client.stopRecognition();
            client = null;
        }

        if (scriptProcessor) {
            scriptProcessor.disconnect();
            scriptProcessor = null;
        }

        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    };

    return {
        isRecording,
        realtimeText,
        startRecording,
        stopRecording
    };
};
