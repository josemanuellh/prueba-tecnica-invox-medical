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
COPY frontend ./frontend

WORKDIR /app/frontend

# Set Nuxt environment variables
ENV HOST=0.0.0.0
ENV PORT=3000
ENV API_URL=http://localhost:3001

EXPOSE 3000

CMD ["npm", "run", "dev"]
