# SALT UTXO Typescript

Typescript implementation of the SALT Engineering Backend Technical Challenge.

### Features

- Solution is implemented as an HTTP server using [Deno](https://deno.land/) as the Typescript runtime.
- PostgreSQL is used to host the BTC UTXO data for efficient query capabilities.
- Multiple REST routes to satisfy both balance retrieval and additional data insights. 

### Install & Execution

#### Prerequisites
- Git
- Docker
- Docker Compose

#### Run
- Clone the repository.
```shell
git clone https://github.com/lfordyce/salt_utxo_typescript && cd salt_utxo_typescript
```
- Docker compose execution.
```shell
docker-compose -f docker-compose.yaml up
```
- Wait until the following log message appears before interacting with the server.
```shell
Listening for requests on :6000...
```

### API
- Get the balance by providing the BTC address and balance type (spent/unspent).
```sh
curl 'http://0.0.0.0:6000/api/v1/addrs/{BTC_ADDRESS}?unspentOnly={true/false}'
# example:
curl 'http://0.0.0.0:6000/api/v1/addrs/1CL5TbB2MaR4mrFjtYQ5GyA3cP2bSmPxAn?unspentOnly=true'
```
- Get all unique BTC addresses within data set.
```shell
curl 'http://0.0.0.0:6000/api/v1/addrs'
```
- Get pagination result set of the BTC UTXO data.
```shell
curl 'http://0.0.0.0:6000/api/v1/records/offset/{offset}/limit/{limit}'
# example:
curl 'http://0.0.0.0:6000/api/v1/records/offset/0/limit/20'
```

### Additional notes:
- If user wishes to execute the program outside of docker the following is needed:
- Deno (Tested with version 1.8.3)
```sh
$ deno --version
deno 1.8.3 (release, x86_64-apple-darwin)
v8 9.0.257.3
typescript 4.2.2
```
- A running instance of PostgreSQL
- Update the dotenv(.env) file the appropraite values to connect to PostgreSQL Server
