FROM hayd/deno:alpine-1.8.3

COPY . /microservice
WORKDIR /microservice
USER deno

EXPOSE 6000
CMD ["run", "--allow-env", "--allow-net", "--allow-read", "--unstable", "app.ts"]
