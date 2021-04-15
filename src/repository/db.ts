// import {Pool} from "https://deno.land/x/postgres/mod.ts";
import {Pool} from "../../deps.ts";

export function buildQuery(text: string, ...args: (string | string[])[]) {
    return {
        text,
        args,
    };
}

function createDbService(pool: Pick<Pool, "connect">) {
    return {
        async query(query: string, ...args: (string | string[])[]) {
            const client = await pool.connect();
            try {
                return await client.queryObject(buildQuery(query, ...args));
            } finally {
                client.release();
            }
        },
    };
}
export type DbService = ReturnType<typeof createDbService>;
export default createDbService;
