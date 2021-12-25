
// load scores
// get entries in each prize pool, omitting ineligible holders
// randomly 

import log from "loglevel";
import { GroupedHolderScores, WinnerSpec } from "./model/twocaab";
import { AppConfig, env } from "./util/env";
import { readJson, writeJsonToFile } from "./util/file";

function main(): void {
    const config: AppConfig = env();
    const scores: GroupedHolderScores = readJson(config.scoresFile);
    const preppedHolderEntries: {[tier: string]: string[]} = prepHolderEntries(config, scores);
    const winners: WinnerSpec[] = chooseWinners(config, preppedHolderEntries);
    writeJsonToFile(config.winnersFile, winners);
}


export function chooseWinners(config: AppConfig, holderEntries: {[tier: string]: string[]}): WinnerSpec[] {

    // shuffle entries randomly so we can easily pop off winners 
    //  without worrying about repeat selection
    for (const tier of Object.keys(holderEntries)) {
        shuffleInPlace(holderEntries[tier]);
    }

    const result: WinnerSpec[] = [];
    for (const tier of Object.keys(config.prizes)) {
        const holderPool: string[] = holderEntries[tier];
        for (const prize of config.prizes[tier]) {
            for (let draw = 0; draw < prize.count; draw++) {
                const winner: string | undefined = holderPool.shift();
                if (winner === undefined) throw new Error(`Not enough contestants for the prize ${prize.name} ${draw + 1} pool. Something is wrong.`);
                log.info(`And the winner of the ${tier} Tier ${prize.name} Prize (${draw + 1}) is... ${winner} !`);
                result.push({
                    tier: tier,
                    prize: prize.name,
                    draw: draw + 1,
                    holder: winner
                });
            }
        }
    }
    return result;
}


// result will ready for drawing, including multiple entries for each holder, but wont include randomization of entries
export function prepHolderEntries(config: AppConfig, scores: GroupedHolderScores): {[tier: string]: string[]} {
    const result: {[tier: string]: string[]} = {};
    const ineligibleHolders: string[] = Object.values(config.ineligibleHolders); 
    for (const holder of Object.keys(scores)) {
        if (ineligibleHolders.includes(holder)) continue;
        for (const category of Object.keys(config.categoryToPrizeTier)) {
            const tier: string = config.categoryToPrizeTier[category];
            if (result[tier] === undefined) result[tier] = [];
            const holdersSetsOfCategory: number = scores[holder][category].sets;
            for (let i = 0; i < holdersSetsOfCategory; i++) result[tier].push(holder);
        }
    }
    return result;
}


function shuffleInPlace<T>(toShuffle: T[]): void {
    let currentIndex = toShuffle.length;
    while (currentIndex != 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [toShuffle[currentIndex], toShuffle[randomIndex]] = [
            toShuffle[randomIndex], toShuffle[currentIndex]];
    }
}


log.setLevel('INFO');
main();
log.info('Done choosing winners.');