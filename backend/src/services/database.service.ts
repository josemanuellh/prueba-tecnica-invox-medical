import { DynamoDB } from 'aws-sdk';
import type { ITranscription } from '../types/shared';

const dynamoDb = new DynamoDB.DocumentClient(
    process.env.IS_OFFLINE === 'true' ? {
        endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:4566',
        region: process.env.AWS_REGION || 'eu-south-2',
        accessKeyId: 'test',
        secretAccessKey: 'test'
    } : {}
);
const TABLE_NAME = process.env.DYNAMO_TABLE!;

export const databaseService = {
    // guardar una nueva transcripcion
    async saveTranscription(data: ITranscription) {
        await dynamoDb.put({
            TableName: TABLE_NAME,
            Item: data,
        }).promise();
        return data;
    },

    // historial con paginacion (10 elementos)
    async getHistory(userId: string, lastEvaluatedKey?: any) {
        const params: DynamoDB.DocumentClient.QueryInput = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'userId = :uid',
            ExpressionAttributeValues: {
                ':uid': userId,
            },
            Limit: 10, // de 10 en 10
            ScanIndexForward: false, // las mas recientes primero
        };

        if (lastEvaluatedKey) {
            params.ExclusiveStartKey = lastEvaluatedKey;
        }

        try {
            return await dynamoDb.query(params).promise();
        } catch (error) {
            console.error('[DatabaseService] getHistory error:', error);
            throw error;
        }
    },

    // obtener una transcripcion por ID
    async getTranscription(userId: string, createdAt: string) {
        const result = await dynamoDb.get({
            TableName: TABLE_NAME,
            Key: { userId, createdAt },
        }).promise();
        return result.Item as ITranscription | undefined;
    },

    // actualizar el estado de una transcripcion en base de datos
    async updateStatus(userId: string, createdAt: string, status: ITranscription['status'], extraData: Partial<ITranscription> = {}) {
        let updateExpression = 'SET #s = :s';
        const expressionAttributeNames: DynamoDB.DocumentClient.ExpressionAttributeNameMap = { '#s': 'status' };
        const expressionAttributeValues: DynamoDB.DocumentClient.ExpressionAttributeValueMap = { ':s': status };

        Object.entries(extraData).forEach(([key, value]) => {
            updateExpression += `, #${key} = :${key}`;
            expressionAttributeNames[`#${key}`] = key;
            expressionAttributeValues[`:${key}`] = value;
        });

        await dynamoDb.update({
            TableName: TABLE_NAME,
            Key: { userId, createdAt },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
        }).promise();
    },

    // borrar una transcripcion en base de datos
    async deleteTranscription(userId: string, createdAt: string) {
        await dynamoDb.delete({
            TableName: TABLE_NAME,
            Key: { userId, createdAt },
        }).promise();
    }
};