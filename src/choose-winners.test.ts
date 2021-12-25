import { chooseWinners, prepHolderEntries } from "./choose-winners";
import { GroupedHolderScores, WinnerSpec } from "./model/twocaab";
import { AppConfig, env } from "./util/env";
import { readJson } from "./util/file";

test('prepHolderEntries() - puts the correct number of entries for each holder', () => {
    const scores: GroupedHolderScores = readJson('./src/test/test-scores.json');
    const config: AppConfig = env();
    const expected: {[tier: string]: string[]} = {
        "Top": ["a", "a", "c", "d", "e", "f", "f", "g", "g", "h", "h", "h", ],
        "Middle": ["a", "a", "b", "b", "b", "c", "c", "d", "d", "e", "f", "f", "g", "g", "g", "g", "g", "h", ],
        "Lower": ["a", "b", "b", "b", "b", "c", "c", "d", "d", "d", "d", "d", "e", "e", "e", "f", "f", "g", "h", "i", ],
        "Mixed": ["a", "a", "a", "a", "a", "a", "a", "b", "c", "d", "e", "f", "g", "g", "g", "h", "i", "i", "j", "j", "j", ]
    };
    const actual: {[tier: string]: string[]} = prepHolderEntries(config, scores);
    for (const tier of Object.keys(actual)) actual[tier].sort();
    expect(actual).toEqual(expected);
});


test('chooseWinners() - prizes are drawn in the expected order', () => {
    const scores: GroupedHolderScores = readJson('./src/test/test-scores.json');
    const config: AppConfig = env();
    const entries: {[tier: string]: string[]} = prepHolderEntries(config, scores);
    const expectedOrder: {[tier: string]: string[]} = {
        "Top": ["SSC", "Duderivative", "Metaplex Kit", "Bonus Sam", "sWaGMI"],
        "Middle": ["Thugbirdz", "Groms", "Skyline", "Test Guys", "Hellcats", "Hellcats", "Hellcats", "Hellcats", "Hellcats", "Hellcats", "sWaGMI"],
        "Lower": ["Gecko", "Solstead", "Chicken Tribe", "Hellcats", "Hellcats", "Hellcats", "Hellcats", "Hellcats", "Hellcats", "Hellcats", "Hellcats", "sWaGMI"],
        "Mixed": ["Penguin", "Solstein", "Wabbit", "Hot Spring Ape", "BitCaptain", "sWaGMI"]
    };
    const winners: WinnerSpec[] = chooseWinners(config, entries);
    const actualOrder: {[tier: string]: string[]} = {};
    for (const spec of winners) {
        if (actualOrder[spec.tier] === undefined) actualOrder[spec.tier] = [];
        actualOrder[spec.tier].push(spec.prize);
    }
    expect(actualOrder).toEqual(expectedOrder);
});


test('chooseWinners() - winners are drawn from the correct pool', () => {
    const config: AppConfig = env();
    const entries: {[tier: string]: string[]} = {
        "Top": ["a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a"],
        "Middle": ["b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b"],
        "Lower": ["c", "c", "c", "c", "c", "c", "c", "c", "c", "c", "c", "c", "c", "c"],
        "Mixed": ["d", "d", "d", "d", "d", "d", "d", "d", "d", "d", "d", "d", "d", "d", "d"]
    };
    const winners: WinnerSpec[] = chooseWinners(config, entries);
    for (const winner of winners) {
        if (winner.tier === 'Top') expect(winner.holder).toEqual('a')
        else if (winner.tier === 'Middle') expect(winner.holder).toEqual('b')
        else if (winner.tier === 'Lower') expect(winner.holder).toEqual('c')
        else if (winner.tier === 'Mixed') expect(winner.holder).toEqual('d')
    }
});


test('chooseWinners() - winners are drawn without replacement', () => {
    const config: AppConfig = env();
    const tierPrizeCounts: {[tier: string]: number} = {};
    for (const tier of Object.keys(config.prizes)) {
        tierPrizeCounts[tier] = 0;
        for (const prize of config.prizes[tier]) tierPrizeCounts[tier] += prize.count;
    }

    const entries: {[tier: string]: string[]} = {
        "Top": ["a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a"],
        "Middle": ["b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b"],
        "Lower": ["c", "c", "c", "c", "c", "c", "c", "c", "c", "c", "c", "c", "c", "c"],
        "Mixed": ["d", "d", "d", "d", "d", "d", "d", "d", "d", "d", "d", "d", "d", "d", "d"]
    };
    const startingEntries: {[tier: string]: number} = {};
    for (const tier of Object.keys(entries)) startingEntries[tier] = entries[tier].length;

    chooseWinners(config, entries);

    for (const tier of Object.keys(entries)) {
        expect(entries[tier].length).toEqual(startingEntries[tier] - tierPrizeCounts[tier]);
    }
});