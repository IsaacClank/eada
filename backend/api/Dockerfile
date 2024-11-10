FROM node:iron-bookworm

RUN echo Asia/Ho_Chi_Minh > /etc/timezone
RUN ln -sf /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i

COPY --chown=1000:1000 prisma/ prisma/
COPY --chown=1000:1000 src/ src/
COPY --chown=1000:1000 types/ types/
COPY --chown=1000:1000 tsconfig.json .
COPY --chown=1000:1000 .env.compose .env

RUN npx prisma generate

ENTRYPOINT ["npm"]
CMD [ "run", "start:dev" ]

