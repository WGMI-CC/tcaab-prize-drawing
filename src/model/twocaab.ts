export interface HolderMints {
    mints: string[];
    amount: number;
}

export type HolderMintsDataFormat = {[holder: string]: HolderMints};

export type HolderScore = {[category: string]: {coffees: number, beers: number, sets: number}};

export type GroupedHolderScores = {[holder: string]: HolderScore};

export interface CoffeeBeerQty {
    brand: string;
    coffee: number;
    beer: number;
    numCompleteSets: number;
    remainingCoffee: number;
    remainingBeer: number
}

export interface PrizeSpec {
    name: string;
    count: number;
}

export interface WinnerSpec {
    tier: string;
    prize: string;
    holder: string;
    draw: number;
}
