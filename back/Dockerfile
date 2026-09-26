FROM node:22-alpine

WORKDIR /app

COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY package.json package-lock.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]

