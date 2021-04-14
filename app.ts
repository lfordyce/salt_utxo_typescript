import "https://deno.land/x/dotenv/load.ts";
// import {Application, Context, helpers, Router} from "https://deno.land/x/oak/mod.ts";
import {Pool} from "https://deno.land/x/postgres/mod.ts";
import {bold, cyan, green,} from "https://deno.land/std@0.93.0/fmt/colors.ts";
import {
    ServerRequest,
    listenAndServe,
} from "https://deno.land/std@0.90.0/http/server.ts";
import {
    createRouter,
    AugmentedRequest,
    createRouteMap,
    textResponse,
    jsonResponse,
    forMethod,
    NotFoundError,
    RouteHandler,
} from "https://deno.land/x/reno@v1.3.12/reno/mod.ts";

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

async function getBalance(service: Pick<UtxoService, "getBalanceByAddress">, address: string) {
    const result = await service.getBalanceByAddress(address, "false");
    console.log(result);
    if (!result) {
        throw new BalanceNotFoundError(address);
    }
    return result;
}

export function createGetBalanceHandler(service: Pick<UtxoService, "getBalanceByAddress">) {
    return async function getBalances({ routeParams: [address], queryParams: URLSearchParams }: Pick<AugmentedRequest, "routeParams">) {
        const res = await getBalance(service, address);
        return jsonResponse(res);
    }
}

function createErrorResponse(status: number, { message }: Error) {
    return textResponse(message, {}, status);
}

export const routes = createRouteMap([
    ["/api/v1/addrs/*",
        forMethod([
            ["GET", createGetBalanceHandler(service)],
        ]),
    ],
    ["/home", () => textResponse("Hello world!")],

    // Supports RegExp routes for further granularity
    [/^\/api\/swanson\/?([0-9]?)$/, async (req: AugmentedRequest) => {
        const [quotesCount = "1"] = req.routeParams;

        const res = await fetch(
            `https://ron-swanson-quotes.herokuapp.com/v2/quotes/${quotesCount}`,
        );

        return jsonResponse(await res.json());
    }],
]);

const notFound = (e: NotFoundError) => createErrorResponse(404, e);
const serverError = (e: Error) => createErrorResponse(500, e);

const mapToErrorResponse = (e: Error) =>
    e instanceof NotFoundError ? notFound(e) : serverError(e);

const router = createRouter(routes);

console.log("Listening for requests...");

await listenAndServe(
    ":8000",
    async (req: ServerRequest) => {
        try {
            const res = await router(req);
            return req.respond(res);
        } catch (e) {
            return req.respond(mapToErrorResponse(e));
        }
    },
);






//
// const getBalance = [
//     async (ctx: Context) => {
//         const {address, unspentOnly} = helpers.getQuery(ctx, {mergeParams: true});
//         console.log(address)
//         // console.log(params['address'])
//         // console.log(params['unspentOnly'])
//         console.log(unspentOnly)
//         const result = await service.getBalanceByAddress(address, unspentOnly);
//         console.log(result[0]);
//         const single = result[0];
//         ctx.response.status = 200;
//         ctx.response.body = single;
//     },
// ];
//
//
// const router: Router = new Router();
//
// router.get("", (ctx: Context) => {
//     ctx.response.body = "hello world";
// });
//
// router.get("/api/v1/addrs/:address", ...getBalance);
//
// const port = 8000;
// const app = new Application();
//
// // Logger
// app.use(async (ctx, next) => {
//     await next();
//     const rt = ctx.response.headers.get("X-Response-Time");
//
//     console.log(`${green(ctx.request.method)} ${cyan(decodeURIComponent(ctx.request.url.pathname))} - ${bold(String(rt))}`);
// });
//
// // Timing
// app.use(async (context, next) => {
//     const start = Date.now();
//     await next();
//     const ms = Date.now() - start;
//     context.response.headers.set("X-Response-Time", `${ms}ms`);
// });
//
// // Hello World!
// // app.use((ctx) => {
// //     ctx.response.body = "Hello World!";
// // });
//
// app.addEventListener('listen', () => {
//     console.log(`Listening on localhost:${port}`);
// });
//
// app.use(router.routes());
// await app.listen({port});



