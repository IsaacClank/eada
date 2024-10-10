FROM debian:bookworm

ENV CONTAINER_HOST=
ENV CONTAINER_PORT=

RUN apt update
RUN apt install -y nodejs npm

WORKDIR /eada-api

COPY package.json package-lock.json ./
RUN npm i

COPY ./src ./src
COPY tsconfig.json ./

ENTRYPOINT ["npm"]
CMD [ "run", "start:dev" ]

