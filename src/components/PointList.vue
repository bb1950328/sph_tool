<template>
  <button type="button" class="btn btn-primary" @click="newPoint()">
    <font-awesome-icon icon="fa-solid fa-plus"/>
    Neuer Punkt
  </button>
  <table class="table table-striped table-bordered table-dark table-sm">
    <thead>
    <tr>
      <th scope="col">Nr</th>
      <th scope="col">Bezeichnung</th>
      <th scope="col">Koordinaten</th>
      <th scope="col"></th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="(pt, nr) in points" :key="nr">
      <th scope="row">{{ nr }}</th>
      <td>{{ pt.description }}</td>
      <td>{{ formatCoordinates(pt.coordinates) }}</td>
      <td>
        <button type="button" class="btn btn-secondary btn-sm">
          <font-awesome-icon icon="fa-solid fa-pen"/>
        </button>
        <button type="button" class="btn btn-danger btn-sm" @click="removePoint(nr)">
          <font-awesome-icon icon="fa-solid fa-trash-can"/>
        </button>
      </td>
    </tr>
    </tbody>
  </table>
</template>

<script>
import {formatCoordinates} from "@/util";

export default {
  name: "PointList",
  methods: {
    formatCoordinates: formatCoordinates,
    storePoints() {
      localStorage.setItem("points", JSON.stringify(this.points));
    },
    loadPoints() {
      let points = localStorage.getItem("points");
      if (points === null) {
        points = {
          1: {"description": "Kaserne Chur", "coordinates": {"x": 758603.97, "y": 190604.61, "z": 582.2}},
          2: {"description": "Halle 6", "coordinates": {"x": 757100.66, "y": 190421.80, "z": 565.1}},
          3: {"description": "Spl 342", "coordinates": {"x": 756828.17, "y": 191188.90, "z": 567.8}},
        }
      } else {
        points = JSON.parse(points);
      }
      return points;
    },
    newPoint() {
      this.points[this.findNextFreeNumber()] = {
        "description": "Neuer Punkt",
        "coordinates": {"x": 0, "y": 0, "z": 0}
      };
    },
    findNextFreeNumber() {
      let nextFree = 1;
      while (Object.hasOwn(this.points, nextFree.toString())) {
        ++nextFree;
      }
      return nextFree;
    },
    removePoint(nr) {
      delete this.points[nr];
    }
  },
  data() {
    return {
      points: this.loadPoints(),
    }
  },
  watch: {
    points: {
      deep: true,
      handler() {
        this.storePoints();
      }
    }
  }
}
</script>

<style scoped>

</style>