#!/bin/sh

### WAITING POSTGRES START ###
RETRIES=7
host=psql_utxo
while [ "$RETRIES" -gt 0 ]
do
  echo "Waiting for postgres server, $((RETRIES--)) remaining attempts..."
  PG_STATUS="$(pg_isready -h $host -U postgres)"
  PG_EXIT=$(echo $?)
  echo "Postgres Status: $PG_EXIT - $PG_STATUS"
  if [ "$PG_EXIT" = "0" ];
    then
      RETRIES=0
  fi
  sleep 5  # timeout for new loop
done;

echo "Postgres server is ready!"
echo "Starting deno..."
deno run --unstable --allow-env --allow-net --allow-read app.ts
