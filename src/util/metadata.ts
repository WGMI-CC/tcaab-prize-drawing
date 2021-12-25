import { Beer, Coffee, MetaplexMetadata } from "../model/metadata";

export class AttributeKeys {
    public static BRAND: string = 'Brand';
    public static CONTAINER: string = 'Container';
    public static STYLE: string = 'Style';
    public static ACCESSORY: string = 'Accessory';
    public static BEER_TOP: string = 'Beer Top';
}

export class BrandCategory {
    public static SOLANA: string = 'Solana';
    public static BITCOIN: string = 'Bitcoin';
    public static COPE: string = 'COPE';
    public static GM_GN: string = 'GM-GN';
    public static SAM: string = 'Sam';
    public static SAMO: string = 'SAMO';
    public static NAUTICAL: string = 'Nautical';
    public static GENERIC: string = 'Generic';
    public static MANGO: string = 'Mango';
    public static WGMI: string = 'WGMI';

    public static CAT_MIXED: string = 'Mixed';
    public static CAT_UNMATCHED: string = 'Unmatched';

    public static BRANDS: string[] = [
        this.SOLANA, 
        this.NAUTICAL, 
        this.SAM, 
        this.SAMO, 
        this.GM_GN, 
        this.COPE, 
        this.MANGO, 
        this.WGMI, 
        this.BITCOIN, 
        this.GENERIC
    ];

    public static CATEGORIES: string[] = [
        ...this.BRANDS,
        this.CAT_MIXED,
        this.CAT_UNMATCHED
    ]
}

export function isCoffee(metadata: MetaplexMetadata): boolean {
    const beverage: string = metadata.attributes.filter(m => m.trait_type === 'Beverage')[0].value;
    return beverage === 'Coffee';
}

const UNKNOWN_ATTRIBUTE = 'unknown';

export function asCoffee(metadata: MetaplexMetadata): Coffee {
    const name: string = metadata.name;
    const image: string = metadata.image;
    let brand: string = UNKNOWN_ATTRIBUTE;
    let container: string = UNKNOWN_ATTRIBUTE;
    let style: string = UNKNOWN_ATTRIBUTE;
    let accessory: string = UNKNOWN_ATTRIBUTE;
    for (const attribute of metadata.attributes) {
        if (attribute.trait_type === AttributeKeys.BRAND) brand = attribute.value;
        if (attribute.trait_type === AttributeKeys.CONTAINER) container = attribute.value;
        if (attribute.trait_type === AttributeKeys.STYLE) style = attribute.value;
        if (attribute.trait_type === AttributeKeys.ACCESSORY) accessory = attribute.value;
    }
    return {name, image, brand, container, style, accessory};
}


export function asBeer(metadata: MetaplexMetadata): Beer {
    const name: string = metadata.name;
    const image: string = metadata.image;
    let brand: string = UNKNOWN_ATTRIBUTE;
    let container: string = UNKNOWN_ATTRIBUTE;
    let style: string = UNKNOWN_ATTRIBUTE;
    let accessory: string = UNKNOWN_ATTRIBUTE;
    let top: string = UNKNOWN_ATTRIBUTE;
    for (const attribute of metadata.attributes) {
        if (attribute.trait_type === AttributeKeys.BRAND) brand = attribute.value;
        if (attribute.trait_type === AttributeKeys.CONTAINER) container = attribute.value;
        if (attribute.trait_type === AttributeKeys.STYLE) style = attribute.value;
        if (attribute.trait_type === AttributeKeys.ACCESSORY) accessory = attribute.value;
        if (attribute.trait_type === AttributeKeys.BEER_TOP) top = attribute.value;
    }
    return {name, image, brand, container, style, accessory, top};
}


export interface TwocaabSet {
    brand: string;
    coffee1?: Coffee;
    coffee2?: Coffee;
    beer?: Beer;
}