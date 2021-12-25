import _DEFAULT from '../config/default.json';
import _DEV from '../config/dev.json';
import _TEST from '../config/test.json';
import _PROD from '../config/prod.json';
import { PrizeSpec } from '../model/twocaab';

interface AppConfig {
    solnetCluster: string;
    metadataRequestTimeoutMs: number;
    solanaConnectionTimeoutMs: number;
    twocaabMintAuthority: string;
    twocaabSymbol: string;
    holderLookupBatchSize: number;
    holderLookupMaxRetries: number;
    holderLookupRetryWaitMs: number;
    ineligibleHolders: {[name: string]: string};
    prizes: {[tier: string]: PrizeSpec[]};
    categoryToPrizeTier: {[category: string]: string};
    holderMintsFile: string;
    scoresFile: string;
    winnersFile: string;
}

const DEFAULT: AppConfig = _DEFAULT as unknown as AppConfig;
const DEV: AppConfig = overrideDefaults(DEFAULT, _DEV);
const TEST: AppConfig = overrideDefaults(DEFAULT, _TEST);
const PROD: AppConfig = overrideDefaults(DEFAULT, _PROD);


function overrideDefaults(defaults: any, overrides: any): any {
    const result: any = {};
    if (isObject(defaults)) {
        for (let key of unionOfKeys(defaults, overrides)) {
            const defaultValue: any = defaults === undefined ? undefined : defaults[key];
            const overrideValue: any = overrides === undefined ? undefined : overrides[key];
            if (isObject(defaultValue)) {
                result[key] = overrideDefaults(defaultValue, overrideValue);

            } else if (overrides !== undefined) {
                result[key] = overrideValue === undefined ? defaultValue : overrideValue;

            } else {
                result[key] = defaultValue;
            }
        }
    }
    return result;
}


function isObject(obj: any): boolean {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}


function unionOfKeys(objA: any, objB: any): string[] {
    const result: any[] = Object.keys(objA);
    if (objB !== undefined) {
        result.push(...Object.keys(objB).filter(k => !result.includes(k)));
    }
    return result;
}


function env(): AppConfig {
    switch (process.env.NODE_ENV) {
        case 'prod': return PROD;
        case 'test': return TEST;
        default: return DEV;
    }
}


export { env };
export type {AppConfig}; 