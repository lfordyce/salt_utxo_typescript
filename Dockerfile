FROM hayd/alpine-deno:1.8.3

RUN apk add --no-cache bash
RUN apk add --no-cache postgresql-client

RUN mkdir -p /microservice && chown -R deno:deno /microservice
# Listening port
EXPOSE 6000

WORKDIR /microservice
USER deno
# Cache the dependencies as a layer
#COPY deps.ts .
COPY --chown=deno:deno deps.ts .
RUN ["deno", "cache", "--unstable", "deps.ts"]
COPY --chown=deno:deno . .

# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN ["deno", "cache", "--unstable", "app.ts"]
#RUN deno cache app.ts

#CMD ["run", "--unstable", "--allow-run", "--allow-net", "--allow-env", "--allow-read", "app.ts"]

# Awaits Postgres to bind before starting Deno
#ENTRYPOINT ["bash", "-c", "'while !</dev/tcp/psql_utxo/5432; do sleep 1; done; deno run --unstable --allow-env --allow-net --allow-read app.ts'"]

# Awaits Postgres to bind before starting Deno
#ENTRYPOINT ["bash -c 'while !</dev/tcp/psql_utxo/5432; do sleep 1; done; deno run --unstable --allow-env --allow-net --allow-read app.ts'"]
#ADD wait-for-postgres.sh .
#RUN chown deno ./wait-for-postgres.sh
RUN chmod +x ./wait-for-postgres.sh
ENTRYPOINT ["./wait-for-postgres.sh"]

#CMD ["deno", "run", "--unstable", "--allow-run", "--allow-net", "--allow-env", "--allow-read", "app.ts"]
