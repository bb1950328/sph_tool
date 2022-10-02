<template>
  <form id="input-values">
    <div class="mb-3">
      <div class="col-3" id="unknown-group-label">Unbekannt</div>
      <div class="col-9">
        <div class="btn-group" role="group" aria-label="Unbekannt" id="unknown-radio-group">
          <input type="radio" class="btn-check" name="unknown-radio" id="unknown-direction" autocomplete="off" checked
                 @click="unknownValueChangedTo('direction')">
          <label class="btn btn-outline-primary" for="unknown-direction">Richtung</label>

          <input type="radio" class="btn-check" name="unknown-radio" id="unknown-target-coordinates" autocomplete="off"
                 @click="unknownValueChangedTo('target-coordinates')">
          <label class="btn btn-outline-primary" for="unknown-target-coordinates">ZielKoord</label>

          <input type="radio" class="btn-check" name="unknown-radio" id="unknown-observer-coordinates"
                 autocomplete="off"
                 @click="unknownValueChangedTo('observer-coordinates')">
          <label class="btn btn-outline-primary" for="unknown-observer-coordinates">BeoKoord</label>
        </div>
      </div>
    </div>
    <div class="mb-3" v-if="currentUnknownValue!=='observer-coordinates'">
      <label for="observer-point-select">Beobachterpunkt</label>
      <div class="input-group">
        <select class="form-select col-6" id="observer-point-select" v-model="inpObserverPointNr">
          <option v-for="(pt, nr) in allPoints" :key="nr" :value="nr">{{ nr }} {{ pt["description"] }}</option>
        </select>
        <div class="input-group-addon col-6 coordinate-select-display">
          {{ inpObserverPoint != null ? formatCoordinates(inpObserverPoint) : "" }}
        </div>
      </div>
    </div>
    <div class="mb-3" v-if="currentUnknownValue!=='target-coordinates'">
      <label for="target-point-select">Zielpunkt</label>
      <div class="input-group">
        <select class="form-select" id="target-point-select" v-model="inpTargetPointNr">
          <option v-for="(pt, nr) in allPoints" :key="nr" :value="nr">{{ nr }} {{ pt["description"] }}</option>
        </select>
        <div class="input-group-addon col-6 coordinate-select-display">
          {{ inpTargetPoint != null ? formatCoordinates(inpTargetPoint) : "" }}
        </div>
      </div>
    </div>
    <div class="mb-3 row" v-show="currentUnknownValue!=='direction'">
      <div class="col-4">
        <label for="input-azimut">Azimut</label>
        <input type="number" id="input-azimut" class="form-control" v-model="inpAzimut">
      </div>
      <div class="col-4">
        <label for="input-gelwi">GelWi</label>
        <input type="number" id="input-gelwi" class="form-control" v-model="inpGelwi">
      </div>
      <div class="col-4">
        <label for="input-distance">Distanz visuell</label>
        <input type="number" id="input-distance" class="form-control" v-model="inpDistanceVisual">
      </div>
    </div>
    <div class="mb-3" v-if="hasResult">
      <h2>Resultat</h2>
      <div v-if="currentUnknownValue==='direction'">
        <table>
          <tr>
            <td>Azimut</td>
            <td>{{ formatArtilleryPromilleValue(resultAzimut) }}</td>
          </tr>
          <tr>
            <td>Geländewinkel</td>
            <td>{{ formatArtilleryPromilleValue(resultGelwi) }}</td>
          </tr>
          <tr>
            <td>Distanz topografisch</td>
            <td>{{ resultDistanceTopo }}m</td>
          </tr>
          <tr>
            <td>Distanz visuell</td>
            <td>{{ resultDistanceVisual }}m</td>
          </tr>
        </table>
      </div>
      <div v-if="currentUnknownValue!=='direction'">
        <p v-if="currentUnknownValue==='observer-coordinates'">
          Beobachterkoordinaten: {{ formatCoordinates(resultObserverCoordinates) }}
        </p>
        <p v-if="currentUnknownValue==='target-coordinates'">
          Zielkoordinaten: {{ formatCoordinates(resultTargetCoordinates) }}
        </p>
      </div>
    </div>
  </form>
</template>

<script>
import {allPoints} from "@/points_list";
import {formatArtilleryPromilleValue, formatCoordinates} from "@/util";

export default {
  name: "CoordinateCalculations",
  data() {
    return {
      currentUnknownValue: "direction",
      allPoints: allPoints,

      inpObserverPointNr: null,
      inpTargetPointNr: null,
      inpAzimut: 0,
      inpGelwi: 0,
      inpDistanceVisual: 0,

      hasResult: false,
      resultAzimut: 0,
      resultGelwi: 0,
      resultDistanceVisual: 0,
      resultDistanceTopo: 0,
      resultObserverCoordinates: {},
      resultTargetCoordinates: {},
    }
  },
  methods: {
    formatArtilleryPromilleValue: formatArtilleryPromilleValue,
    formatCoordinates: formatCoordinates,
    unknownValueChangedTo(unknown) {
      this.currentUnknownValue = unknown;
    },
    updateResult() {
      this.hasResult = false;
      if (this.currentUnknownValue === "direction") {
        if (this.inpObserverPoint == null || this.inpTargetPoint == null) {
          return;
        }
        let diffX = (this.inpTargetPoint)["x"] - (this.inpObserverPoint)["x"];
        let diffY = (this.inpTargetPoint)["y"] - (this.inpObserverPoint)["y"];
        let diffZ = (this.inpTargetPoint)["z"] - (this.inpObserverPoint)["z"];
        this.resultDistanceTopo = Math.round(Math.sqrt(diffX * diffX + diffY * diffY));
        this.resultDistanceVisual = Math.round(Math.sqrt(diffX * diffX + diffY * diffY + diffZ * diffZ));
        this.resultAzimut = (Math.PI / 2 - Math.atan2(diffY, diffX)) / Math.PI * 3200;
        this.resultGelwi = (Math.atan(diffZ / this.resultDistanceTopo)) / Math.PI * 3200;
      } else {
        let gelwiRadians = (Math.round(this.inpGelwi) % 6400) / 3200 * Math.PI;
        let diffZ = Math.sin(gelwiRadians) * this.inpDistanceVisual;
        let distanceTopo = Math.sqrt(this.inpDistanceVisual * this.inpDistanceVisual - diffZ * diffZ);
        let azimutRadians = (Math.round(this.inpAzimut) % 6400) / 3200 * Math.PI;
        let diffX = Math.cos(azimutRadians) * distanceTopo;
        let diffY = Math.sin(azimutRadians) * distanceTopo;

        let targetIsUnknown = this.currentUnknownValue === "target-coordinates";
        let knownPoint = targetIsUnknown ? this.inpObserverPoint : this.inpTargetPoint;
        if (knownPoint == null) {
          return;
        }
        let diffSign = targetIsUnknown ? 1 : -1;

        let resultCoordinates = {
          x: knownPoint["x"] + diffX * diffSign,
          y: knownPoint["y"] + diffY * diffSign,
          z: knownPoint["z"] + diffZ * diffSign,
        };

        if (targetIsUnknown) {
          this.resultTargetCoordinates = resultCoordinates;
        } else {
          this.resultObserverCoordinates = resultCoordinates;
        }
      }
      this.hasResult = true;
    },
  },
  computed: {
    allInputs() {
      return [
        this.currentUnknownValue,
        this.inpObserverPointNr,
        this.inpTargetPointNr,
        this.inpAzimut,
        this.inpGelwi,
        this.inpDistanceVisual,
      ];
    },
    inpObserverPoint() {
      return this.inpObserverPointNr != null ? allPoints[this.inpObserverPointNr]["coordinates"] : null;
    },
    inpTargetPoint() {
      return this.inpTargetPointNr != null ? allPoints[this.inpTargetPointNr]["coordinates"] : null;
    },
  },
  watch: {
    allInputs() {
      this.updateResult();
    }
  }
}
</script>

<style scoped>
#unknown-group-label, .coordinate-select-display {
  display: -webkit-flex;
  display: flex;
  align-items: center;
}

.coordinate-select-display {
  padding-left: 0.5rem;
}

#input-values {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
</style>