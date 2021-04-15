FROM hayd/alpine-deno:1.8.3
# Listening port
EXPOSE 6000

WORKDIR /microservice
USER deno
# Cache the dependencies as a layer
COPY deps.ts .
RUN ["deno", "cache", "--unstable", "deps.ts"]
ADD . .

# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN ["deno", "cache", "--unstable", "app.ts"]
#RUN deno cache app.ts

CMD ["run", "--unstable", "--allow-run", "--allow-net", "--allow-env", "--allow-read", "app.ts"]
