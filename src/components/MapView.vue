<template>
  <div ref="map_root" id="map-root"></div>
</template>

<script>
import View from 'ol/View'
import Map from 'ol/Map'
//import TileLayer from 'ol/layer/Tile'
//import OSM from 'ol/source/OSM'
// import VectorLayer from "ol/layer/Vector";
import VectorTileLayer from "ol/layer/VectorTile";
import {VectorTile} from "ol/source";

import {MVT} from "ol/format";
import {applyStyle, apply} from 'ol-mapbox-style';
//import {createXYZ} from "ol/tilegrid";

//const XYZ_URL = "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg";
const VECTOR_STYLE_URL ="https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte.vt/style.json";
const VECTOR_TILE_URL = "https://vectortiles.geo.admin.ch/tiles/ch.swisstopo.leichte-basiskarte.vt/v2.0.0/{z}/{x}/{y}.pbf";
export default {
  name: "MapView",
  components: {},
  props: {},

  async mounted() {
    let vectorLayer = new VectorTileLayer({
      declutter: true,
      source: new VectorTile({
        format: new MVT(),
        url: VECTOR_TILE_URL,
        projection: "EPSG:3857",
      }),
    });
    await applyStyle(vectorLayer, VECTOR_STYLE_URL);
    const map = new Map({
      target: this.$refs.map_root,
      layers: [
        /*new TileLayer({
          source: new OSM()
        }),*/
        vectorLayer,
      ],
      view: new View({
        zoom: 8,
        center: [9, 47],
        constrainResolution: true,
        projection: "EPSG:3857",
        showFullExtent: true,
        maxZoom: 17,
        maxResolution: 40075016.68557849 / 512,
      }),
    });
    await apply(map, VECTOR_STYLE_URL);
    console.log(map);
  },
}
</script>

<style scoped>
#map-root {
  width: 100%;
  height: calc(100vh - 4.5rem);
}
</style>