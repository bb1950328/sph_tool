import {isDigits, LV03coordinates} from "@/util";
import * as math from "mathjs"

export enum NumberingScheme {
    NUMBERS,
    EXCEL_LETTERS,
}

export interface UserGridDefinition {
    id: number;
    name: string;

    xAxis: UserGridAxis;
    yAxis: UserGridAxis;
    /**
     * 0 1
     * 2 3
     */
    cellQuadrantLetters: [string, string, string, string] | null;
    refPoint0Coords: LV03coordinates;
    refPoint1Coords: LV03coordinates;
    refPoint0Identifier: string;
    refPoint1Identifier: string;
}

export interface UserGrid extends UserGridDefinition {
}

export class UserGrid implements UserGridDefinition {

    constructor(def?: UserGridDefinition) {
        this.id = -1;
        this.name = "Neues Führungsraster";
        this.xAxis = new UserGridAxis({numberingScheme: NumberingScheme.EXCEL_LETTERS});
        this.yAxis = new UserGridAxis({numberingScheme: NumberingScheme.NUMBERS});
        this.cellQuadrantLetters = ["A", "B", "D", "C"];
        this.refPoint0Coords = {x: 0, y: 0, z: 0};
        this.refPoint1Coords = {x: 0, y: 0, z: 0};
        this.refPoint0Identifier = "";
        this.refPoint1Identifier = "";
        console.log(this.xAxis, this.yAxis);
        if (def) {
            Object.assign(this, def);
            this.xAxis = new UserGridAxis(def.xAxis);
            this.yAxis = new UserGridAxis(def.yAxis);
        }
    }

    splitIdentifier(identifier: string): string[] {
        const blocks: string[] = [];
        if (!identifier) {
            throw new UserGridIdentifierFormatError(identifier);
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
        if ((isDigits(blocks[0]) && this.xAxis.numberingScheme === NumberingScheme.EXCEL_LETTERS)
            || (isDigits(blocks[1]) && this.yAxis.numberingScheme == NumberingScheme.EXCEL_LETTERS)) {
            [blocks[0], blocks[1]] = [blocks[1], blocks[0]];
        }
        return blocks;
    }

    identifierToIndex(identifier: string): UserGridCellIndex {
        const identifierBlocks = this.splitIdentifier(identifier);
        return {
            xColumn: this.xAxis.convertIdentifierToIndex(identifierBlocks[0]),
            yRow: this.yAxis.convertIdentifierToIndex(identifierBlocks[1]),
            quadrant: this.cellQuadrantLetters !== null
                ? this.cellQuadrantLetters.indexOf(identifierBlocks[2])
                : -1,
        }
    }

    indexToIdentifier(index: UserGridCellIndex): string {
        const base = this.xAxis.convertIndexToIdentifier(index.xColumn) + this.yAxis.convertIndexToIdentifier(index.yRow);
        if (this.cellQuadrantLetters != null && 0 <= index.quadrant && index.quadrant <= 3) {
            return base + this.cellQuadrantLetters[index.quadrant];
        } else {
            return base;
        }
    }

    /**
     * side length of one cell in meters
     */
    getCellSize(): number {
        const idx0 = this.identifierToIndex(this.refPoint0Identifier);
        const idx1 = this.identifierToIndex(this.refPoint1Identifier);

        const cellDiffX = idx1.xColumn - idx0.xColumn;
        const cellDiffY = idx1.yRow - idx0.yRow;
        const coordDiffX = this.refPoint1Coords.x - this.refPoint0Coords.x;
        const coordDiffY = this.refPoint1Coords.y - this.refPoint0Coords.y;

        const coordDistance = Math.sqrt(math.square(coordDiffX) + math.square(coordDiffY));
        const cellDistance = Math.sqrt(math.square(cellDiffX) + math.square(cellDiffY));
        return coordDistance / cellDistance;
    }

    validateValues(): string[] {
        const result = [];

        const idx0 = this.identifierToIndex(this.refPoint0Identifier);
        const idx1 = this.identifierToIndex(this.refPoint1Identifier);
        const cellDiffX = idx1.xColumn - idx0.xColumn;
        const cellDiffY = idx1.yRow - idx0.yRow;
        const coordDiffX = this.refPoint1Coords.x - this.refPoint0Coords.x;
        const coordDiffY = this.refPoint1Coords.y - this.refPoint0Coords.y;

        const rotCells = math.atan2(cellDiffY, cellDiffX) * 180 / Math.PI;
        const rotCoords = math.atan2(coordDiffY, coordDiffX) * 180 / Math.PI;
        const rotationDifference = Math.abs(rotCells - rotCoords);
        if (rotationDifference > 4) {
            result.push(`Das Führungsraster ist nicht nach Norden gerichtet. Die Abweichung beträgt ${rotationDifference}°. Resultate können ungenau sein`);
        }
        return result;
    }

    indexToCoords(index: UserGridCellIndex): LV03coordinates {
        const idx0 = this.identifierToIndex(this.refPoint0Identifier);
        const scaling = this.getCellSize();

        let fractionIdxX = index.xColumn;
        let fractionIdxY = index.yRow;
        if (index.quadrant != -1) {
            fractionIdxX += (index.quadrant == 0 || index.quadrant == 4) ? -0.25 : +0.25;
            fractionIdxY += (index.quadrant == 0 || index.quadrant == 1) ? -0.25 : +0.25;
        }
        return {
            x: this.refPoint0Coords.x + scaling * (fractionIdxX - idx0.xColumn),
            y: this.refPoint0Coords.y + scaling * (fractionIdxY - idx0.yRow),
            z: 0,
        }
    }

    /**
     * @param coords
     * @param outOfBoundsCheck
     * @return the index of the cell (always has a quadrant) or null if the coords are out of bounds for this grid and `outOfBoundsCheck===true`
     */
    coordsToIndex(coords: LV03coordinates, outOfBoundsCheck: boolean = true): UserGridCellIndex | null {
        const idx0 = this.identifierToIndex(this.refPoint0Identifier);
        const scaling = this.getCellSize();

        const fractionIdxX = idx0.xColumn + (coords.x - this.refPoint0Coords.x) / scaling;
        const fractionIdxY = idx0.yRow + (coords.y - this.refPoint0Coords.y) / scaling;
        if (outOfBoundsCheck &&
            (fractionIdxX < -.5 || fractionIdxX > this.xAxis.size() - .5
                || fractionIdxY < -.5 || fractionIdxY > this.yAxis.size() - .5)) {
            return null;
        }

        let quadrant: number;
        const firstQuadrantCol = fractionIdxX < Math.round(fractionIdxX);
        const firstQuadrantRow = fractionIdxY < Math.round(fractionIdxY);
        if (firstQuadrantCol) {
            quadrant = firstQuadrantRow ? 0 : 3;
        } else {
            quadrant = firstQuadrantRow ? 1 : 2;
        }

        return {
            xColumn: Math.round(fractionIdxX),
            yRow: Math.round(fractionIdxY),
            quadrant: quadrant,
        }
    }
}

export interface UserGridAxisDefinition {
    numberingScheme: NumberingScheme;
    firstIdentifier: string;
    lastIdentifier: string;
}

export interface UserGridAxis extends UserGridAxisDefinition {
}

export class UserGridAxis {
    constructor(def: { numberingScheme: NumberingScheme, firstIdentifier?: string, lastIdentifier?: string }) {
        if (def.numberingScheme == NumberingScheme.NUMBERS) {
            this.firstIdentifier = "1";
            this.lastIdentifier = "10";
        } else {
            this.firstIdentifier = "A";
            this.lastIdentifier = "J";
        }
        Object.assign(this, def);
    }

    firstIdentifierIndexWithoutOffset(): number {
        if (this.numberingScheme == NumberingScheme.NUMBERS) {
            return parseInt(this.firstIdentifier);
        } else {
            return excelLettersToNumber(this.firstIdentifier);
        }
    }

    lastIdentifierIndexWithoutOffset(): number {
        if (this.numberingScheme == NumberingScheme.NUMBERS) {
            return parseInt(this.lastIdentifier);
        } else {
            return excelLettersToNumber(this.lastIdentifier);
        }
    }

    size(): number {
        return this.lastIdentifierIndexWithoutOffset() - this.firstIdentifierIndexWithoutOffset() + 1;
    }

    convertIdentifierToIndex(identifier: string): number {
        return this.convertIdentifierToIndexWithoutOffset(identifier) - this.firstIdentifierIndexWithoutOffset();
    }

    convertIndexToIdentifier(index: number): string {
        const indexWithoutOffset = this.firstIdentifierIndexWithoutOffset() + index;
        if (this.numberingScheme == NumberingScheme.NUMBERS) {
            return indexWithoutOffset.toString();
        } else {
            return numberToExcelLetter(indexWithoutOffset);
        }
    }

    getTitles(): string[] {
        const result = [];
        for (let i = 0; i < this.size(); i++) {
            result.push(this.convertIndexToIdentifier(i));
        }
        return result;
    }

    private convertIdentifierToIndexWithoutOffset(identifier: string): number {
        if (this.numberingScheme == NumberingScheme.NUMBERS) {
            return parseInt(identifier);
        } else {
            return excelLettersToNumber(identifier);
        }
    }
}

export interface UserGridCellIndex {
    xColumn: number,
    yRow: number,
    /**0, 1, 2, 3 or -1 if there are no quadrants defined*/
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