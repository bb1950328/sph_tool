<template>
  <select @change="changeTool($event.target.value)" class="form-select" id="nav-select">
    <option v-for="to in allTools" :key="to[0]" :value="to[0]">{{ to[1] }}</option>
  </select>
  <KeepAlive>
    <component :is="currentTool"></component>
  </KeepAlive>
</template>

<script>
import PointList from "@/components/PointList";
import CoordinateCalculations from "@/components/CoordinateCalculations";


export default {
  name: 'App',
  components: {
    PointList,
    CoordinateCalculations,
  },
  data() {
    return {
      currentTool: "PointList",
      allTools: [["PointList", "Punkteliste"], ["CoordinateCalculations", "Koordinatenberechnungen"]],
    }
  },
  methods: {
    changeTool(newTool) {
      this.currentTool = newTool;
    },
  },
}
</script>

<style>
/*noinspection CssUnusedSymbol*/
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*background-color: black;*/
  min-height: 100vh;
  padding: 0.5rem;
}

#nav-select {
  margin-bottom: 1rem;
}
</style>
