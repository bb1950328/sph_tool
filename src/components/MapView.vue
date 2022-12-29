<template>
  <div ref="map_root" id="map-root"></div>
</template>

<script>
import View from 'ol/View'
import Map from 'ol/Map'
//import TileLayer from 'ol/layer/Tile'
//import OSM from 'ol/source/OSM'
// import VectorLayer from "ol/layer/Vector";
//import VectorTileLayer from "ol/layer/VectorTile";
//import {VectorTile} from "ol/source";

//import {MVT} from "ol/format";
import {apply} from 'ol-mapbox-style';
//import {createXYZ} from "ol/tilegrid";

//const XYZ_URL = "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg";
const JSON_STYLE_URL ="https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte.vt/style.json";
export default {
  name: "MapView",
  components: {},
  props: {},

  async mounted() {
    /*let vectorLayer = new VectorTileLayer({
      declutter: true,
      source: new VectorTile({
        format: new MVT(),
        url: "https://vectortiles.geo.admin.ch/tiles/ch.swisstopo.leichte-basiskarte.vt/v2.0.0/{z}/{x}/{y}.pbf",
        projection: "EPSG:4326",
        tileGrid: createXYZ({
          extent: [5.013926957923385, 11.477436312994008, 45.35600133779394, 48.27502358353741],
          tileSize: 256,
        }),
      }),
    });*/
    /*applyStyle(vectorLayer, JSON_STYLE_URL);*/
    const map = new Map({
      target: this.$refs.map_root,
      layers: [
        /*new TileLayer({
          source: new OSM()
        }),*/
        /*vectorLayer,*/
      ],
      view: new View({
        zoom: 12,
        center: [9, 47],
        constrainResolution: true,
        projection: "EPSG:3857",
        showFullExtent: true,
        maxZoom: 17,
        maxResolution: 40075016.68557849 / 512,
      }),
    });
    await apply(map, JSON_STYLE_URL);
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