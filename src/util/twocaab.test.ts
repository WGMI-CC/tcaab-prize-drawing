import { MetaplexMetadata } from "../model/metadata";
import { HolderScore } from "../model/twocaab";
import { readJson } from "./file";
import { calculateHolderScores } from "./twocaab";

test('calculateHolderScores() - calculated scores match expected', () => {
    const testData: { scores: HolderScore, metas: MetaplexMetadata[] } = readJson('./src/test/test-metas.json');
    const metas: MetaplexMetadata[] = testData.metas;
    const computedScores: HolderScore = calculateHolderScores(metas);
    const expectedScores: HolderScore = testData.scores;
    expect(computedScores).toEqual(expectedScores);
});