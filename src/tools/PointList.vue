<template>
  <div class="p-2">
    <button type="button" class="btn btn-primary" @click="newPoint()">
      <font-awesome-icon icon="fa-solid fa-plus"/>
      Neuer Punkt
    </button>
    <table class="table table-striped table-bordered table-sm mt-2">
      <thead>
      <tr>
        <th scope="col">Nr</th>
        <th scope="col">Bezeichnung</th>
        <th scope="col">Koordinaten</th>
        <th scope="col"></th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(pt, nr) in allPoints" :key="nr">
        <th scope="row">{{ nr }}</th>
        <td>{{ pt.description }}</td>
        <td>{{ formatCoordinates(pt.coordinates) }}</td>
        <td>
          <button type="button" class="btn btn-outline-secondary btn-sm edit-point-button" @click="openModal(nr)">
            <font-awesome-icon icon="fa-solid fa-pen"/>
          </button>
          <button type="button" class="btn btn-outline-danger btn-sm delete-point-button" @click="removePoint(nr)">
            <font-awesome-icon icon="fa-solid fa-trash-can"/>
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    <div class="modal" tabindex="-1" role="dialog" id="pointEditModal">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Punkt {{ currentlyEditingNr }} bearbeiten</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
              <span aria-hidden="true" hidden>&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form>
              <div class="mb-3">
                <label for="modalInputDescription" class="form-label">Beschreibung</label>
                <input type="text" class="form-control" id="modalInputDescription">
              </div>
              <label for="modalInputCoordinateGroup" class="form-label">Koordinaten</label>
              <div class="input-group" id="modalInputCoordinateGroup">
                <input v-mask="'### ###'" class="form-control" placeholder="X" id="modalInputX">
                <div class="input-group-prepend">
                  <span class="input-group-text">/</span>
                </div>
                <input v-mask="'### ###'" class="form-control" placeholder="Y" id="modalInputY">
                <div class="input-group-prepend">
                  <span class="input-group-text">/</span>
                </div>
                <input v-mask="'####'" class="form-control" placeholder="H" id="modalInputZ">
              </div>
              <div class="" role="group" id="modalGPSandSwissTopoBtnGroup">
                <button type="button" class="btn btn-sm btn-secondary" @click="insertXYfromGPSinModal()">
                  X/Y
                  <font-awesome-icon icon="fa-solid fa-location-crosshairs"/>
                  GPS
                </button>
                <button type="button" class="btn btn-sm btn-secondary" @click="insertHfromGPSinModal()">
                  H
                  <font-awesome-icon icon="fa-solid fa-location-crosshairs"/>
                  GPS
                </button>
                <button type="button" class="btn btn-sm btn-secondary" @click="insertHfromSwissTopoInModal()">
                  H
                  <font-awesome-icon icon="fa-solid fa-map-location-dot"/>
                  SwissTopo
                </button>
                <button type="button" class="btn btn-sm btn-secondary" @click="pasteIntoModal()">
                  <font-awesome-icon icon="fa-solid fa-paste"/>
                  Paste
                </button>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="saveChangesFromModal()">Speichern</button>
            <button type="button" class="btn btn-secondary" @click="closeModal()">Abbrechen</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  extractCoordinatesFromString,
  formatCoordinates,
  formatCoordinateXYValue,
  formatCoordinateZValue,
  getCurrentPositionLV03,
  getHeightFromSwissTopo
} from "@/util";

import {Modal} from "bootstrap"

import {mask} from "vue-the-mask";

import {allPoints} from "@/points_list"

export default {
  name: "PointList",
  methods: {
    formatCoordinates: formatCoordinates,
    newPoint() {
      let nr = this.findNextFreeNumber();
      this.allPoints[nr] = {
        "description": "Neuer Punkt",
        "coordinates": {"x": 0, "y": 0, "z": 0}
      };
      this.openModal(nr);
    },
    findNextFreeNumber() {
      let nextFree = 1;
      while (Object.hasOwn(this.allPoints, nextFree.toString())) {
        ++nextFree;
      }
      return nextFree;
    },
    removePoint(nr) {
      delete this.allPoints[nr];
    },
    setModalCoordinates: function (coordinates) {
      let x = coordinates["x"];
      let y = coordinates["y"];
      let z = coordinates["z"];
      if (x) {
        document.getElementById("modalInputX").value = formatCoordinateXYValue(x);
      }
      if (y) {
        document.getElementById("modalInputY").value = formatCoordinateXYValue(y);
      }
      if (z) {
        document.getElementById("modalInputZ").value = formatCoordinateZValue(z);
      }
    },
    openModal(nr) {
      this.currentlyEditingNr = nr;
      let point = this.allPoints[this.currentlyEditingNr];
      document.getElementById("modalInputDescription").value = point["description"];
      this.setModalCoordinates(point["coordinates"]);

      this.modal = new Modal(document.getElementById("pointEditModal"));
      this.modal.show();
    },
    closeModal() {
      this.modal.hide();
      this.currentlyEditingNr = null;
    },
    getCoordinatesFromModalInputs: function () {
      return {
        x: parseInt(document.getElementById("modalInputX").value.replace(" ", "")),
        y: parseInt(document.getElementById("modalInputY").value.replace(" ", "")),
        z: parseInt(document.getElementById("modalInputZ").value),
      };
    },
    saveChangesFromModal() {
      let point = this.allPoints[this.currentlyEditingNr];
      point["description"] = document.getElementById("modalInputDescription").value;
      point["coordinates"] = this.getCoordinatesFromModalInputs();
      this.closeModal();
    },
    insertXYfromGPSinModal() {
      getCurrentPositionLV03(coordinates => {
            delete coordinates["z"];
            this.setModalCoordinates(coordinates);
          },
          error => console.error(error)//TODO better error handling (toast)
      );
    },
    insertHfromGPSinModal() {
      getCurrentPositionLV03(coordinates => {
            delete coordinates["x"];
            delete coordinates["y"];
            this.setModalCoordinates(coordinates);
          },
          error => console.error(error)//TODO better error handling (toast)
      );
    },
    insertHfromSwissTopoInModal() {
      let modalCoords = this.getCoordinatesFromModalInputs();
      getHeightFromSwissTopo(modalCoords["x"], modalCoords["y"],
          height => this.setModalCoordinates({"z": height}),
          error => console.error(error));
    },
    pasteIntoModal() {
      navigator
          .clipboard
          .readText()
          .then(extractCoordinatesFromString)
          .then(this.setModalCoordinates);
    }
  },
  data() {
    return {
      currentlyEditingNr: null,
      allPoints: allPoints,
    }
  },
  directives: {
    mask,
  }
}
</script>

<style scoped>
#modalGPSandSwissTopoBtnGroup {
  margin-top: 0.5rem;
}

#modalGPSandSwissTopoBtnGroup button:not(:first-child) {
  margin-left: 0.2rem;
}

.edit-point-button {
  margin-right: 0.25rem;
}

#app > table {
  margin-top: 0.5rem;
}
</style>