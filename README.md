# Invox Medical Prueba Técnica - Transcripción AI

Prueba tecnica para Invox Medical. Implementada con arquitectura Serverless en el backend y Nuxt 3 en el frontend.

## Stack Tecnológico

### Backend (Serverless)
- **Runtime**: Node.js + TypeScript
- **Framework**: Serverless Framework (AWS Lambda)
- **Base de Datos**: DynamoDB (NoSQL)
- **Almacenamiento**: S3
- **Autenticacion**: AWS Cognito
- **IA de transcripcion**: API de Speechmatics

### Frontend
- **Framework**: Nuxt 3
- **Styling**: Tailwind CSS
- **Auth**: AWS Amplify Auth (para el login y registro mas simple)

### Requisitos previos
- Node.js v20+ (usar nvm para gestionar versiones)
- Docker
- AWS CLI (para el login en cognito)
- ngrok (para exponer el puerto 3000 a internet, solo para pruebas en local) -> [Download ngrok](https://ngrok.com/download)


### 1. Preparar el entorno
Clona el repositorio e instala las dependencias en la raíz:
```bash
npm install
```

### 1.1. Crear pool y cliente cognito
```bash
aws cognito-idp create-user-pool-client --user-pool-id eu-south-2_JMqHfrYX4 --client-name invox-medical-frontend --no-generate-secret --region eu-south-2
```

### 2. Scripts para levantar el entorno completo (Docker)

```bash
npm run 0:aws:login (si no has iniciado sesion en aws)
npm run 1:services:up (inicia los servicios de localstack s3, dynamodb y el backend)
npm run 2:docker:clean-build (limpia la cache y reconstruye los contenedores)
npm run 3:docker:up (levanta los servicios de localstack y el backend)
npm run 4:ngrok:up (levanta ngrok para exponer el puerto 3000 a internet)
```

### 3. Acceso a los servicios en local
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Backend**: [http://localhost:3001](http://localhost:3001)
- **LocalStack**: [http://localhost:4566](http://localhost:4566) --> para ver servicios y ficheros: https://app.localstack.cloud/inst/default/status

## Calidad y Pruebas

Agregadas unas pruebas simples para el backend con jest y para el frontend con cypress:

### Backend: Pruebas Unitarias (Jest)
Se centran en validar la lógica de negocio aislada, como el procesamiento de datos de Speechmatics.
- **Ejecutar**: `npm test --workspace=backend`
- **Cobertura**: `npm run test:coverage --workspace=backend`
- **QA**: Valida que el texto transcrito se concatene correctamente, respetando reglas de puntuación y espacios.

### Frontend: Pruebas E2E (Cypress)
Simulan interacciones reales del usuario en el navegador.
- **Ejecutar (consola)**: `npm run cypress:run --workspace=frontend`
- **QA**: Verifica el flujo de navegación, la presencia de elementos críticos y la redirección a páginas de registro/login.

### CI/CD y Análisis Estático
- **Linting**: Se utiliza **ESLint v10** para el backend y **Nuxi Typecheck** para el frontend. Comandos: `npm run lint`.
- **Pipeline Automatizada**: Se ha implementado un flujo de **GitHub Actions** (`.github/workflows/main.yml`) que valida automáticamente cada commit realizando linting, chequeo de tipos, ejecución de tests y validación de build. (al ser un repo publico no hay restricones de tiempos de ejecucion)

---
© 2026 Prueba Tecnica Invox Medical de Jose Manuel Lucas Hernandez
