FROM node:iron-bookworm

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i

COPY prisma/ prisma/
COPY src/ src/
COPY types/ types/
COPY tsconfig.json .
COPY .env.compose .env

RUN npx prisma generate

ENTRYPOINT ["npm"]
CMD [ "run", "start:dev" ]

