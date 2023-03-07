import {expect, test} from "vitest";
import {GP04_BALLISTICS_DATA} from "@/ballistics_data";

test("GP04 situation 0", () => {
    const result = GP04_BALLISTICS_DATA.distanceTemperatureElevation.getValueBilinearInterpolation(975, 5);
    // @ts-ignore
    expect(result).toSatisfy(clicks => (2 <= clicks && clicks <= 3));
});