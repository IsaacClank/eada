FROM postgres:16.3-bookworm

RUN apt update
RUN apt install postgresql-16-wal2json

WORKDIR /docker-entrypoint-initdb.d
COPY ./init-db.sh init-db.sh

WORKDIR /etc/postgresql
COPY ./postgresql.conf ./
COPY ./pg_hba.conf ./

CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf", "-c", "hba_file=/etc/postgresql/pg_hba.conf"]

