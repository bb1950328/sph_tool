import {findMonotonicFunctionArgument, LV03toWGS84, parseLV03, unitVec, WGS84toLV03} from "@/util";

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

test("parseLV03", () => {
    const result0 = parseLV03("123 456 / 987 654");
    console.log(JSON.stringify(result0));
    expect(result0.x).toEqual(123456);
    expect(result0.y).toEqual(987654);
    expect(result0.z).toEqual(0);
    const result1 = parseLV03("123 456 / 987 654 / 1234");
    expect(result1.x).toEqual(123456);
    expect(result1.y).toEqual(987654);
    expect(result1.z).toEqual(1234);
    const result2 = parseLV03("123456, 987654, 1234");
    expect(result1).toEqual(result2);
})

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

test("findMonotonicFunctionArgument", () => {
   expect(findMonotonicFunctionArgument(x => x*4-2, 0, 10, 4.5)).toBeCloseTo(1.625, 4);
   expect(findMonotonicFunctionArgument(x => math.sin(x), math.pi/-2, math.pi/2, 0.5)).toBeCloseTo(math.pi/6, 4);
});

test("absVec", () => {
    const vec = math.matrix([
        1,
        2,
        3,
    ]);
    const expected = math.matrix([
        0.2672612419124243,
        0.5345224838248487,
        0.8017837257372731,
    ]);
    const actual = unitVec(vec);
    for (let i = 0; i < 3; i++) {
        expect(actual.get([i])).toBeCloseTo(expected.get([i]));
    }
});