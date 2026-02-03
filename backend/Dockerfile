# versió de node (jo utilitzo v18.19.1)
FROM node:20

# directori on treballa el container
WORKDIR /app

# copiar només package-lock.json i package.json
COPY package*.json ./

# instal·lar dependències definides en package-lock.json
RUN npm install

# copiar la resta del codi ((server.js))
COPY . .

# port on serà exposed
EXPOSE 8000
