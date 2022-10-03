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
  <div>
    <table>
      <tr>
        <td>Höhe</td>
        <td>{{ formattedElevationClicks }}</td>
      </tr>
      <tr>
        <td>Seite</td>
        <td>{{ formattedWindageClicks }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  name: "BallisticsCalculator",
  data() {
    return {
      distance: 100,
      windSpeed: 0,
      windClock: 0,
      airPressure: 950,
      temperature: 25,

      resultElevationClicks: 0,
      resultWindageClicks: 0,
    }
  },
  computed: {
    formattedElevationClicks() {
      return (this.resultElevationClicks <= 0 ? "" : "+") + this.resultElevationClicks;
    },
    formattedWindageClicks() {
      let word = "";
      if (this.resultWindageClicks < 0) {
        word = "negativ ";
      } else if (this.resultWindageClicks > 0) {
        word = "positiv ";
      }
      return word + Math.abs(this.resultWindageClicks);
    }
  },
}
</script>

<style scoped>

</style>