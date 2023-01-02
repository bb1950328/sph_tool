<template>
  <div ref="map_root" id="map-root"></div>
  <div id="map-controls">
    <div class="btn-group-vertical" role="group">
      <div class="btn-group dropstart" role="group">
        <button id="map-type-drop" type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown"
                aria-expanded="false">
          <font-awesome-icon icon="fa-solid fa-layer-group"/>
        </button>
        <ul class="dropdown-menu" aria-labelledby="map-type-drop">
          <li v-for="row in mapLayerNames" :key="row.id">
            <button class="dropdown-item" @click="setActiveMapLayer(row.id)"
                    :class="{'active': activeMapLayer===row.id}">
              {{ row.displayName }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import View from 'ol/View'
import Map from 'ol/Map'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import VectorTileLayer from "ol/layer/VectorTile";
import {Vector, VectorTile, XYZ} from "ol/source";

import {MVT} from "ol/format";
import {apply, applyStyle} from 'ol-mapbox-style';
import {transform as proj_transform} from "ol/proj";
import {defaults as control_defaults} from "ol/control";
import LayerGroup from "ol/layer/Group";
import {Tile} from "ol/layer";
import {Vector as layer_Vector} from "ol/layer";
import {Feature} from "ol";
import {Point} from "ol/geom";
import {Circle, Fill, Stroke, Style} from "ol/style";
import {Text as style_Text} from "ol/style"
import {watch} from "vue";
import {allPoints} from "@/points_list";
import {LV03toWGS84} from "@/util";

const PIXEL_URL = "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg";
const SATELLITE_URL = "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg"
const VECTOR_STYLE_URL = "https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte.vt/style.json";
const VECTOR_TILE_URL = "https://vectortiles.geo.admin.ch/tiles/ch.swisstopo.leichte-basiskarte.vt/v2.0.0/{z}/{x}/{y}.pbf";


export default {
  name: "MapView",
  components: {},
  props: {},

  data() {
    let activeMapLayer = "pixel";
    return {
      mapLayers: {},
      activeMapLayer: activeMapLayer,
      map: null,
      mapLayerNames: [
        {"id": "osm", "displayName": "OpenStreetMap"},
        {"id": "pixel", "displayName": "SwissTopo Pixel"},
        {"id": "vector", "displayName": "SwissTopo Vektor"},
        {"id": "satellite", "displayName": "SwissTopo Satellit"},
      ],
    };
  },
  async mounted() {
    let vectorTileLayer = new VectorTileLayer({
      declutter: true,
      source: new VectorTile({
        format: new MVT(),
        url: VECTOR_TILE_URL,
        projection: "EPSG:3857",
      }),
      style: VECTOR_STYLE_URL,
    });
    await applyStyle(vectorTileLayer, VECTOR_STYLE_URL);
    this.mapLayers.vector = new LayerGroup({
      layers: [vectorTileLayer]
    });
    await apply(this.mapLayers.vector, VECTOR_STYLE_URL);

    this.mapLayers.osm = new TileLayer({
      source: new OSM(),
    });

    this.mapLayers.pixel = new TileLayer({
      source: new XYZ({
        url: PIXEL_URL,
      }),
    });

    this.mapLayers.satellite = new LayerGroup({
      layers: [
        new Tile({
          source: new XYZ({
            url: SATELLITE_URL,
          }),
        }),
        //todo add street and city names from somewhere
      ],
    });

    let vectorSource = new Vector({
      features: [],
    });
    const updatePoints = () => {
      vectorSource.clear();
      Object.keys(allPoints).map(id => allPoints[id]).forEach(pt => {
        const [wLat, wLon, _] = LV03toWGS84(pt.coordinates.x, pt.coordinates.y, pt.coordinates.z);
        vectorSource.addFeature(new Feature({
          name: pt.description,
          geometry: new Point(proj_transform([wLon, wLat], "EPSG:4326", "EPSG:3857")),
        }));
      });
    };
    updatePoints();
    watch(allPoints, updatePoints);

    const styleFunc = (feature) => [
      new Style({
        image: new Circle({
          radius: 10,
          fill: new Fill({
            color: "#ff8400",
          }),
        }),
        text: new style_Text({
          font: '1.5rem Avenir,sans-serif',
          fill: new Fill({
            color: '#ff8400'
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 4
          }),
          offsetY: -18,
          text: feature.get("name"),
        }),
      }),
    ];

    let featuresLayer = new layer_Vector({
      source: vectorSource,
      style: styleFunc,
    });
    featuresLayer.setZIndex(100);
    this.map = new Map({
      target: this.$refs.map_root,
      layers: [
        this.mapLayers[this.activeMapLayer],
        featuresLayer,
      ],
      view: new View({
        zoom: 12,
        center: proj_transform([9, 47], 'EPSG:4326', 'EPSG:3857'),
        constrainResolution: true,
        projection: "EPSG:3857",
        showFullExtent: true,
        maxZoom: 18,
        maxResolution: 40075016.68557849 / 512,
      }),
      controls: control_defaults({
        attribution: false,
        zoom: false,
        rotate: false,
      }),
    });

    navigator.geolocation.getCurrentPosition(position => {
          let posLonLat = [position.coords.longitude, position.coords.latitude];
          this.map.getView().setCenter(proj_transform(posLonLat, 'EPSG:4326', 'EPSG:3857'));
          console.log("got initial map center from GPS ", posLonLat);
        },
        err => {
          console.log("didn't get GPS position: ", err);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 100_000,
        }
    );
  },
  methods: {
    setActiveMapLayer(newMapLayer) {
      this.map.removeLayer(this.mapLayers[this.activeMapLayer]);
      this.map.addLayer(this.mapLayers[newMapLayer]);
      this.activeMapLayer = newMapLayer;
    }
  }
}
</script>

<style scoped>
#map-root {
  width: 100%;
  height: 100vh;
}
#map-controls {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}
</style>