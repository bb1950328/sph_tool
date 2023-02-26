import math from "mathjs";

export const LV03_X_MIN = 485_000;
export const LV03_X_MAX = 835_000;
export const LV03_Y_MIN = 74_000;
export const LV03_Y_MAX = 296_000;
export const LV03_XY_MIDDLE = (LV03_Y_MAX + LV03_X_MIN) / 2; // if a coordinate is below that value, it's more likely to be a Y value, otherwise an X value

export interface LV03coordinates {
    x: number;
    y: number;
    z: number;
}

export interface WGS84coordinates {
    latitude: number;
    longitude: number;
    height: number;
}

export function formatCoordinatesLV03(coords: LV03coordinates): string {
    const xStr = formatCoordinatesLV03_XYValue(coords.x);
    const yStr = formatCoordinatesLV03_XYValue(coords.y);
    const zStr = formatCoordinatesLV03ZValue(coords.z);
    return `${xStr} / ${yStr} / ${zStr}`;
}

export function formatCoordinatesLV03_XYValue(value: number): string {
    const sixDigit = Math.round(value) % 1000000;
    const numStr = sixDigit.toString().padStart(6, "0");
    return numStr.slice(0, 3) + " " + numStr.slice(3);
}

export function formatCoordinatesLV03ZValue(value: number): string {
    return Math.round(value).toString();
}

export function formatCoordinatesWGS84Decimal(coords: WGS84coordinates): string {
    const ns = coords.latitude > 0 ? "N" : "S";
    const ew = coords.longitude > 0 ? "E" : "W";
    const formattedLatitude = Math.abs(coords.latitude).toFixed(7);
    const formattedLongitude = Math.abs(coords.longitude).toFixed(7);
    const formattedHeight = coords.height.toFixed(1);
    return `${formattedLatitude}° ${ns}, ${formattedLongitude}° ${ew}, ${formattedHeight}m`;
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

export function LV03toWGS84(lv03: LV03coordinates): WGS84coordinates {
    const y_aux = (lv03.x - 600000) / 1000000;
    const x_aux = (lv03.y - 200000) / 1000000;
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
    const h = lv03.z + 49.55
        - 12.60 * y_aux
        - 22.64 * x_aux;
    return {
        latitude: latitude * 100 / 36,
        longitude: longitude * 100 / 36,
        height: h,
    };
}

export function WGS84toLV03(wgs84: WGS84coordinates): LV03coordinates {
    const latitudeTotalSec = wgs84.latitude * 3600;
    const longitudeTotalSec = wgs84.longitude * 3600;
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
    const z = wgs84.height - 49.55
        + 2.73 * lonAux
        + 6.94 * latAux;
    return {x: x, y: y, z: z};
}

export function getCurrentPositionLV03(successCallback: (coords: LV03coordinates) => void, errorCallback: (arg0: any) => void): void {
    navigator.geolocation.getCurrentPosition(position => {
            const hasAltitude = position.coords.altitude !== null;
            const altitudeOrZero = hasAltitude ? position.coords.altitude : 0;
            const wgsCoords: WGS84coordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                height: altitudeOrZero,
            };
            successCallback(WGS84toLV03(wgsCoords));
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
        .then(parseFloat)
        .then(successCallback)
        .catch(errorCallback);
}

export function parseLV03(text: string): LV03coordinates {
    text = text.replaceAll(" ", "");
    const elements = text.split("/");
    return {
        x: parseInt(elements[0]),
        y: elements.length > 2 ? parseInt(elements[1]) : 0,
        z: elements.length > 2 ? parseInt(elements[2]) : 0,
    };
}

export function extractCoordinatesFromString(text: string): LV03coordinates {
    //todo unit tests for this function
    const regex = new RegExp(/[12]?[' ]?(\d{3})[' ]?(\d{3})(\.\d+)?/, "g");
    let rest = text;
    const result: LV03coordinates = {x: 0, y: 0, z: 0};

    for (const match of text.matchAll(regex)) {
        console.log(match[0]);
        let number = parseInt(match[1]) * 1000 + parseInt(match[2]);
        if (match[3] != null) {
            if (parseInt(match[3][1]) >= 5) {
                number++;//number has decimal digits > 0.5
            }
        }
        if (LV03_Y_MIN <= number && number <= LV03_XY_MIDDLE) {
            result.y = number;
        } else if (LV03_XY_MIDDLE <= number && number <= LV03_X_MAX) {
            result.x = number;
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
        result.z = Math.round(parseFloat(number));
    }

    return result;
}

export function createSwissTopoLink(coords: LV03coordinates, zoom: number = 8): string {
    return "https://map.geo.admin.ch/" +
        `?E=2${coords.x}` +
        `&N=1${coords.y}` +
        `&zoom=${zoom}` +
        "&crosshair=marker";
}

export function createGoogleMapsLink(coords: WGS84coordinates, zoom: number = 8): string {
    return `https://www.google.com/maps/place/${coords.latitude},${coords.longitude}/@${coords.latitude},${coords.longitude},${zoom}z`;
}

export type StrNumIndex<TValue> = {
    [key: string | number]: TValue
}

export function binarySearchArrayElement<Element extends StrNumIndex<any>>(array: ArrayLike<Element>, property: string | number, value: any): Element | null {
    const idx = binarySearchArrayIndex(array, property, value);
    return idx == null
        ? null
        : array[idx];
}

export function binarySearchArrayIndex<Element extends StrNumIndex<any>>(array: ArrayLike<Element>, property: string | number, value: any): number | null {
    let start = 0;
    let end = array.length - 1;

    while (start <= end) {
        const middle = Math.floor((start + end) / 2);

        if (array[middle][property] === value) {
            return middle;
        } else if (array[middle][property] < value) {
            start = middle + 1;
        } else {
            end = middle - 1;
        }
    }
    return null;
}

export function deepClone<T>(obj: T): T {
    if (obj === undefined || obj === null) {
        return obj;
    }
    return JSON.parse(JSON.stringify(obj));
}

export function isDigits(text: string): boolean {
    return /^\d+$/.test(text);
}

export function solveQuadraticEquation(a: number, b: number, c: number): [number, number] {
    const result = (-1 * b + Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
    const result2 = (-1 * b - Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
    return [result, result2];
}

export function angleBetweenVectors(a: math.Matrix, b: math.Matrix): number {
    const dot: number = math.dot(a, b);
    const absProduct: number = <number>math.norm(a) * <number>math.norm(b);

    return <number>math.acos(dot / absProduct);
}