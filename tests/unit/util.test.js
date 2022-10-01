// noinspection ES6PreferShortImport
import {LV03toWGS84, WGS84toLV03} from "../../src/util";

import {expect, test} from "vitest";

test('WGS84toLV03', () => {
    let [x, y, z] = WGS84toLV03(46 + 2 / 60 + 38.87 / 3600, 8 + 43 / 60 + 49.79 / 3600, 650.6);
    expect(x).closeTo(699_999.76, 2);
    expect(y).closeTo(99_999.97, 2);
    expect(z).closeTo(600.05, 2);
});

test("LV03toWGS84", () => {
    let [lat, lon, h] = LV03toWGS84(700_000, 100_000, 600);
    expect(lat).closeTo(46 + 2 / 60 + 38.87 / 3600, 5);
    expect(lon).closeTo(8 + 43 / 60 + 49.79 / 3600, 5);
    expect(h).closeTo(650.60, 1);
});