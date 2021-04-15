import "https://deno.land/x/dotenv/load.ts";

// import {Pool} from "https://deno.land/x/postgres/mod.ts";
import {Pool} from "./deps.ts";
import {bold, cyan, green,} from "./deps.ts";
import {
    ServerRequest,
    listenAndServe,
} from "./deps.ts";
import {
    createRouter,
    AugmentedRequest,
    createRouteMap,
    textResponse,
    jsonResponse,
    forMethod,
    NotFoundError,
} from "./deps.ts";

import utxoServiceRepo, {UtxoService} from "./src/service/utxo.service.ts";
import createDbService from "./src/repository/db.ts";

function createClientOpts() {
    return Object.fromEntries([
        ["hostname", "POSTGRES_HOST"],
        ["user", "POSTGRES_USER"],
        ["password", "POSTGRES_PASSWORD"],
        ["database", "POSTGRES_DB"],
        ["port", "POSTGRES_PORT"],
    ].map(([key, envVar]) => [key, Deno.env.get(envVar)]));
}

function getPoolConnectionCount() {
    return Number.parseInt(Deno.env.get("POSTGRES_POOL_CONNECTIONS") || "1", 10);
}

const pool = new Pool(createClientOpts(), getPoolConnectionCount());
const service: UtxoService = utxoServiceRepo(createDbService(pool));

export class BalanceNotFoundError extends Error {
    constructor(address: string) {
        super(`Record not found with address ${address}`);
    }
}

async function getBalance(service: Pick<UtxoService, "getBalanceByAddress">, address: string, spent: string | null) {
    let unspentOnly: string;
    if (spent === null) {
        unspentOnly = "false";
    } else {
        unspentOnly = spent;
    }
    const result = await service.getBalanceByAddress(address, unspentOnly);
    console.log(result);
    if (!result) {
        throw new BalanceNotFoundError(address);
    }
    return result;
}

export function createGetBalanceHandler(service: Pick<UtxoService, "getBalanceByAddress" | "getAddress">) {
    return async function getBalances({routeParams: [address], queryParams}: Pick<AugmentedRequest, "routeParams" | "queryParams">) {
        if (address) {
            let spent = queryParams.get('unspentOnly')
            const res = await getBalance(service, address, spent);
            // handle BigInt json serialization.
            const response = JSON.stringify(res, (_, v) =>typeof v === 'bigint' ? v.toString() : v);
            return jsonResponse(response);
        } else {
            const res = await service.getAddress();
            return jsonResponse(res);
        }
    }
}

export function createPaginationHandler(service: Pick<UtxoService, "getIndex">) {
    return async function getIndex({routeParams: [offset, limit]}: Pick<AugmentedRequest, "routeParams">) {
        const res = await service.getIndex(limit, offset);
        return jsonResponse(res);
    }
}

function createErrorResponse(status: number, {message}: Error) {
    return textResponse(message, {}, status);
}

export const routes = createRouteMap([
    ["/api/v1/addrs/*",
        forMethod([
            ["GET", createGetBalanceHandler(service)],
        ]),
    ],
    ["/api/v1/records/offset/*/limit/*",
        forMethod([
            ["GET", createPaginationHandler(service)],
        ]),
    ],
]);

const notFound = (e: NotFoundError) => createErrorResponse(404, e);
const serverError = (e: Error) => createErrorResponse(500, e);

const mapToErrorResponse = (e: Error) =>
    e instanceof NotFoundError ? notFound(e) : serverError(e);

const router = createRouter(routes);

console.log("Listening for requests...");

await listenAndServe(
    ":6000",
    async (req: ServerRequest) => {
        try {
            const res = await router(req);
            return req.respond(res);
        } catch (e) {
            return req.respond(mapToErrorResponse(e));
        }
    },
);



