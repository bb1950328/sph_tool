const LV03_X_MIN = 485_000;
const LV03_X_MAX = 835_000;
const LV03_Y_MIN = 74_000;
const LV03_Y_MAX = 296_000;
const LV03_XY_MIDDLE = (LV03_Y_MAX + LV03_X_MIN) / 2; // if a coordinate is below that value, it's more likely to be a Y value, otherwise an X value

export function formatCoordinates(coords: { [key: string]: number }): string {
    const xStr = formatCoordinateXYValue(coords["x"]);
    const yStr = formatCoordinateXYValue(coords["y"]);
    const zStr = formatCoordinateZValue(coords["z"]);
    return `${xStr} / ${yStr} / ${zStr}`;
}

export function formatCoordinateXYValue(value: number): string {
    const sixDigit = Math.round(value) % 1000000;
    const numStr = sixDigit.toString().padStart(6, "0");
    return numStr.slice(0, 3) + " " + numStr.slice(3);
}

export function formatCoordinateZValue(value: number): string {
    return Math.round(value).toString();
}

export function formatArtilleryPromilleValue(value: number): string {
    value = Math.round(value);
    const valueInRange = ((value % 6400) + 6400) % 6400;
    if (value < 0) {
        value = valueInRange - 6400;
        return `${valueInRange}‰ (≙${value}‰)`;
    } else {
        return `${valueInRange}‰`;
    }
}

export function LV03toWGS84(x: number, y: number, z: number): [number, number, number] {
    const y_aux = (x - 600000) / 1000000;
    const x_aux = (y - 200000) / 1000000;
    const longitude = 2.6779094 +
        4.728982 * y_aux +
        0.791484 * y_aux * x_aux +
        0.1306 * y_aux * Math.pow(x_aux, 2) -
        0.0436 * Math.pow(y_aux, 3);
    const latitude = 16.9023892 +
        3.238272 * x_aux -
        0.270978 * Math.pow(y_aux, 2) -
        0.002528 * Math.pow(x_aux, 2) -
        0.0447 * Math.pow(y_aux, 2) * x_aux -
        0.0140 * Math.pow(x_aux, 3);
    const h = z + 49.55
        - 12.60 * y_aux
        - 22.64 * x_aux;
    return [latitude * 100 / 36, longitude * 100 / 36, h];
}

export function WGS84toLV03(latitude: number, longitude: number, height: number): [number, number, number] {
    const latitudeTotalSec = latitude * 3600;
    const longitudeTotalSec = longitude * 3600;
    // https://www.swisstopo.admin.ch/content/swisstopo-internet/en/topics/survey/reference-systems/switzerland/_jcr_content/contentPar/tabs/items/dokumente_publikatio/tabPar/downloadlist/downloadItems/516_1459343097192.download/ch1903wgs84_e.pdf
    const latAux = (latitudeTotalSec - 169028.66) / 10000;
    const lonAux = (longitudeTotalSec - 26782.5) / 10000;
    const e = 2600072.37
        + 211455.93 * lonAux
        - 10938.51 * lonAux * latAux
        - 0.36 * lonAux * Math.pow(lonAux, 2)
        - 44.54 * Math.pow(lonAux, 3);
    const n = 1200147.07
        + 308807.95 * latAux
        + 3745.25 * Math.pow(lonAux, 2)
        + 76.63 * Math.pow(latAux, 2)
        - 194.56 * Math.pow(lonAux, 2) * latAux
        + 119.79 * Math.pow(latAux, 3);
    const x = e - 2000000;
    const y = n - 1000000;
    const z = height - 49.55
        + 2.73 * lonAux
        + 6.94 * latAux;
    return [x, y, z];
}

export function getCurrentPositionLV03(successCallback: (arg0: { [key: string]: number | null }) => void, errorCallback: (arg0: any) => void): void {
    navigator.geolocation.getCurrentPosition(position => {
            const hasAltitude = position.coords.altitude !== null;
            const altitudeOrZero = hasAltitude ? position.coords.altitude : 0;
            const [x, y, z] = WGS84toLV03(position.coords.latitude, position.coords.longitude, altitudeOrZero);
            successCallback({"x": x, "y": y, "z": hasAltitude ? z : null});
        },
        errorCallback,
        {
            enableHighAccuracy: true,
            maximumAge: 100_000,
        }
    );
}

export function getHeightFromSwissTopo(x: number, y: number, successCallback: (height: number) => void, errorCallback: (arg0: any) => void): void {
    const params = new URLSearchParams({
        easting: x.toString(),
        northing: y.toString(),
        sr: "21781",
    });
    const url = "https://api3.geo.admin.ch/rest/services/height?" + params;
    fetch(url)
        .then(response => response.json())
        .then(json => json["height"])
        .then(successCallback)
        .catch(errorCallback);
}

export function extractCoordinatesFromString(text: string): { [key: string]: number } {
    //todo unit tests for this function
    const regex = new RegExp(/[12]?[' ]?(\d{3})[' ]?(\d{3})(\.\d+)?/, "g");
    let rest = text;
    const result: { [key: string]: number } = {};

    for (const match of text.matchAll(regex)) {
        console.log(match[0]);
        let number = parseInt(match[1]) * 1000 + parseInt(match[2]);
        if (match[3] != null) {
            if (parseInt(match[3][1]) >= 5) {
                number++;//number has decimal digits > 0.5
            }
        }
        if (LV03_Y_MIN <= number && number <= LV03_XY_MIDDLE) {
            result["y"] = number;
        } else if (LV03_XY_MIDDLE <= number && number <= LV03_X_MAX) {
            result["x"] = number;
        }
        rest = rest.replace(match[0], "");
    }

    const regexZ = new RegExp(/(\d)[' ]?(\d{2,4})(\.\d+)?/);
    const match = regexZ.exec(rest);
    if (match != null) {
        let number = "";
        for (let i = 1; match[i] != null; i++) {
            number += match[i];
        }
        result["z"] = Math.round(parseFloat(number));
    }

    return result;
}