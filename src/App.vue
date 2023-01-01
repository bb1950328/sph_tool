<template>
  <select @change="changeTool($event.target.value)" class="form-select" id="nav-select" v-model="currentTool">
    <option v-for="to in allTools" :key="to[0]" :value="to[0]">{{ to[1] }}</option>
  </select>
  <KeepAlive>
    <component :is="currentTool" :key="currentTool"></component>
  </KeepAlive>
</template>

<script>
import PointList from "@/components/PointList";
import CoordinateCalculations from "@/components/CoordinateCalculations";
import BallisticsCalculator from "@/components/BallisticsCalculator";
import MapView from "@/components/MapView.vue";

export default {
  name: 'App',
  components: {
    PointList,
    CoordinateCalculations,
    BallisticsCalculator,
    MapView,
  },
  data() {
    let currentTool = "PointList";
    let allTools = [
      ["PointList", "Punkteliste"],
      ["CoordinateCalculations", "Koordinatenberechnungen"],
      ["BallisticsCalculator", "Ballistikrechner"],
      ["MapView", "Karte"],
    ];
    if (window.location.hash) {
      for (let i = 0; i < allTools.length; i++) {
        let fragment = window.location.hash.slice(1);
        if (allTools[i][0] === fragment) {
          currentTool = fragment;
          break;
        }
      }
    }
    return {
      currentTool: currentTool,
      allTools: allTools,
    }
  },
  mounted() {
    this.updateDocumentTitle(this.currentTool);
  },
  methods: {
    updateDocumentTitle(newTool) {
      document.title = "sph_tool - " + this.getToolDisplayName(newTool);
    },
    changeTool(newTool) {
      this.currentTool = newTool;
      if (history.pushState) {
        history.pushState(null, null, "#" + newTool);
      } else {
        location.hash = "#" + newTool;
      }
      this.updateDocumentTitle(newTool);
    },
    getToolDisplayName(toolInternalName) {
      for (let i = 0; i < this.allTools.length; i++) {
        if (toolInternalName === this.allTools[i][0]) {
          return this.allTools[i][1];
        }
      }
      return null;
    }
  },
}
</script>

<style>
/*noinspection CssUnusedSymbol*/
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 0.5rem;
  min-height: 100vh;
}

#nav-select {
  margin-bottom: 1rem;
}
</style>
