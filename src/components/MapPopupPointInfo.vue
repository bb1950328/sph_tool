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
    <!-- TODO show point in other coordinate systems here-->
  </table>
</template>

<script lang="ts">
import {formatCoordinatesLV03, formatCoordinatesWGS84Decimal, LV03coordinates, LV03toWGS84} from "@/util";

export default {
  name: "MapPopupPointInfo",
  methods: {LV03toWGS84, formatCoordinatesWGS84Decimal, formatCoordinatesLV03: formatCoordinatesLV03},
  props: {
    title: String,
    coordinates: {
      type: Object as () => LV03coordinates,
    },
  }
}
</script>

<style scoped>

</style>