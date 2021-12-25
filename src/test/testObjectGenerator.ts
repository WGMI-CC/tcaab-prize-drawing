import { verifyEnvironment } from "./util";

verifyEnvironment();

const ALPHANUMERICS: string[] = 'abcedfghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890'.split('');
const NUMERICS: string[] = '01234567890'.split('');

class TestObjectGenerator {
    private readonly rand: () => number;

    public constructor() {
        this.rand = Math.random;
    }

    // adapted from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    /**
     * 
     * @param toShuffle 
     * @returns shuffles the given array to a new array
     */
     public shuffleToNew<T>(toShuffle: T[]): T[] {
        const result: T[] = [...toShuffle];
        let currentIndex = result.length;

        while (currentIndex != 0) {
            const randomIndex = Math.floor(this.rand() * currentIndex);
            currentIndex--;
            [result[currentIndex], result[randomIndex]] = [
            result[randomIndex], result[currentIndex]];
        }

        return result;
    }


    public generateStringOfLength(n: number): string {
        let result = '';
        for (let i = 0; i < n; i++) result += this.chooseFrom(ALPHANUMERICS);
        return result;
    }


    public generateNumericStringOfLength(n: number): string {
        let result = '';
        for (let i = 0; i < n; i++) result += this.chooseFrom(NUMERICS);
        return result;
    }


    /**
     * Chooses one option with optional weights.
     * 
     * @param options things to choose from
     * @param weights weights of each option; defaults to uniform weight
     * @returns one option chosen at (weighted) random 
     */
    public chooseFrom<T>(options: T[], weights?: number[]): T {
        if (weights && (options.length !== weights.length)) {
            throw new Error('Must give a weight for every option.');
        }

        let sumOfWeights: number;
        if (weights) {
            sumOfWeights = 0;
            for (const weight of weights) sumOfWeights += weight;

        } else {
            sumOfWeights = options.length;
        }
        
        let chosenCumulativeWeight: number = this.rand() * sumOfWeights;
        let cumulativeWeight: number = 0;
        for (let i = 0; i < options.length; i++) {
            const weight: number = weights ? weights[i] : 1;
            cumulativeWeight += weight;
            if (chosenCumulativeWeight < cumulativeWeight) return options[i];
        }
        throw new Error('Invalid inputs');
    }


    public generateIntBetween(lowerInclusive: number, upperExclusive: number): number {
        return Math.floor((upperExclusive - lowerInclusive)*this.generateFloatBetweenZeroAndOne()) + lowerInclusive;
    }

    
    public generateFloatBetweenZeroAndOne(): number {
        return this.rand();
    }

    public generateNumbersWithSum(size: number, sum: number = 1): number[] {
        let result: number[] = this.generateArray(size, () => this.generateFloatBetweenZeroAndOne());
        return this.standardizeNumbers(result, sum);
    }


    public generateArray<T>(size: number, elementGenerator: (index: number) => T): T[] {
        const result = [];
        for (let i = 0; i < size; i++) result.push(elementGenerator(i));
        return result;
    }


    public standardizeNumbers(input: number[], newSum: number): number[] {
        const currentSum: number = input.reduce((a, b) => a + b, 0);
        const scaleFactor: number = newSum / currentSum;
        return input.map(v => v*scaleFactor);
    }
}


export {TestObjectGenerator};