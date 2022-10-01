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

export function LV03toWGS84(x, y, z) {
    let y_aux = (x - 600000) / 1000000;
    let x_aux = (y - 200000) / 1000000;
    let longitude = 2.6779094 +
        4.728982 * y_aux +
        0.791484 * y_aux * x_aux +
        0.1306 * y_aux * Math.pow(x_aux, 2) -
        0.0436 * Math.pow(y_aux, 3);
    let latitude = 16.9023892 +
        3.238272 * x_aux -
        0.270978 * Math.pow(y_aux, 2) -
        0.002528 * Math.pow(x_aux, 2) -
        0.0447 * Math.pow(y_aux, 2) * x_aux -
        0.0140 * Math.pow(x_aux, 3);
    let h = z + 49.55
        - 12.60 * y_aux
        - 22.64 * x_aux;
    return [latitude * 100 / 36, longitude * 100 / 36, h];
}

export function WGS84toLV03(latitude, longitude, height) {
    let latitudeTotalSec = latitude * 3600;
    let longitudeTotalSec = longitude * 3600;
    // https://www.swisstopo.admin.ch/content/swisstopo-internet/en/topics/survey/reference-systems/switzerland/_jcr_content/contentPar/tabs/items/dokumente_publikatio/tabPar/downloadlist/downloadItems/516_1459343097192.download/ch1903wgs84_e.pdf
    let latAux = (latitudeTotalSec - 169028.66) / 10000;
    let lonAux = (longitudeTotalSec - 26782.5) / 10000;
    let e = 2600072.37
        + 211455.93 * lonAux
        - 10938.51 * lonAux * latAux
        - 0.36 * lonAux * Math.pow(lonAux, 2)
        - 44.54 * Math.pow(lonAux, 3);
    let n = 1200147.07
        + 308807.95 * latAux
        + 3745.25 * Math.pow(lonAux, 2)
        + 76.63 * Math.pow(latAux, 2)
        - 194.56 * Math.pow(lonAux, 2) * latAux
        + 119.79 * Math.pow(latAux, 3);
    let x = e - 2000000;
    let y = n - 1000000;
    let z = height - 49.55
        + 2.73 * lonAux
        + 6.94 * latAux;
    return [x, y, z];
}

export function getCurrentPositionLV03(successCallback, errorCallback) {
    navigator.geolocation.getCurrentPosition(position => {
            let [x, y, z] = WGS84toLV03(position.coords.latitude, position.coords.longitude, position.coords.altitude);
            let hasAltitude = position.coords.altitude !== null;
            successCallback({"x": x, "y": y, "z": hasAltitude ? z : null});
        },
        errorCallback,
        {
            enableHighAccuracy: true,
            maximumAge: 100_000,
        }
    );
}

export function getHeightFromSwissTopo(x, y, successCallback, errorCallback) {
    let params = new URLSearchParams({
        easting: x,
        northing: y,
        sr: 21781
    });
    let url = "https://api3.geo.admin.ch/rest/services/height?" + params;
    fetch(url)
        .then(response => response.json())
        .then(json => json["height"])
        .then(successCallback)
        .catch(errorCallback);
}