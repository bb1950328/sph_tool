<template>
  <form>
    <div class="mb-3 row">
      <div class="col-9">
        <label for="distance-range-input" class="form-label">Distanz</label>
        <input id="distance-range-input" type="range" class="form-range" v-model="distance" min="100" max="1200">
      </div>
      <div class="col-3" id="distance-value-input-container">
        <label for="distance-value-input" class="form-label" hidden>Distanz</label>
        <input id="distance-value-input" type="number" class="form-control" v-model="distance">
      </div>
    </div>
    <div class="mb-3 row">
      <div class="col-6">
        <label for="windSpeedInput" class="form-label">Windgeschwindigkeit</label>
        <input id="windSpeedInput" type="number" class="form-control" v-model="windSpeed">
      </div>
      <div class="col-6">
        <label for="windDirectionInput" class="form-label">Windrichtung (Uhr)</label>
        <input id="windDirectionInput" type="number" class="form-control" v-model="windClock">
      </div>
    </div>
    <div class="mb-3 row">
      <div class="col-4">
        <label for="airPressureInput" class="form-label">Luftdruck</label>
        <input id="airPressureInput" type="number" class="form-control" v-model="airPressure">
      </div>
      <div class="col-4">
        <label for="temperatureInput" class="form-label">Temperatur</label>
        <input id="temperatureInput" type="number" class="form-control" v-model="temperature">
      </div>
      <div class="col-4">
        <label for="barrelGroup" class="form-label">Lauf</label>
        <div class="btn-group" role="group" aria-label="Lauf" id="barrel-group">
          <input type="radio" class="btn-check" name="barrel-radio" id="barrel-radio-new" autocomplete="off"
                 v-model="oldBarrel" v-bind:value="false">
          <label class="btn btn-outline-primary" for="barrel-radio-new">Neu</label>

          <input type="radio" class="btn-check" name="barrel-radio" id="barrel-radio-old" autocomplete="off"
                 v-model="oldBarrel" v-bind:value="true">
          <label class="btn btn-outline-primary" for="barrel-radio-old">Alt</label>
        </div>
      </div>
    </div>
  </form>
  <h2>Resultat</h2>
  <div class="mb-3" id="clicks-result">
    <div class="">
      <table>
        <tr>
          <td>Distanz</td>
          <td>{{ formatElevationClicks(resultBaseElevation) }}</td>
        </tr>
        <tr v-show="resultOldBarrelElevationCorrection!==0">
          <td>Alter Lauf</td>
          <td>{{ formatElevationClicks(resultOldBarrelElevationCorrection) }}</td>
        </tr>
        <tr v-show="resultAirPressureElevationCorrection!==0">
          <td>Luftdruck</td>
          <td>{{ formatElevationClicks(resultAirPressureElevationCorrection) }}</td>
        </tr>
        <tr v-show="resultTemperatureElevationCorrection!==0">
          <td>Temperatur</td>
          <td>{{ formatElevationClicks(resultTemperatureElevationCorrection) }}</td>
        </tr>
        <tr class="important-row">
          <td>Höhe</td>
          <td>{{ formatElevationClicks(totalElevationClicks) }}</td>
        </tr>
      </table>
    </div>
    <div class="">
      <table>
        <tr v-show="resultBaseWindage" :class="windageCssClass(resultBaseWindage)">
          <td>Wind</td>
          <td>{{ formatWindageClicks(resultBaseWindage) }}</td>
        </tr>
        <tr v-show="resultDerivationWindageCorrection" :class="windageCssClass(resultDerivationWindageCorrection)">
          <td>Derivation</td>
          <td>{{ formatWindageClicks(resultDerivationWindageCorrection) }}</td>
        </tr>
        <tr class="important-row" :class="windageCssClass(totalWindageClicks)">
          <td>Seite</td>
          <td>{{ formatWindageClicks(totalWindageClicks) }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>

import {
  GP04_ELEVATION_AIR_PRESSURE_CORRECTION,
  GP04_ELEVATION_CLICKS,
  GP04_ELEVATION_OLD_BARREL_CORRECTION,
  GP04_ELEVATION_TEMPERATURE_CORRECTION,
  GP04_WINDAGE_DERIVATION,
  GP04_WINDAGE_WIND
} from "@/ballistics_data";

export default {
  name: "BallisticsCalculator",
  data() {
    return {
      distance: parseInt(localStorage.getItem("ballistics_distance")) || 100,
      windSpeed: parseInt(localStorage.getItem("ballistics_windSpeed")) || 0,
      windClock: parseInt(localStorage.getItem("ballistics_windClock")) || 0,
      airPressure: parseInt(localStorage.getItem("ballistics_airPressure")) || 950,
      temperature: parseInt(localStorage.getItem("ballistics_temperature")) || 25,
      oldBarrel: localStorage.getItem("ballistics_oldBarrel") === "true",

      resultBaseElevation: 0,
      resultOldBarrelElevationCorrection: 0,
      resultAirPressureElevationCorrection: 0,
      resultTemperatureElevationCorrection: 0,

      resultBaseWindage: 0,
      resultDerivationWindageCorrection: 0,
    }
  },
  computed: {
    totalElevationClicks() {
      return this.resultBaseElevation
          + this.resultOldBarrelElevationCorrection
          + this.resultAirPressureElevationCorrection
          + this.resultTemperatureElevationCorrection;
    },
    totalWindageClicks() {
      return this.resultBaseWindage
          + this.resultDerivationWindageCorrection;
    },
    allInputValues() {
      return [
        this.distance,
        this.windSpeed,
        this.windClock,
        this.airPressure,
        this.temperature,
        this.oldBarrel,
      ];
    }
  },
  watch: {
    allInputValues() {
      this.calculateClicks();
      this.persistInputValues();
    },
  },
  mounted() {
    this.calculateClicks();
  },
  methods: {
    formatElevationClicks(number) {
      const rounded = Math.round(number);
      return (rounded < 0 ? "" : "+") + rounded;
    },
    formatWindageClicks(clicks) {
      let word = "";
      if (clicks < 0) {
        word = "negativ ";
      } else if (clicks > 0) {
        word = "positiv ";
      }
      return word + Math.round(Math.abs(clicks));
    },
    windageCssClass(windage) {
      if (windage < 0) {
        return "windage-negative";
      } else if (windage > 0) {
        return "windage-positive";
      } else {
        return "";
      }
    },
    calculateClicks() {
      this.resultBaseElevation = GP04_ELEVATION_CLICKS.getValueLinearInterpolation(this.distance);
      this.resultOldBarrelElevationCorrection = this.oldBarrel ? GP04_ELEVATION_OLD_BARREL_CORRECTION.getValueLinearInterpolation(this.distance) : 0;
      this.resultAirPressureElevationCorrection = GP04_ELEVATION_AIR_PRESSURE_CORRECTION.getValueBilinearInterpolation(this.distance, this.airPressure);
      this.resultTemperatureElevationCorrection = GP04_ELEVATION_TEMPERATURE_CORRECTION.getValueBilinearInterpolation(this.distance, this.temperature);

      let clock0to3;
      if (this.windClock <= 3) {
        clock0to3 = this.windClock;
      } else if (this.windClock <= 6) {
        clock0to3 = 6 - this.windClock;
      } else if (this.windClock <= 9) {
        clock0to3 = this.windClock - 6;
      } else {
        clock0to3 = 12 - this.windClock;
      }
      this.resultBaseWindage = GP04_WINDAGE_WIND.getValueTrilinearInterpolation(this.distance, clock0to3, this.windSpeed);
      this.resultDerivationWindageCorrection = GP04_WINDAGE_DERIVATION.getValueLinearInterpolation(this.distance);
    },
    persistInputValues() {
      localStorage.setItem("ballistics_distance", this.distance.toString());
      localStorage.setItem("ballistics_windSpeed", this.windSpeed.toString());
      localStorage.setItem("ballistics_windClock", this.windClock.toString());
      localStorage.setItem("ballistics_airPressure", this.airPressure.toString());
      localStorage.setItem("ballistics_temperature", this.temperature.toString());
      localStorage.setItem("ballistics_oldBarrel", this.oldBarrel.toString());
    },
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

.windage-negative {
  color: blue;
}

.windage-positive {
  color: red;
}

#barrel-group {
  display: block !important;
}

#distance-value-input-container {
  display: flex;
  align-items: flex-end;
}
</style>