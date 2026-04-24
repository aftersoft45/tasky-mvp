FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
# Instalamos e ignoramos los scripts automáticos para que no se adelante
RUN npm install --ignore-scripts
COPY . .
# Ahora que ya se copió la carpeta prisma, generamos el cliente
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "dev"]