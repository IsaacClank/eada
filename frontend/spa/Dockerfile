FROM node:iron-bookworm

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i

COPY public ./public/
COPY src ./src/
COPY index.html ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY tsconfig.* ./
COPY vite.config.ts ./
COPY template.env ./.env

ENTRYPOINT [ "npm" ]
CMD [ "run", "dev" ]

