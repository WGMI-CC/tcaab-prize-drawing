import fs from 'fs';
import path from 'path';

export function readJson<T>(filePath: fs.PathLike): T {
    const content: string = fs.readFileSync(filePath, {encoding: 'utf-8'}).toString();
    return JSON.parse(content) as T;
}


export function writeJsonToFile(filePath: string, data: object): void {
    makeDirs(filePath);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}


export function makeDirs(filePath: string): void {
    const dir: string = path.dirname(filePath);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
}


export function fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
}