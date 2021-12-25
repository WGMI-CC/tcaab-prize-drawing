// call this method at the top of all test helper classes to prevent from those being used in prod code
function verifyEnvironment(): void {
    if (process.env.NODE_ENV !== 'test') throw new Error('Dont use test helpers in a non-test environment.');
}


function repeatTest(repeats: number, test: (iteration: number) => void): () => void {
    verifyEnvironment();
    return () => {for (let i = 0; i < repeats; i++) test(i)};
}


function generateArray<T>(size: number, generator: () => T): T[] {
    const result: T[] = [];
    for (let i = 0; i < size; i++) result.push(generator());
    return result;
}


function arraySum(values: number[]): number {
    let result: number = 0;
    for (const v of values) result += v;
    return result;
}


export {verifyEnvironment, repeatTest, generateArray, arraySum};