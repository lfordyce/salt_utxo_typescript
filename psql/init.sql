-- needed for 'uuid_generate_v4()' support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CSV headers: id,txid,address,amount,spent
CREATE TABLE IF NOT EXISTS btc_utxo (
    id      UUID DEFAULT uuid_generate_v4 (),
    txid    VARCHAR(100) NOT NULL,
    address VARCHAR(100) NOT NULL,
    amount  NUMERIC NOT NULL,
    spent   BOOL NOT NULL,
    PRIMARY KEY (id)
);

COPY btc_utxo FROM '/data/btc_utxos.csv' DELIMITER ',' CSV HEADER;