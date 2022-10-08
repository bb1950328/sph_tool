import {reactive, watch} from "vue";

export const allPoints = reactive(loadPoints());

watch(allPoints, () => storePoints());

function storePoints() {
    localStorage.setItem("points", JSON.stringify(allPoints));
}

function loadPoints() {
    const points = localStorage.getItem("points");
    if (points === null) {
        return {
            1: {"description": "Kaserne Chur", "coordinates": {"x": 758603.97, "y": 190604.61, "z": 582.2}},
            2: {"description": "Halle 6", "coordinates": {"x": 757100.66, "y": 190421.80, "z": 565.1}},
            3: {"description": "Spl 342", "coordinates": {"x": 756828.17, "y": 191188.90, "z": 567.8}},
        }
    } else {
        return JSON.parse(points);
    }
}