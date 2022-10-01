import { createApp } from 'vue'
import App from './App.vue'

import {library} from "@fortawesome/fontawesome-svg-core";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {faPen, faTrashCan, faPlus, faMapLocationDot, faLocationCrosshairs} from "@fortawesome/free-solid-svg-icons";
library.add(faPen, faTrashCan, faPlus, faMapLocationDot, faLocationCrosshairs);

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

createApp(App)
    .component("font-awesome-icon", FontAwesomeIcon)
    .mount('#app')
