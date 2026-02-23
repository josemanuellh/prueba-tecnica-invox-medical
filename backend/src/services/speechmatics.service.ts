import { S3 } from 'aws-sdk';
import { createSpeechmaticsJWT } from '@speechmatics/auth';
import { BatchClient } from '@speechmatics/batch-client';

const s3 = new S3(
    process.env.IS_OFFLINE === 'true' ? {
        endpoint: process.env.S3_ENDPOINT || 'http://localhost:4566',
        s3ForcePathStyle: true,
        region: process.env.AWS_REGION || 'eu-south-2',
        accessKeyId: 'test',
        secretAccessKey: 'test'
    } : {}
);

const API_KEY = process.env.SPEECHMATICS_API_KEY!;
const client = new BatchClient({
    apiKey: API_KEY,
    appId: 'invox-medical-backend'
});

export const speechmaticsService = {
    async getRealtimeToken() {
        console.log('[Speechmatics-Service] generando token');
        try {
            const token = await createSpeechmaticsJWT({
                type: 'rt',
                apiKey: API_KEY,
                ttl: 3600
            });

            return token;
        } catch (error: any) {
            console.error('[Speechmatics-Service] SDK Token generation failed:', error.message);
            throw error;
        }
    },

    async startTranscriptionJob(key: string, bucket: string, callbackUrl?: string) {
        const audio = await s3.getObject({ Bucket: bucket, Key: key }).promise();
        const audioBuffer = audio.Body as Buffer;

        const blob = new Blob([audioBuffer]);
        const file = new File([blob], 'audio.wav', { type: 'audio/wav' });

        const config: any = {
            type: 'transcription',
            transcription_config: {
                language: 'es',
                operating_point: 'enhanced'
            }
        };

        if (callbackUrl) {
            config.notification_config = [
                {
                    url: callbackUrl,
                    contents: ["jobinfo", "transcript"]
                }
            ];
        }

        const response: any = await client.createTranscriptionJob(file, config);

        console.log(`[Speechmatics-Service] Job created: ${response.id}`);
        return response.id;
    },

    parseTranscript(data: any) {
        if (!data || !data.results) {
            return '';
        }

        let result = '';
        const results = data.results;
        console.log(`[Speechmatics-Service] Results: ${JSON.stringify(results)}`);

        for (let i = 0; i < results.length; i++) {
            const item = results[i];
            const content = item.alternatives?.[0]?.content || '';
            const type = item.type;

            if (i > 0 && type === 'word') {
                result += ' ';
            }
            result += content;
        }

        return result;
    },

    async getResult(jobId: string) {
        const response = await client.getJobResult(jobId, 'json-v2');
        return this.parseTranscript(response);
    }
};
