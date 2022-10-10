// noinspection ES6PreferShortImport
import {LookUpTable1D} from "../../src/lookup_table";

import {expect, test} from "vitest";


test("LUT 1D closestValue", () => {
    const lut = new LookUpTable1D([
        [1, 340],
        [3, 350],
        [4, 356],
        [10, 400],
    ]);
    expect(lut.getClosestValue(1)).eq(340);
    expect(lut.getClosestValue(2.1)).eq(350);
    expect(lut.getClosestValue(0)).eq(340);
    expect(lut.getClosestValue(10)).eq(400);
    expect(lut.getClosestValue(13)).eq(400);
});

test("LUT 1D interpolation", () => {
    const lut = new LookUpTable1D([
        [1, 340],
        [3, 350],
        [4, 356],
        [10, 400],
    ]);
    expect(lut.getValueLinearInterpolation(0)).eq(340);
    expect(lut.getValueLinearInterpolation(1)).eq(340);
    expect(lut.getValueLinearInterpolation(2)).closeTo(345, 3);
    expect(lut.getValueLinearInterpolation(1.5)).closeTo(342.5, 3);
    expect(lut.getValueLinearInterpolation(10)).eq(400);
    expect(lut.getValueLinearInterpolation(11)).eq(400);
});

