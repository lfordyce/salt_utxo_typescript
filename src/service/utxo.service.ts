import {DbService} from "../repository/db.ts";
// import {QueryObjectResult} from "https://deno.land/x/postgres/query/query.ts";
import {QueryObjectResult} from "../../deps.ts";

export interface Utxo {
    id: string;
    txid: string;
    address: string;
    amount: number;
    spent: boolean;
}

export interface Balance {
    balance: string;
    count: number;
}

export interface Address {
    address: string
}

function utxoServiceRepo(db: DbService) {
    return {
        async getBalanceByAddress(address: string, spent: string): Promise<Balance[]> {

            const dbResult: QueryObjectResult<Record<string, unknown>> = await db.query(
                "SELECT sum(amount) AS balance, count(txid) AS count FROM public.btc_utxo WHERE address = $1 AND spent = $2",
                address, spent);

            const rows: Record<string, unknown>[] = dbResult.rows;

            return rows.map(bal => {
                return <Balance>{
                    balance: bal['balance'],
                    count: bal['count'],
                }
            });
        },

        async getAddress(): Promise<Address[]> {
            const dbResult: QueryObjectResult<Record<string, unknown>> = await db.query("SELECT DISTINCT address FROM btc_utxo");

            const rows: Record<string, unknown>[] = dbResult.rows;

            return rows.map(data => {
                return <Address>{
                    address: data['address'],
                }
            });
        },

        async getIndex(limit: string, offset: string): Promise<Utxo[]> {
            const dbResult: QueryObjectResult<Record<string, unknown>> = await db.query("SELECT id, txid, address, amount, spent FROM btc_utxo LIMIT $1 OFFSET $2",
                limit, offset);

            const rows: Record<string, unknown>[] = dbResult.rows;

            return rows.map(record => {
                return <Utxo>{
                    id: record['id'],
                    txid: record['txid'],
                    address: record['address'],
                    amount: record['amount'],
                    spent: record['spent'],
                }
            });
        }
    };
}

export type UtxoService = ReturnType<typeof utxoServiceRepo>;
export default utxoServiceRepo;
