export class LookUpTableBase {
    protected findClosestValueIndex(keys: number[], key: number): number {
        let i = 0;
        while (keys[i] < key && i < keys.length - 1) {
            ++i;
        }
        const lower = keys[i - 1];
        const upper = keys[i];
        return Math.abs(key - lower) < Math.abs(key - upper)
            ? i - 1
            : i;
    }

    protected findIndicesAndFactorForInterpolation(keys: number[], key: number): [number, number, number] {
        if (key <= keys[0]) {
            return [0, 0, 1];
        } else if (key >= keys[keys.length - 1]) {
            return [keys.length - 1, keys.length - 1, 1];
        } else {
            let i = 0;
            while (keys[i] < key && i < keys.length - 1) {
                ++i;
            }
            const lower = keys[i - 1];
            const upper = keys[i];
            return [i - 1, i, (upper - key) / (upper - lower)];
        }
    }

    protected checkNotRagged2D(array: any[][]): void {
        if (array.length > 0) {
            const rowLength = array[0].length;
            for (let i = 1; i < array.length; i++) {
                if (array[i].length != rowLength) {
                    throw new Error(`2D array is ragged (starting on row ${i})`);
                }
            }
        }
    }
}

export class LookUpTable1D extends LookUpTableBase {
    readonly values: number [];
    readonly keys: number[];
    readonly lastIdx: number;

    constructor(rows: number[][]) {
        super();
        this.checkNotRagged2D(rows);
        this.keys = rows.map(row => row[0]);
        this.values = rows.map(row => row[1]);
        this.lastIdx = rows.length - 1;
    }

    getValueLinearInterpolation(key0: number): number {
        const [i0, i1, factor] = this.findIndicesAndFactorForInterpolation(this.keys, key0);
        return this.values[i0] * factor + this.values[i1] * (1 - factor);
    }

    getClosestValue(key0: number): number {
        const i = this.findClosestValueIndex(this.keys, key0);
        return this.values[i];
    }
}

export class LookUpTable2D extends LookUpTableBase {
    keys0: number[];
    keys1: number[];
    values: number[][];

    constructor(keys0: number[], keys1: number[], values: number[][]) {
        super();
        this.checkNotRagged2D(values);
        this.keys0 = keys0;
        this.keys1 = keys1;
        this.values = values;
    }

    getValueBilinearInterpolation(key0: number, key1: number): number {
        const [ix0, ix1, xFactor] = this.findIndicesAndFactorForInterpolation(this.keys0, key0);
        const [iy0, iy1, yFactor] = this.findIndicesAndFactorForInterpolation(this.keys1, key1);
        const q00 = this.values[ix0][iy0];
        const q01 = this.values[ix0][iy1];
        const q10 = this.values[ix1][iy0];
        const q11 = this.values[ix1][iy1];
        const r0 = q00 * xFactor + q10 * (1 - xFactor);
        const r1 = q01 * xFactor + q11 * (1 - xFactor);
        return r0 * yFactor + r1 * (1 - yFactor);
    }

    getClosestValue(key0: number, key1: number): number {
        const i0 = this.findClosestValueIndex(this.keys0, key0);
        const i1 = this.findClosestValueIndex(this.keys1, key1);
        return this.values[i0][i1];
    }
}

export class LookUpTable3D extends LookUpTableBase {
    keys0: number[];
    keys1: number[];
    keys2: number[];
    values: number[][][];

    constructor(keys0: number[], keys1: number[], keys2: number[], values: number[][][]) {
        super();
        //this.checkNotRagged3D(values);
        this.keys0 = keys0;
        this.keys1 = keys1;
        this.keys2 = keys2;
        this.values = values;
    }

    getValueTrilinearInterpolation(key0: number, key1: number, key2: number): number {
        const [ix0, ix1, xFactor] = this.findIndicesAndFactorForInterpolation(this.keys0, key0);
        const [iy0, iy1, yFactor] = this.findIndicesAndFactorForInterpolation(this.keys1, key1);
        const [iz0, iz1, zFactor] = this.findIndicesAndFactorForInterpolation(this.keys2, key2);
        const q000 = this.values[ix0][iy0][iz0];
        const q010 = this.values[ix0][iy1][iz0];
        const q100 = this.values[ix1][iy0][iz0];
        const q110 = this.values[ix1][iy1][iz0];
        const q001 = this.values[ix0][iy0][iz1];
        const q011 = this.values[ix0][iy1][iz1];
        const q101 = this.values[ix1][iy0][iz1];
        const q111 = this.values[ix1][iy1][iz1];
        const r00 = q000 * xFactor + q100 * (1 - xFactor);
        const r10 = q010 * xFactor + q110 * (1 - xFactor);
        const r01 = q001 * xFactor + q101 * (1 - xFactor);
        const r11 = q011 * xFactor + q111 * (1 - xFactor);
        const s0 = r00 * yFactor + r10 * (1 - yFactor);
        const s1 = r01 * yFactor + r11 * (1 - yFactor);
        return s0 * zFactor + s1 * (1 - zFactor);
    }

    getClosestValue(key0: number, key1: number, key2: number): number {
        const i0 = this.findClosestValueIndex(this.keys0, key0);
        const i1 = this.findClosestValueIndex(this.keys1, key1);
        const i2 = this.findClosestValueIndex(this.keys2, key2);
        return this.values[i0][i1][i2];
    }
}