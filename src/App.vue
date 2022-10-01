<template>
  <PointList/>
</template>

<script>
import PointList from "@/components/PointList";

export default {
  name: 'App',
  components: {
    PointList
  }
}
</script>

<style>
/*noinspection CssUnusedSymbol*/
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: black;
  min-height: 100vh;
}
</style>
