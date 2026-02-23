import { S3 } from 'aws-sdk';

const s3 = new S3(
    process.env.IS_OFFLINE === 'true' ? {
        endpoint: process.env.S3_ENDPOINT || 'http://localhost:4566',
        s3ForcePathStyle: true,
        region: process.env.AWS_REGION || 'eu-south-2',
        accessKeyId: 'test',
        secretAccessKey: 'test'
    } : {}
);
const BUCKET_NAME = process.env.S3_BUCKET!;

export const s3Service = {
    async getUploadUrl(key: string, contentType: string) {
        const params = {
            Bucket: BUCKET_NAME,
            Key: `uploads/${key}`,
            ContentType: contentType,
            Expires: 300, // 5 minutos
        };

        const url = await s3.getSignedUrlPromise('putObject', params);

        // Si estamos en Docker, el endpoint interno (localstack) no es resoluble por el navegador.
        // Reemplazamos por localhost para que el navegador pueda subir el archivo.
        if (process.env.IS_OFFLINE === 'true' && url.includes('localstack')) {
            return url.replace('localstack', 'localhost');
        }

        return url;
    },

    async getDownloadUrl(key: string) {
        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
            Expires: 3600, // 1 hora
        };

        const url = await s3.getSignedUrlPromise('getObject', params);

        // Aplicamos el mismo parche para descargas
        if (process.env.IS_OFFLINE === 'true' && url.includes('localstack')) {
            return url.replace('localstack', 'localhost');
        }

        return url;
    }
};
