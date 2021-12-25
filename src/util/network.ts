import { Connection } from "@solana/web3.js";
import { env } from "./env";

const connection: Connection = new Connection(env().solnetCluster, {confirmTransactionInitialTimeout: env().solanaConnectionTimeoutMs});

function getSolanaConnection(): Connection {
    return connection;
}


export {getSolanaConnection};