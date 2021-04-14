import {Pool} from "https://deno.land/x/postgres/mod.ts";
// import {PoolClient} from "https://deno.land/x/postgres/client.ts";

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

        // async tx(cb: (c: Pick<PoolClient, "query">) => Promise<void>) {
        //     const client = await pool.connect();
        //
        //     try {
        //         await client.query("begin;");
        //         await cb(client);
        //         await client.query("commit;");
        //     } catch (e) {
        //         await client.query("rollback;");
        //         throw e;
        //     } finally {
        //         client.release();
        //     }
        // },
    };
}
export type DbService = ReturnType<typeof createDbService>;
export default createDbService;