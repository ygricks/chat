# Commands

#### Login in container with db
```sh
docker exec -it chat_postgres bash
```

#### Login in postgres
```sh
psql -U postgres -d chat_db
```

### Postgres
```sh
## show databases
\l
## connect to db
\c {db name}
## show tables
\dt
## quit
\q
```


### Reach psql

#### from app container

```sh
docker exec -it chat_ts /bin/ash
apk --update add postgresql-client
psql -h db -p 5432 -d chat_db -U postgres
```

#### from postgres container

```sh
docker exec -it chat_postgres bash
psql -h db -p 5432 -d chat_db -U postgres
```
