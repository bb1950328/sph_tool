import {
    GP04_ELEVATION_AIR_PRESSURE_CORRECTION,
    GP04_ELEVATION_CLICKS,
    GP04_ELEVATION_OLD_BARREL_CORRECTION,
    GP04_ELEVATION_TEMPERATURE_CORRECTION,
    GP04_WINDAGE_DERIVATION,
    GP04_WINDAGE_WIND
} from "@/ballistics_data";

export class BallisticSituation {
    /**
     * `"sako"` or `"stgw"`
     */
    weapon: string;
    /**
     * Distance to target in meters
     */
    distance: number;
    /**
     * Wind speed in meters per second
     */
    windSpeed: number;
    /**
     * Wind direction angle as clock (right to left is 3 for example)
     */
    windClock: number;
    /**
     * Air pressure in mbar
     */
    airPressure: number;
    /**
     * Air temperature in °C
     */
    temperature: number;
    /**
     * Whether the barrel is old or not (>2500 rounds fired)
     */
    oldBarrel: boolean;

    constructor() {
        this.weapon = "sako";
        this.distance = 100;
        this.windSpeed = 0;
        this.windClock = 0;
        this.airPressure = 950;
        this.temperature = 25;
        this.oldBarrel = false;
    }

    loadFromLocalStorage(prefix: string = "ballistics") {
        this.weapon = localStorage.getItem(`${prefix}_weapon`) || "sako";
        this.distance = parseInt(localStorage.getItem(`${prefix}_distance`) || "") || 100;
        this.windSpeed = parseInt(localStorage.getItem(`${prefix}_windSpeed`) || "") || 0;
        this.windClock = parseInt(localStorage.getItem(`${prefix}_windClock`) || "") || 0;
        this.airPressure = parseInt(localStorage.getItem(`${prefix}_airPressure`) || "") || 950;
        this.temperature = parseInt(localStorage.getItem(`${prefix}_temperature`) || "") || 25;
        this.oldBarrel = localStorage.getItem(`${prefix}_oldBarrel`) === "true";
    }

    saveToLocalStorage(prefix: string = "ballistics") {
        localStorage.setItem(`${prefix}_weapon`, this.weapon.toString());
        localStorage.setItem(`${prefix}_distance`, this.distance.toString());
        localStorage.setItem(`${prefix}_windSpeed`, this.windSpeed.toString());
        localStorage.setItem(`${prefix}_windClock`, this.windClock.toString());
        localStorage.setItem(`${prefix}_airPressure`, this.airPressure.toString());
        localStorage.setItem(`${prefix}_temperature`, this.temperature.toString());
        localStorage.setItem(`${prefix}_oldBarrel`, this.oldBarrel.toString());
    }

    get baseElevation(): number {
        return GP04_ELEVATION_CLICKS.getValueLinearInterpolation(this.distance);
    }

    get oldBarrelElevationCorrection(): number {
        return this.oldBarrel
            ? GP04_ELEVATION_OLD_BARREL_CORRECTION.getValueLinearInterpolation(this.distance)
            : 0;
    }

    get airPressureElevationCorrection(): number {
        return GP04_ELEVATION_AIR_PRESSURE_CORRECTION.getValueBilinearInterpolation(this.distance, this.airPressure);
    }

    get temperatureElevationCorrection(): number {
        return GP04_ELEVATION_TEMPERATURE_CORRECTION.getValueBilinearInterpolation(this.distance, this.temperature);
    }

    get totalElevation(): number {
        return this.baseElevation
            + this.oldBarrelElevationCorrection
            + this.airPressureElevationCorrection
            + this.temperatureElevationCorrection;
    }

    get windClock0to3(): number {
        if (this.windClock <= 3) {
            return this.windClock;
        } else if (this.windClock <= 6) {
            return 6 - this.windClock;
        } else if (this.windClock <= 9) {
            return this.windClock - 6;
        } else {
            return 12 - this.windClock;
        }
    }

    get baseWindage(): number {
        return GP04_WINDAGE_WIND.getValueTrilinearInterpolation(this.distance, this.windClock0to3, this.windSpeed);
    }

    get derivationWindageCorrection(): number {
        return GP04_WINDAGE_DERIVATION.getValueLinearInterpolation(this.distance);
    }

    get totalWindage(): number {
        return this.baseWindage
            + this.derivationWindageCorrection;
    }
}

export function formatElevationClicks(number: number): string {
    const rounded = Math.round(number);
    return (rounded < 0 ? "" : "+") + rounded;
}

export function formatWindageClicks(clicks: number): string {
    let word = "";
    if (clicks < 0) {
        word = "neg";
    } else if (clicks > 0) {
        word = "pos";
    }
    return word + Math.round(Math.abs(clicks));
}

export function windageCssClass(windage: number): string {
    if (windage < 0) {
        return "windage-negative";
    } else if (windage > 0) {
        return "windage-positive";
    } else {
        return "";
    }
}