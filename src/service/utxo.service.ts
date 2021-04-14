import {DbService} from "../repository/db.ts";
import {QueryObjectResult} from "https://deno.land/x/postgres/query/query.ts";

export interface Balance {
    balance: string;
    count: number;
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
        }
    }
}

export type UtxoService = ReturnType<typeof utxoServiceRepo>;
export default utxoServiceRepo;