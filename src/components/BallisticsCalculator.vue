<template>
  <form>
    <div class="mb-3">
      <label for="distanceInput" class="form-label">Distanz</label>
      <input id="distanceInput" type="number" class="form-control" v-model="distance">
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
      <div class="col-6">
        <label for="airPressureInput" class="form-label">Luftdruck</label>
        <input id="airPressureInput" type="number" class="form-control" v-model="airPressure">
      </div>
      <div class="col-6">
        <label for="temperatureInput" class="form-label">Temperatur</label>
        <input id="temperatureInput" type="number" class="form-control" v-model="temperature">
      </div>
    </div>
  </form>
  <h2>Resultat</h2>
  <div class="mb-3" id="clicks-result">
    <div class="">
      <table>
        <tr>
          <td>Distanz</td>
          <td>{{ alwaysWithSign(resultBaseElevation) }}</td>
        </tr>
        <tr v-show="resultOldBarrelElevationCorrection!==0">
          <td>Alter Lauf</td>
          <td>{{ alwaysWithSign(resultOldBarrelElevationCorrection) }}</td>
        </tr>
        <tr v-show="resultAirPressureElevationCorrection!==0">
          <td>Luftdruck</td>
          <td>{{ alwaysWithSign(resultAirPressureElevationCorrection) }}</td>
        </tr>
        <tr v-show="resultTemperatureElevationCorrection!==0">
          <td>Temperatur</td>
          <td>{{ alwaysWithSign(resultTemperatureElevationCorrection) }}</td>
        </tr>
        <tr class="important-row">
          <td>Höhe</td>
          <td>{{ alwaysWithSign(totalElevationClicks) }}</td>
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
      distance: 100,
      windSpeed: 0,
      windClock: 0,
      airPressure: 950,
      temperature: 25,

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
      ];
    }
  },
  watch: {
    allInputValues() {
      this.resultBaseElevation = GP04_ELEVATION_CLICKS.getValueLinearInterpolation(this.distance);
      this.resultOldBarrelElevationCorrection = GP04_ELEVATION_OLD_BARREL_CORRECTION.getValueLinearInterpolation(this.distance);
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
  },
  methods: {
    alwaysWithSign(number) {
      return (number < 0 ? "" : "+") + number;
    },
    formatWindageClicks(clicks) {
      let word = "";
      if (clicks < 0) {
        word = "negativ ";
      } else if (clicks > 0) {
        word = "positiv ";
      }
      return word + Math.abs(clicks);
    },
    windageCssClass(windage) {
      if (windage < 0) {
        return "windage-negative";
      } else if (windage > 0) {
        return "windage-positive";
      } else {
        return "";
      }
    }
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
</style>