import {LV03toWGS84, WGS84toLV03} from "@/util";

import {expect, test} from "vitest";
import * as math from "mathjs";

test('WGS84toLV03', () => {
    const result = WGS84toLV03({
        latitude: 46 + 2 / 60 + 38.87 / 3600,
        longitude: 8 + 43 / 60 + 49.79 / 3600,
        height: 650.6
    });
    expect(result.x).closeTo(699_999.76, 2);
    expect(result.y).closeTo(99_999.97, 2);
    expect(result.z).closeTo(600.05, 2);
});

test("LV03toWGS84", () => {
    const result = LV03toWGS84({x: 700_000, y: 100_000, z: 600});
    expect(result.latitude).closeTo(46 + 2 / 60 + 38.87 / 3600, 5);
    expect(result.longitude).closeTo(8 + 43 / 60 + 49.79 / 3600, 5);
    expect(result.height).closeTo(650.60, 1);
});

test("matrixMultiplication", () => {
    const M = [
        [2, -3],
        [0, 4],
        [7, -5],
    ];
    const MT = math.transpose(M);
    const expectedMT = [
        [2, 0, 7],
        [-3, 4, -5],
    ];
    expect(MT).toStrictEqual(expectedMT);

    const expected = [
        [13, -12, 29],
        [-12, 16, -20],
        [29, -20, 74],
    ];
    expect(math.multiply(M, MT)).toStrictEqual(expected);
});