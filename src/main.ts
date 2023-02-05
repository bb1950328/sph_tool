import {createApp} from 'vue'
import App from './App.vue'

import {library} from "@fortawesome/fontawesome-svg-core";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {
    faPen,
    faTrashCan,
    faPlus,
    faMapLocationDot,
    faLocationCrosshairs,
    faPaste,
    faTableCells,
    faLayerGroup,
    faBars,
    faXmark,
    faFloppyDisk,
    faMagnifyingGlassMinus,
    faMagnifyingGlassPlus,
    faSlash,
    faCameraRotate,
    faCamera,
    faList,
} from "@fortawesome/free-solid-svg-icons";

library.add(
    faPen,
    faTrashCan,
    faPlus,
    faMapLocationDot,
    faLocationCrosshairs,
    faPaste,
    faTableCells,
    faLayerGroup,
    faBars,
    faXmark,
    faFloppyDisk,
    faMagnifyingGlassMinus,
    faMagnifyingGlassPlus,
    faSlash,
    faCameraRotate,
    faCamera,
    faList
);

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"


import {createRouter, createWebHashHistory} from "vue-router"

export const toolRoutes = [
    {path: "/pointList", component: PointList, name: "Punkteliste"},
    {path: "/coordinateCalculations", component: CoordinateCalculations, name: "Koordinatenberechnungen"},
    {path: "/mapView", component: MapView, name: "Karte"},
    {path: "/userGrid", component: UserGrid, name: "Führungsraster"},
    {path: "/ballisticsCalculator", component: BallisticsCalculator, name: "Ballistik"},
];
if (process.env.NODE_ENV === 'development') {
    // @ts-ignore
    toolRoutes.push({path: "/cameraGonio", component: CameraGonio, name: "Kamera-Gonio"});
}

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {path: "/", redirect: "/pointList"},
        ...toolRoutes,
    ],
    linkExactActiveClass: "active",
})

import './assets/css/main.css';
import PointList from "@/tools/PointList.vue";
import BallisticsCalculator from "@/tools/BallisticsCalculator.vue";
import CoordinateCalculations from "@/tools/CoordinateCalculations.vue";
import MapView from "@/tools/MapView.vue";
import CameraGonio from "@/tools/CameraGonio.vue";
import UserGrid from "@/tools/UserGrid.vue";

createApp(App)
    .component("font-awesome-icon", FontAwesomeIcon)
    .use(router)
    .mount('#app');


document.body.setAttribute("data-bs-theme", "dark");
