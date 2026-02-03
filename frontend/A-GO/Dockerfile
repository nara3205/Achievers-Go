# Dockerfile.dev ->
FROM node:20

# Directori de treball
WORKDIR /app/A-GO

# Copiar package.json i package-lock.json
COPY package*.json ./

# Instal·lar dependències
RUN npm install

# Copiar la resta del codi
COPY . .

# Port que exposa Vite
EXPOSE 5173


