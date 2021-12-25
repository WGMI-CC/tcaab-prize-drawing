import { MetadataKey } from "@nfteyez/sol-rayz/dist/config/metaplex";

export interface Manifest {
    mint: string;
    updateAuthority: string;
    data: {
        creators: any[];
        name: string;
        symbol: string;
        uri: string;
        sellerFeeBasisPoints: number;
    };
    key: MetadataKey;
    primarySaleHappened: boolean;
    isMutable: boolean;
    editionNonce: number;
    masterEdition?: string;
    edition?: string;
}

export interface MetaplexMetadataAttribute {
    trait_type: string;
    value: string;
}


export type FileFormat = 'image/png' | 'image/gif' | 'image/jpeg' | 'audio/mp3' | 'video/mp4';


export interface Creator {
    address: string;
    share: number;
}


export interface MetaplexMetadataFileSpec {
    uri: string;
    type: FileFormat;
}


export interface MetaplexMetadata {
    name: string;
    symbol: string;
    description: string;
    seller_fee_basis_points: number;
    external_url: string;
    image: string;
    attributes: MetaplexMetadataAttribute[];
    collection: {
        name: string;
        family: string;
    };
    properties: {
        category: string;
        files: MetaplexMetadataFileSpec[];
        creators: Creator[];
    }
}


export interface Coffee {
    name: string;
    image: string;
    brand: string;
    container: string;
    style: string;
    accessory: string;
}


export interface Beer {
    name: string;
    image: string;
    brand: string;
    container: string;
    style: string;
    accessory: string;
    top: string;
}