import {isDigits, LV03coordinates} from "@/util";


export enum NumberingScheme {
    NUMBERS,
    EXCEL_LETTERS,
}

export interface UserGridDefinition {
    id: number,
    name: string,
    rowNumberingScheme: NumberingScheme,
    colNumberingScheme: NumberingScheme,
    /**
     * 0 1
     * 2 3
     */
    cellQuadrantLetters: [string, string, string, string] | null;
    topLeftIdentifier: string,
    bottomRightIdentifier: string,
    refPoint0Coords: LV03coordinates | null,
    refPoint1Coords: LV03coordinates | null,
    refPoint0Identifier: string,
    refPoint1Identifier: string,
}

export interface UserGridCellIndex {
    row: number,
    column: number,
    quadrant: number,
}

class UserGridIdentifierFormatError extends Error {
    constructor(identifier: string) {
        super(`The identifier ${identifier} is invalid`);
        Object.setPrototypeOf(this, UserGridIdentifierFormatError.prototype);
    }
}

/**
 * A≙0, B≙1, ...
 * @param letters
 */
export function excelLettersToNumber(letters: string): number {
    let result = 0;
    for (let i = 0; i < letters.length; i++) {
        const le = letters[i];
        result *= 26;
        result += le.charCodeAt(0) - "A".charCodeAt(0) + 1;
    }
    return result - 1;
}

/**
 * 0≙A, 1≙B, ...
 * @param num
 */
export function numberToExcelLetter(num: number): string {
    let result = "";
    while (num >= 0) {
        result = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[num % 26] + result;
        num = Math.floor(num / 26) - 1;
    }
    return result;
}

function axisIdentifierToIndex(def: UserGridDefinition, axis: number, identifier: string): number {
    const numberingScheme = axis === 0
        ? def.rowNumberingScheme
        : def.colNumberingScheme;
    const firstIdentifier = splitIdentifier(def, def.topLeftIdentifier)[axis];
    if (numberingScheme === NumberingScheme.NUMBERS) {
        return parseInt(identifier) - parseInt(firstIdentifier);
    } else {
        return excelLettersToNumber(identifier) - excelLettersToNumber(firstIdentifier);
    }
}

export function splitIdentifier(def: UserGridDefinition, identifier: string): string[] {
    const blocks: string[] = [];
    if (!identifier) {
        return blocks;
    }
    let start = 0;
    let isnum = isDigits(identifier[0]);
    for (let i = 0; i < identifier.length; i++) {
        if (isDigits(identifier[i]) != isnum) {
            if (start < i) {
                blocks.push(identifier.substring(start, i));
            }
            start = i;
            isnum = isDigits(identifier[i]);
        }
    }
    if (start < identifier.length) {
        blocks.push(identifier.substring(start));
    }
    if (blocks.length < 2) {
        throw new UserGridIdentifierFormatError(identifier);
    }
    if ((isDigits(blocks[0]) && def.rowNumberingScheme === NumberingScheme.EXCEL_LETTERS)
        || (isDigits(blocks[1]) && def.colNumberingScheme == NumberingScheme.EXCEL_LETTERS)) {
        [blocks[0], blocks[1]] = [blocks[1], blocks[0]];
    }
    return blocks;
}

export function identifierToIndex(def: UserGridDefinition, identifier: string): UserGridCellIndex {
    const identifierBlocks = splitIdentifier(def, identifier);
    return {
        row: axisIdentifierToIndex(def, 0, identifierBlocks[0]),
        column: axisIdentifierToIndex(def, 1, identifierBlocks[1]),
        quadrant: def.cellQuadrantLetters !== null
            ? def.cellQuadrantLetters.indexOf(identifierBlocks[2])
            : 0,
    }
}

export function axisIndexToIdentifier(def: UserGridDefinition, axis: number, axisIndex: number): string {
    const numberingScheme = axis === 0
        ? def.rowNumberingScheme
        : def.colNumberingScheme;
    const firstIdentifier = splitIdentifier(def, def.topLeftIdentifier)[axis];
    if (numberingScheme === NumberingScheme.NUMBERS) {
        return (parseInt(firstIdentifier) + axisIndex).toString();
    } else {
        return numberToExcelLetter(excelLettersToNumber(firstIdentifier) + axisIndex);
    }
}

export function getNumCells(def: UserGridDefinition, axis: number): number {
    const firstIdentifier = splitIdentifier(def, def.topLeftIdentifier)[axis];
    const lastIdentifier = splitIdentifier(def, def.bottomRightIdentifier)[axis];
    return axisIdentifierToIndex(def, axis, lastIdentifier) - axisIdentifierToIndex(def, axis, firstIdentifier) + 1;
}

export function getAxisTitles(def: UserGridDefinition, axis: number): string[] {
    const numberingScheme = axis === 0
        ? def.rowNumberingScheme
        : def.colNumberingScheme;
    const titles = [];
    for (let i = 0; i < getNumCells(def, axis); i++) {
        titles.push(axisIndexToIdentifier(def, axis, i));
    }
    return titles;
}

export function getCellSize(def: UserGridDefinition): [number, number] | null {
    if (def.refPoint0Coords==null || def.refPoint1Coords==null) {
        return null;
    }
    const idx0 = identifierToIndex(def, def.refPoint0Identifier);
    const idx1 = identifierToIndex(def, def.refPoint1Identifier);
    const distX = def.refPoint1Coords.x - def.refPoint0Coords.x;
    const distY = def.refPoint1Coords.y - def.refPoint0Coords.y;
    console.log(idx0, idx1, distX, distY);
    return [
        distX / (idx1.column-idx0.column),
        distY / (idx1.row-idx0.row),
    ];
}