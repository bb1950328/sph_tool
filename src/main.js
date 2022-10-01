import { createApp } from 'vue'
import App from './App.vue'

import {library} from "@fortawesome/fontawesome-svg-core";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {faPen, faTrashCan, faPlus} from "@fortawesome/free-solid-svg-icons";
library.add(faPen, faTrashCan, faPlus);

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

createApp(App)
    .component("font-awesome-icon", FontAwesomeIcon)
    .mount('#app')
