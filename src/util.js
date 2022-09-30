export function formatCoordinates(coords) {
    let xStr = formatCoordinateXYValue(coords["x"]);
    let yStr = formatCoordinateXYValue(coords["y"]);
    let zStr = formatCoordinateZValue(coords["z"]);
    return `${xStr} / ${yStr} / ${zStr}`;
}

export function formatCoordinateXYValue(value) {
    let sixDigit = Math.round(value) % 1000000;
    let numStr = sixDigit.toString().padStart(6, "0");
    return numStr.slice(0, 3) + " " + numStr.slice(3);
}

export function formatCoordinateZValue(value) {
    return Math.round(value).toString();
}