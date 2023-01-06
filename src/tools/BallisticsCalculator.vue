<template>
  <div class="p-2 d-flex flex-column">
    <form class="col-11">
      <div class="mb-3 row">
        <div class="col">
          <label for="distance-range-input" class="form-label">Distanz</label>
          <input id="distance-range-input" type="range" class="form-range"
                 v-model="situation.distance" min="100" max="1200">
        </div>
        <div class="col-sm-2 col-md-2 col-lg-1 double-input-value-container">
          <label for="distance-value-input" class="form-label" hidden>Distanz</label>
          <input id="distance-value-input" type="number" class="form-control" v-model="situation.distance" aria-label="Distance">
        </div>
      </div>
      <div class="mb-3 row">
        <div class="col">
          <label for="wind-speed-range-input" class="form-label">Windgeschwindigkeit</label>
          <input id="wind-speed-range-input" type="range" class="form-range"
                 v-model="situation.windSpeed" min="0" max="10">
        </div>
        <div class="col-sm-2 col-md-2 col-lg-1 double-input-value-container">
          <label for="wind-speed-value-input" class="form-label" hidden>Windgeschwindigkeit</label>
          <input id="wind-speed-value-input" class="form-control" type="number"
                 v-model="situation.windSpeed" min="0" max="10" aria-label="Wind speed">
        </div>
      </div>
      <div class="mb-3 row">
        <div class="col-lg-3 col-md-4 col-sm-5">
          <label for="windDirectionInput" class="form-label">Windrichtung (Uhr)</label>
          <ClockRadioGroup v-model="situation.windClock"/>
        </div>
        <div class="col">
          <div class="mb-3">
            <label for="airPressureInput" class="form-label">Luftdruck</label>
            <input id="airPressureInput" type="number" class="form-control" v-model="situation.airPressure">
          </div>
          <div class="mb-3">
            <label for="temperatureInput" class="form-label">Temperatur</label>
            <input id="temperatureInput" type="number" class="form-control" v-model="situation.temperature">
          </div>
          <div class="mb-3">
            <label for="barrelGroup" class="form-label">Lauf</label>
            <div class="btn-group" role="group" aria-label="Lauf" id="barrel-group">
              <input type="radio" class="btn-check" name="barrel-radio" id="barrel-radio-new" autocomplete="off"
                     v-model="situation.oldBarrel" v-bind:value="false">
              <label class="btn btn-outline-primary" for="barrel-radio-new">Neu</label>

              <input type="radio" class="btn-check" name="barrel-radio" id="barrel-radio-old" autocomplete="off"
                     v-model="situation.oldBarrel" v-bind:value="true">
              <label class="btn btn-outline-primary" for="barrel-radio-old">Alt</label>
            </div>
          </div>
        </div>
      </div>
    </form>
    <h2>Resultat</h2>
    <div class="mb-5" id="clicks-result">
      <div class="">
        <table>
          <tr>
            <td>Distanz</td>
            <td>{{ formatElevationClicks(situation.baseElevation) }}</td>
          </tr>
          <tr v-show="situation.oldBarrelElevationCorrection!==0">
            <td>Alter Lauf</td>
            <td>{{ formatElevationClicks(situation.oldBarrelElevationCorrection) }}</td>
          </tr>
          <tr v-show="situation.airPressureElevationCorrection!==0">
            <td>Luftdruck</td>
            <td>{{ formatElevationClicks(situation.airPressureElevationCorrection) }}</td>
          </tr>
          <tr v-show="situation.temperatureElevationCorrection!==0">
            <td>Temperatur</td>
            <td>{{ formatElevationClicks(situation.temperatureElevationCorrection) }}</td>
          </tr>
          <tr class="important-row">
            <td>Höhe</td>
            <td>{{ formatElevationClicks(situation.totalElevation) }}</td>
          </tr>
        </table>
      </div>
      <div class="">
        <table>
          <tr v-show="situation.baseWindage">
            <td>Wind</td>
            <td :class="windageCssClass(situation.baseWindage)">
              {{ formatWindageClicks(situation.baseWindage) }}
            </td>
          </tr>
          <tr v-show="situation.derivationWindageCorrection">
            <td>Derivation</td>
            <td :class="windageCssClass(situation.derivationWindageCorrection)">
              {{ formatWindageClicks(situation.derivationWindageCorrection) }}
            </td>
          </tr>
          <tr class="important-row">
            <td>Seite</td>
            <td :class="windageCssClass(situation.totalWindage)">
              {{ formatWindageClicks(situation.totalWindage) }}
            </td>
          </tr>
        </table>
      </div>
    </div>

    <button type="button" class="btn btn-outline-secondary w-auto" @click="$refs.clickTable.openModal(this.situation)">
      <font-awesome-icon icon="fa-solid fa-table-cells"/>
      Klicktabelle berechnen
    </button>
    <ClickTable ref="clickTable"/>
  </div>
</template>

<script>

import {
  BallisticSituation,
  formatElevationClicks,
  formatWindageClicks,
  windageCssClass,
} from "@/ballistic_calculations";

import ClockRadioGroup from "@/components/ClockRadioGroup.vue";
import ClickTable from "@/components/ClickTable.vue";
import {reactive} from "vue";

export default {
  name: "BallisticsCalculator",
  components: {
    ClockRadioGroup,
    ClickTable,
  },
  data() {
    const ballisticSituation = reactive(new BallisticSituation());
    ballisticSituation.loadFromLocalStorage();
    return {
      situation: ballisticSituation,
    }
  },
  watch: {
    situation: {
      deep: true,
      handler() {
        this.situation.saveToLocalStorage();
      }
    },
  },
  methods: {
    formatElevationClicks: formatElevationClicks,
    formatWindageClicks: formatWindageClicks,
    windageCssClass: windageCssClass,
  }
}
</script>

<style scoped>
.important-row {
  font-weight: bold;
}

#clicks-result {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
}

#clicks-result > div:not(:first-child) {
  margin-left: 1.5rem;
}

#clicks-result td:not(:first-child) {
  margin-left: 0.5rem;
}

#barrel-group {
  display: block !important;
}

.double-input-value-container {
  display: flex;
  align-items: flex-end;
}
</style>