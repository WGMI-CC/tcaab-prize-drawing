import { getParsedAccountByMint, getParsedNftAccountsByOwner, getParsedNftAccountsByUpdateAuthority } from "@nfteyez/sol-rayz";
import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import log from "loglevel";
import { Beer, Coffee, Manifest, MetaplexMetadata } from "../model/metadata";
import { CoffeeBeerQty, HolderScore } from "../model/twocaab";
import { env } from "./env";
import { asBeer, asCoffee, BrandCategory, isCoffee, TwocaabSet } from "./metadata";
import { getSolanaConnection } from "./network";


export function calculateHolderScores(metas: MetaplexMetadata[]): HolderScore {
    const data: CoffeeBeerQty[] = statsData(metas);
    let extraCoffee: number = 0;
    let extraBeer: number = 0;
    const dataByBrand: {[brand: string]: CoffeeBeerQty} = {};
    for (const entry of data) dataByBrand[entry.brand] = entry;
    const result: HolderScore = {};
    for (const brand of BrandCategory.BRANDS) {
        let brandStats: CoffeeBeerQty = dataByBrand[brand];
        if (brandStats === undefined) brandStats = {
            brand: brand,
            coffee: 0,
            beer: 0,
            numCompleteSets: 0,
            remainingCoffee: 0,
            remainingBeer: 0
        }
        let numBrandedSets: number = countTCaaBs(brandStats).numCompleteSets;

        //cumulative tracking of how many unmatched CCBs we have
        extraCoffee += countTCaaBs(brandStats).remainingCoffee; 
        extraBeer += countTCaaBs(brandStats).remainingBeer;
        
        //if statement keeps us from getting rows where we don't have any NFTs for that brand
        //where any qty, adds a new row to the table for that brand
        result[brand] = { coffees: brandStats.coffee, beers: brandStats.beer, sets: numBrandedSets };
    }
    const mixedSets: number = numCompleteSets(extraCoffee, extraBeer);
    result[BrandCategory.CAT_MIXED] = {coffees: mixedSets*2, beers: mixedSets, sets: mixedSets};
    result[BrandCategory.CAT_UNMATCHED] = {coffees: extraCoffee - mixedSets*2, beers: extraBeer - mixedSets, sets: 0};
    return result;
}


function countTCaaBs(tcaabset: CoffeeBeerQty): CoffeeBeerQty{
    tcaabset.numCompleteSets = numCompleteSets(tcaabset.coffee, tcaabset.beer);
    tcaabset.remainingCoffee = tcaabset.coffee - tcaabset.numCompleteSets*2;
    tcaabset.remainingBeer = tcaabset.beer - tcaabset.numCompleteSets;
    return tcaabset;
}



function numCompleteSets(extraCoffee: number, extraBeer: number): number {
    let result: number = 0;
    let noCoffeeSets: number = Math.floor(extraCoffee / 2);
    let noBeerSets: number = extraBeer;
    result = Math.min(noCoffeeSets, noBeerSets);
    return result;
}



function statsData(metadata: MetaplexMetadata[]): CoffeeBeerQty[] {
    const coffeesByBrand: {[brand: string]: Coffee[]} = {};
    const beersByBrand: {[brand: string]: Beer[]} = {};
    const brands: Set<string> = new Set<string>();
    for (const meta of metadata) {
        if (isCoffee(meta)) {
            const coffee: Coffee = asCoffee(meta);
            if (coffeesByBrand[coffee.brand] === undefined) coffeesByBrand[coffee.brand] = [];
            coffeesByBrand[coffee.brand].push(coffee);
            brands.add(coffee.brand);

        } else {
            const beer: Beer = asBeer(meta);
            if (beersByBrand[beer.brand] === undefined) beersByBrand[beer.brand] = [];
            beersByBrand[beer.brand].push(beer);
            brands.add(beer.brand);
        }
    }
    const result: CoffeeBeerQty[] = [];
    for (const brand of BrandCategory.BRANDS) {
        let coffeeQTY = 0;
        let beerQTY = 0;
        if (coffeesByBrand[brand]) coffeeQTY = coffeesByBrand[brand].length;
        if (beersByBrand[brand]) beerQTY = beersByBrand[brand].length;
        const ccbObj: CoffeeBeerQty = {
            brand: brand,
            coffee: coffeeQTY,
            beer: beerQTY,
            numCompleteSets: 0,
            remainingCoffee: 0,
            remainingBeer: 0,
        }
        result.push(ccbObj);
    }
    return result;
}


export function evaluateCollection(metadata: MetaplexMetadata[]): TwocaabSet[] {
    
    // collect coffees and beers so we can figure out branded sets
    const coffeesByBrand: {[brand: string]: Coffee[]} = {};
    const beersByBrand: {[brand: string]: Beer[]} = {};
    const brands: Set<string> = new Set<string>();
    for (const meta of metadata) {
        if (isCoffee(meta)) {
            const coffee: Coffee = asCoffee(meta);
            if (coffeesByBrand[coffee.brand] === undefined) coffeesByBrand[coffee.brand] = [];
            coffeesByBrand[coffee.brand].push(coffee);
            brands.add(coffee.brand);

        } else {
            const beer: Beer = asBeer(meta);
            if (beersByBrand[beer.brand] === undefined) beersByBrand[beer.brand] = [];
            beersByBrand[beer.brand].push(beer);
            brands.add(beer.brand);
        }
    }
    
    const result: TwocaabSet[] = [];
    for (const brand of brands) {
        // arbitrarily (but deterministically) build sets by mint order
        if (brand in coffeesByBrand) {
            coffeesByBrand[brand].sort(sortByMintOrder);
        }
        if (brand in beersByBrand) {
            beersByBrand[brand].sort(sortByMintOrder);
        }

        // build complete branded sets
        while ((brand in coffeesByBrand) && (brand in beersByBrand)) {
            if ((coffeesByBrand[brand].length >= 2) && (beersByBrand[brand].length >= 1)) {
                result.push({
                    brand: brand,
                    coffee1: coffeesByBrand[brand].shift(),
                    coffee2: coffeesByBrand[brand].shift(),
                    beer: beersByBrand[brand].shift()
                });
            } else break;
            if (coffeesByBrand[brand].length === 0) delete coffeesByBrand[brand]
            if (beersByBrand[brand].length === 0) delete beersByBrand[brand]
        }
    }

    // create complete mixed sets
    const remainingCoffees: Coffee[] = [];
    const remainingBeers: Beer[] = [];
    for (const brand of brands) {
        if (brand in coffeesByBrand) remainingCoffees.push(...coffeesByBrand[brand]);
        if (brand in beersByBrand) remainingBeers.push(...beersByBrand[brand]);
    }
    remainingCoffees.sort(sortByMintOrder);
    remainingBeers.sort(sortByMintOrder);
    while ((remainingCoffees.length > 1) && (remainingBeers.length > 0)) {
        result.push({
            brand: BrandCategory.CAT_MIXED,
            coffee1: remainingCoffees.shift(),
            coffee2: remainingCoffees.shift(),
            beer:remainingBeers.shift()
        });
    }

    // toss everything else into its own "set" rather than try to 
    //  strategize on behalf of the user
    for (const coffee of remainingCoffees) result.push({brand: coffee.brand, coffee1: coffee});
    for (const beer of remainingBeers) result.push({brand: beer.brand, beer: beer});

    result.sort(sortByCollectedAmountAndBrand)
    return result;
}


function sortByCollectedAmountAndBrand(setA: TwocaabSet, setB: TwocaabSet): number {
    let aCollected: number = 0;
    if (setA.coffee1) aCollected += 1;
    if (setA.coffee2) aCollected += 1;
    if (setA.beer) aCollected += 1;

    let bCollected: number = 0;
    if (setB.coffee1) bCollected += 1;
    if (setB.coffee2) bCollected += 1;
    if (setB.beer) bCollected += 1;

    if (aCollected !== bCollected) return bCollected - aCollected;

    if ((setA.brand === BrandCategory.CAT_MIXED) && (setB.brand !== BrandCategory.CAT_MIXED)) return 1;
    if ((setA.brand !== BrandCategory.CAT_MIXED) && (setB.brand === BrandCategory.CAT_MIXED)) return -1;
    if (setA.brand === setB.brand) return 0;
    return BrandCategory.BRANDS.indexOf(setA.brand) - BrandCategory.BRANDS.indexOf(setB.brand);
}


function sortByMintOrder(a: Coffee | Beer, b: Coffee | Beer): number {
    return getMintNumberFromName(a.name) - getMintNumberFromName(b.name)
}


function getMintNumberFromName(name: string): number {
    return Number.parseInt(name.substring(name.length-4, name.length));
}



export async function getOwnedTwocaabMetadatas(publicKey: PublicKey): Promise<MetaplexMetadata[]> {
    log.info('Looking up NFTs for ' + publicKey.toBase58());
    const manifests: Manifest[] = await getParsedNftAccountsByOwner({publicAddress: publicKey, connection: getSolanaConnection()});
    log.info(`Found ${manifests.length} NFT accounts. Finding TCaaB accounts`);
    const wgmiUris: string[] = manifests.filter(isTwocaabManifest).map(m => m.data.uri);
    log.info(`Found ${wgmiUris.length} TCaaB NFT accounts.`);
    const metadatas: MetaplexMetadata[] = await Promise.all(wgmiUris.map(requestMetadataFromUri));
    return metadatas;
}


function isTwocaabManifest(manifest: Manifest): boolean {
    const {twocaabMintAuthority, twocaabSymbol} = env();
    return (manifest.updateAuthority === twocaabMintAuthority) && (manifest.data.symbol === twocaabSymbol);
}


interface AxiosResponse {
    status: number;
    data: MetaplexMetadata;
}

async function requestMetadataFromUri(uri: string): Promise<MetaplexMetadata> {
    const timeoutMsg: string = "metadata request timeout exceeded";
    try {
        const response: AxiosResponse = await axios.get(uri, 
            {
                timeout: env().metadataRequestTimeoutMs, 
                timeoutErrorMessage: timeoutMsg
            }
        );
        
        if (response.status === 200) {
            return response.data;

        } else {
            throw new Error(`Unrecognized non-error response ${JSON.stringify(response)}`);
        }
    } catch (error: any) {
        if (error.response) {
            throw new Error(`ERROR ${error.response.data}.`);

        } else if (error.request) {
            if (error.message === timeoutMsg) {
                throw new Error("Arweave request timed out");
            }
            throw new Error("Arweave server isnt responding " + error.message);

        } else {
            throw new Error("Unknown error " + error.message);
        }
    }
}