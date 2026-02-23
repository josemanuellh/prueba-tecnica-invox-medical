FROM node:20-slim

WORKDIR /app

# Copy root package files
COPY package*.json ./
# Copy workspace package files
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm install

# Copy source code
COPY shared ./shared
COPY backend ./backend

WORKDIR /app/backend

# Set environment variables for Docker
ENV DYNAMODB_ENDPOINT=http://localstack:4566
ENV S3_ENDPOINT=http://localstack:4566
ENV AWS_ACCESS_KEY_ID=test
ENV AWS_SECRET_ACCESS_KEY=test
ENV AWS_REGION=eu-south-2
ENV IS_OFFLINE=true

EXPOSE 3001

CMD ["npm", "run", "dev"]
