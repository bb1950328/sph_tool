<template>
  <h4>{{ title }}</h4>
  <table>
    <tr>
      <th scope="row">LV03:</th>
      <td>{{ formatCoordinatesLV03(coordinates) }}</td>
    </tr>
    <tr>
      <th scope="row">WGS84:</th>
      <td>{{ formatCoordinatesWGS84Decimal(LV03toWGS84(coordinates)) }}</td>
    </tr>
    <tr v-for="arr in userGridIdentifiers" :key="arr[0]">
      <th scope="row">{{ arr[1] }}</th>
      <td>{{ arr[2] }}</td>
    </tr>
    <!-- TODO show point in other coordinate systems here-->
  </table>
</template>

<script lang="ts">
import {formatCoordinatesLV03, formatCoordinatesWGS84Decimal, LV03coordinates, LV03toWGS84} from "@/util";
import {allUserGrids} from "@/user_grid";

export default {
  name: "MapPopupPointInfo",
  methods: {
    LV03toWGS84,
    formatCoordinatesWGS84Decimal,
    formatCoordinatesLV03,
  },
  props: {
    title: String,
    coordinates: {
      type: Object as () => LV03coordinates,
    },
  },
  computed: {
    userGridIdentifiers() {
      const result: [number, string, string][] = [];
      allUserGrids.forEach(grid => {
        const idx = grid.coordsToIndex(this.coordinates);
        if (idx != null) {
          result.push([grid.id, grid.name, grid.indexToIdentifier(idx)]);
        }
      });
      return result;
    }
  }
}
</script>

<style scoped>

</style>