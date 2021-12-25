import { PublicKey } from "@solana/web3.js";
import log from "loglevel";
import { MetaplexMetadata } from "./model/metadata";
import { GroupedHolderScores, HolderMintsDataFormat } from "./model/twocaab";
import { AppConfig, env } from "./util/env";
import { readJson, writeJsonToFile } from "./util/file";
import { calculateHolderScores, getOwnedTwocaabMetadatas } from "./util/twocaab";


async function main(): Promise<void> {
    const config: AppConfig = env();
    const holderMints: HolderMintsDataFormat = readJson(config.holderMintsFile);
    const scores: GroupedHolderScores = await getScoresForAllHolders(config, holderMints);
    writeJsonToFile(config.scoresFile, scores);
}


async function getScoresForAllHolders(config: AppConfig, holderMints: HolderMintsDataFormat): Promise<GroupedHolderScores> {
    const groupSize: number = config.holderLookupBatchSize;
    const holders: string[] = Object.keys(holderMints);
    const nGroups: number = Math.ceil(holders.length / groupSize);
    const result: GroupedHolderScores = {};
    for (let i = 0; i < nGroups; i++) {
        const group: string[] = holders.slice(i*groupSize, (i+1)*groupSize);
        await Promise.all(group.map(h => appendHolderScores(h, holderMints, result, config.holderLookupMaxRetries, config.holderLookupRetryWaitMs)));
    }
    if (Object.keys(result).length < holders.length) {
        throw new Error(`Expected ${holders.length} results but only got ${Object.keys(result).length} results. Something is wrong.`);
    }
    return result;
}


async function appendHolderScores(holderAddress: string, holderMints: HolderMintsDataFormat, result: GroupedHolderScores, maxRetries: number, retryWaitMs: number): Promise<void> {
    let attempts: number = 0;
    while (true) {
        try {
            const metas: MetaplexMetadata[] = await getOwnedTwocaabMetadatas(new PublicKey(holderAddress));
            const expectedNumberOfMetas: number = holderMints[holderAddress].amount;
            // compare the number of TCaaB NFT accounts found by the sol-rayz util to those from the sol-nft.tools snapshot website... they should agree
            if (metas.length !== expectedNumberOfMetas) throw new Error(`Expected ${expectedNumberOfMetas} but retrieved ${metas.length} NFTs for ${holderAddress}`);
            result[holderAddress] = calculateHolderScores(metas);
            break;
    
        } catch (e) {
            attempts += 1;
            log.warn(`${attempts} attempts failed to retrieve score for ${holderAddress} with error ${(e as unknown as Error).message}.`);
            if (attempts >= maxRetries) throw e;
            else await sleep(retryWaitMs);
        }
    }
}


async function sleep(sleepMs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, sleepMs));
}


log.setLevel('INFO');
main().then(() => log.info('Done evaluating holder scores.'));