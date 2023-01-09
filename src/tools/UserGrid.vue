<template>
  <table class="table table-striped">
    <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Grösse</th>
      <th scope="col"></th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="gridDef in allUserGrids" :key="gridDef.id">
      <th scope="row">{{ gridDef.name }}</th>
      <td>{{ gridDef.numCols }}&times;{{ gridDef.numRows }}</td>
      <td>TODO buttons</td>
    </tr>
    </tbody>
  </table>
</template>

<script>
import {allUserGrids} from "@/user_grid";

export default {
  name: "UserGrid",
  data() {
    return {
      allUserGrids: allUserGrids,
    }
  },
}
</script>

<style scoped>

</style>