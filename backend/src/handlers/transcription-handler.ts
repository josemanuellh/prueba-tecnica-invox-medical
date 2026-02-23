import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { databaseService } from '../services/database.service';
import { s3Service } from '../services/s3.service';
import { speechmaticsService } from '../services/speechmatics.service';
import type { ITranscription } from '../types/shared';

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
    "Access-Control-Allow-Credentials": true
};

export const getRtToken: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub as string;
        if (!userId) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Unauthorized' }) };

        const token = await speechmaticsService.getRealtimeToken();

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ token }),
        };
    } catch (error) {
        console.error('[RT-Token] Error:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ message: 'Error getting real-time token' }),
        };
    }
};

export const saveRealtimeTranscription: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub as string;
        if (!userId) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Unauthorized' }) };

        const body = JSON.parse(event.body || '{}');
        const { text, title } = body;

        if (!text) {
            return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Missing text' }) };
        }

        const createdAt = new Date().toISOString();
        const transcriptionId = uuidv4();

        const transcription: ITranscription = {
            id: transcriptionId,
            userId,
            title: title || `Real-time Transcription - ${new Date().toLocaleString()}`,
            text,
            status: 'completed',
            createdAt,
        };

        await databaseService.saveTranscription(transcription);

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ data: transcription }),
        };
    } catch (error) {
        console.error('[Save-RT] Error:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ message: 'Error saving real-time transcription' }),
        };
    }
};

export const getHistory: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub as string;
        if (!userId) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Unauthorized' }) };

        const lastKey = event.queryStringParameters?.lastKey
            ? JSON.parse(decodeURIComponent(event.queryStringParameters.lastKey))
            : undefined;

        const result = await databaseService.getHistory(userId, lastKey);

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                data: result.Items,
                lastKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                message: 'Error getting history',
                error: error instanceof Error ? error.message : error
            }),
        };
    }
};

export const getUploadUrl: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub as string;
        if (!userId) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Unauthorized' }) };

        const body = JSON.parse(event.body || '{}');
        const { filename, contentType, title } = body;

        if (!filename || !contentType) {
            return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Missing filename or contentType' }) };
        }

        const transcriptionId = uuidv4();
        const createdAt = new Date().toISOString();
        const fileKey = `${userId}/${transcriptionId}-${filename}`;

        const uploadUrl = await s3Service.getUploadUrl(fileKey, contentType);

        // creamos la entrada en DynamoDB con estado 'processing'
        const initialTranscription: ITranscription = {
            id: transcriptionId,
            userId,
            title: title || filename,
            text: '',
            status: 'processing',
            createdAt,
            audioUrl: fileKey
        };

        await databaseService.saveTranscription(initialTranscription);

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                uploadUrl,
                transcriptionId,
                createdAt
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ message: 'Error generating upload URL', error }),
        };
    }
};

export const getTranscription: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub as string;
        const id = event.pathParameters?.id;
        const createdAt = event.queryStringParameters?.createdAt;

        if (!userId || !id || !createdAt) {
            return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Missing parameters' }) };
        }

        const item = await databaseService.getTranscription(userId, createdAt);

        if (!item) {
            return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Transcription not found' }) };
        }

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify(item),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ message: 'Error getting transcription', error }),
        };
    }
};

// El procesamiento automático vía S3 está desactivado en favor del trigger por HTTP (processTranscription)
// para tener mejor control de errores en el frontend.


// Endpoint para procesar una transcripción después de subir el audio
export const processTranscription: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub as string;
        if (!userId) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Unauthorized' }) };

        const body = JSON.parse(event.body || '{}');
        const { transcriptionId, createdAt, fileKey } = body;

        if (!transcriptionId || !createdAt || !fileKey) {
            return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Missing transcriptionId, createdAt or fileKey' }) };
        }

        const bucket = process.env.S3_BUCKET!;

        const webhookUrl = process.env.WEBHOOK_URL
            ? `${process.env.WEBHOOK_URL}/transcriptions/webhook?userId=${encodeURIComponent(userId)}&createdAt=${encodeURIComponent(createdAt)}`
            : undefined;


        const jobId = await speechmaticsService.startTranscriptionJob(`uploads/${fileKey}`, bucket, webhookUrl);
        console.log(`job iniciado: ${jobId}`);

        // guardar jobId en dynamo y mantener en processing
        await databaseService.updateStatus(userId, createdAt, 'processing', { jobId });

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                message: 'processing',
                transcriptionId,
                jobId,
                webhookActive: !!webhookUrl
            }),
        };
    } catch (error: any) {
        console.error('[Process] Error:', error.message);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ message: 'Error processing transcription', error: error.message }),
        };
    }
};

export const webhook: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        console.log('params: ', JSON.stringify(event.queryStringParameters));

        const userId = event.queryStringParameters?.userId;
        const createdAt = event.queryStringParameters?.createdAt;

        // speechmatics añade automáticamente 'id' y 'status' a la URL
        const jobId = event.queryStringParameters?.id;
        const status = event.queryStringParameters?.status;

        if (!userId || !createdAt || !jobId) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ message: 'Missing metadata' }),
            };
        }

        if (status === 'completed' || status === 'success') {
            const text = await speechmaticsService.getResult(jobId);

            await databaseService.updateStatus(userId, createdAt, 'completed', { text });
            console.log(`${jobId} completado y guardado`);
        } else if (status === 'deleted' || status === 'rejected' || status === 'failure') {
            await databaseService.updateStatus(userId, createdAt, 'failed');
            console.log(`${jobId} fallido`);
        }

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ message: 'OK' }),
        };
    } catch (error) {
        console.error('[Webhook] Fatal error:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
};

// endpoint para borrar una transcripción
export const deleteTranscription: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub as string;
        if (!userId) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Unauthorized' }) };

        const body = JSON.parse(event.body || '{}');
        const { createdAt } = body;

        if (!createdAt) {
            return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Missing createdAt' }) };
        }

        await databaseService.deleteTranscription(userId, createdAt);

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ message: 'Transcription borrada' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ message: 'Error borrando transcripción', error }),
        };
    }
};
