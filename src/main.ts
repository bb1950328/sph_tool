import { createApp } from 'vue'
import App from './App.vue'

import {library} from "@fortawesome/fontawesome-svg-core";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {faPen, faTrashCan, faPlus, faMapLocationDot, faLocationCrosshairs, faPaste, faTableCells} from "@fortawesome/free-solid-svg-icons";
library.add(faPen, faTrashCan, faPlus, faMapLocationDot, faLocationCrosshairs, faPaste, faTableCells);

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

import './assets/css/main.css';

createApp(App)
    .component("font-awesome-icon", FontAwesomeIcon)
    .mount('#app')
