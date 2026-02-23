/**
 * script de inicialización de recursos de LocalStack (DynamoDB + S3).
 * por ahora una tabla y un bucket.
 * se ejecuta con: node scripts/init-resources.js
 * 
 * prerequisito: docker-compose up -d localstack
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENDPOINT = 'http://localhost:4566';
const REGION = 'eu-south-2';
const TABLE_NAME = 'invox-medical-backend-transcriptions-dev';
const BUCKET_NAME = 'invox-medical-backend-audios-dev';

const env = {
    ...process.env,
    AWS_ACCESS_KEY_ID: 'test',
    AWS_SECRET_ACCESS_KEY: 'test',
    AWS_DEFAULT_REGION: REGION,
};

function run(cmd) {
    try {
        return execSync(cmd, { env, encoding: 'utf8', stdio: 'pipe' });
    } catch (e) {
        return e.stderr || e.message;
    }
}

function waitForLocalStack() {
    console.log('esperando a localstack...');
    for (let i = 0; i < 30; i++) {
        try {
            const result = run(`aws --endpoint-url=${ENDPOINT} dynamodb list-tables --region ${REGION} --no-cli-pager`);
            if (result.includes('TableNames')) {
                console.log('localstack listo!');
                return true;
            }
        } catch (e) { /* nothing to do */ }
        execSync('ping -n 2 127.0.0.1 > nul', { stdio: 'ignore' }); // wait 1s
    }
    return false;
}

function createDynamoTable() {
    // comprobar si la tabla ya existe
    const tables = run(`aws --endpoint-url=${ENDPOINT} dynamodb list-tables --region ${REGION} --no-cli-pager`);
    if (tables.includes(TABLE_NAME)) {
        console.log(`"${TABLE_NAME}" ya existe`);
        return;
    }

    // crear archivo temporal con la definición del GSI, indice para buscar por id
    const gsi = [{
        IndexName: "IdIndex",
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    }];
    const gsiFile = path.join(__dirname, 'gsi-temp.json');
    fs.writeFileSync(gsiFile, JSON.stringify(gsi));

    console.log(`creando tabla dynamodb: "${TABLE_NAME}"...`);
    const result = run(
        `aws --endpoint-url=${ENDPOINT} dynamodb create-table ` +
        `--table-name ${TABLE_NAME} ` +
        `--attribute-definitions AttributeName=userId,AttributeType=S AttributeName=createdAt,AttributeType=S AttributeName=id,AttributeType=S ` +
        `--key-schema AttributeName=userId,KeyType=HASH AttributeName=createdAt,KeyType=RANGE ` +
        `--provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 ` +
        `--global-secondary-indexes file://${gsiFile} ` +
        `--region ${REGION} --no-cli-pager`
    );

    // limpiar temporales
    try { fs.unlinkSync(gsiFile); } catch (e) { /* nothing to do */ }

    if (result.includes('TableDescription')) {
        console.log(`"${TABLE_NAME}" creada correctamente`);
    } else {
        console.error('error creando tabla:', result);
    }
}

function createS3Bucket() {
    // comprobar si el bucket ya existe
    const buckets = run(`aws --endpoint-url=${ENDPOINT} s3 ls --region ${REGION}`);
    if (buckets.includes(BUCKET_NAME)) {
        console.log(`Bucket "${BUCKET_NAME}" ya existe`);
        return;
    }

    console.log(`creando bucket "${BUCKET_NAME}"...`);
    const result = run(`aws --endpoint-url=${ENDPOINT} s3 mb s3://${BUCKET_NAME} --region ${REGION}`);
    if (result.includes('make_bucket')) {
        console.log(`Bucket "${BUCKET_NAME}" creado`);
    } else {
        console.error('error creando bucket:', result);
    }
}

// --- ejecucion ---
console.log('inicializando LocalStack...\n');

if (!waitForLocalStack()) {
    console.error('\nEjecuta: docker-compose up -d localstack');
    process.exit(1);
}

createDynamoTable();
createS3Bucket();

// --- CORS en el bucket S3 (a veces fallan las peticiones a localstack en docker!) ---
console.log(`Configurando CORS en bucket "${BUCKET_NAME}"...`);
const corsFile = path.join(__dirname, 's3-cors.json');
run(`aws --endpoint-url=${ENDPOINT} s3api put-bucket-cors --bucket ${BUCKET_NAME} --cors-configuration file://${corsFile} --region ${REGION}`);
console.log(`CORS configurado en "${BUCKET_NAME}"`);

console.log('\nlocalStack listo:');
console.log('   Tabla DynamoDB:', TABLE_NAME);
console.log('   Bucket S3:', BUCKET_NAME);
