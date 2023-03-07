<template>
  <div class="modal" tabindex="-1" role="dialog" id="pointEditModal">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Klicktabelle generieren</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
            <span aria-hidden="true" hidden>&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form>
            <h5>Distanz</h5>
            <div class="mb-3 row">
              <div class="col-4">
                <label for="input-distance-min" class="form-label">von</label>
                <input type="number" class="form-control" id="input-distance-min"
                       v-model="distanceMin" min="100" max="1200"/>
              </div>
              <div class="col-4">
                <label for="input-distance-min" class="form-label">inkrement</label>
                <input type="number" class="form-control" id="input-distance-step"
                       v-model="distanceStep" min="1" max="1200"/>
              </div>
              <div class="col-4">
                <label for="input-distance-min" class="form-label">bis</label>
                <input type="number" class="form-control" id="input-distance-max"
                       v-model="distanceMax" min="100" max="1200"/>
              </div>
            </div>
            <h5>Umwelt</h5>
            <div class="mb-3 row">
              <div class="col-6">
                <label for="input-air-pressure" class="form-label">Luftdruck</label>
                <input type="number" class="form-control" id="input-air-pressure"
                       v-model="airPressure">
              </div>
              <div class="col-6">
                <label for="input-temperature" class="form-label">Temperatur</label>
                <input type="number" class="form-control" id="input-temperature"
                       v-model="temperature">
              </div>

            </div>
          </form>
          <table class="table table-striped">
            <thead>
            <tr>
              <th>Distanz</th>
              <th>Höhe</th>
              <th>Seite</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="row in tableData" :key="`row${row}`">
              <td>{{ row.distance }}</td>
              <td>{{ row.elevation }}</td>
              <td :class="row.windageClass">{{ row.windage }}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="closeModal()">Schliessen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {Modal} from "bootstrap";
import {
  BallisticSituation,
  formatElevationClicks,
  formatWindageClicks,
  windageCssClass
} from "@/ballistic_calculations";

export default {
  name: "ClickTable",
  data() {
    return {
      modal: null,
      distanceMin: 100,
      distanceMax: 1200,
      distanceStep: 50,
      tableData: [],
      airPressure: 950,
      temperature: 25,
    }
  },
  methods: {
    openModal() {
      this.modal = new Modal(document.getElementById("pointEditModal"));
      this.modal.show();
    },
    closeModal() {
      this.modal.hide();
      this.modal = null;
    },
    updateTable() {
      this.tableData = [];
      if (this.distanceStep === 0
          || (this.distanceMin < this.distanceMax && this.distanceStep < 0)
          || (this.distanceMin > this.distanceMax && this.distanceStep > 0)) {
        return;
      }

      const situation = new BallisticSituation();
      situation.airPressure = this.airPressure;
      situation.temperature = this.temperature;

      for (let d = this.distanceMin; d <= this.distanceMax; d += this.distanceStep) {
        situation.distance = d;
        this.tableData.push({
          distance: `${d}m`,
          elevation: formatElevationClicks(situation.totalElevation),
          windage: formatWindageClicks(situation.totalWindage),
          windageClass: windageCssClass(situation.totalWindage),
        });
      }
    },
  },
  computed: {
    allInputs() {
      return [
        this.distanceMin,
        this.distanceStep,
        this.distanceMax,
        this.airPressure,
        this.temperature,
      ];
    }
  },
  watch: {
    allInputs() {
      this.updateTable();
    },
  },
  mounted() {
    this.updateTable();
  }
}
</script>

<style scoped>
table, th, td {
  border: black solid 1px;
}

table {
  border-collapse: collapse;
}
</style>