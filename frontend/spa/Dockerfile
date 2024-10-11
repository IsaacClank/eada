FROM node:iron-bookworm

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i

COPY . .

ENTRYPOINT [ "npm" ]
CMD [ "run", "dev" ]

