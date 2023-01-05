<template>
  <div ref="map_root" id="map-root"></div>
  <div id="popup-root" class="ol-popup" :class="{'shown': overlayShowing}" ref="popupContainer">
    <a id="popup-closer" class="ol-popup-closer" @click="overlayShowing=false">
      <font-awesome-icon icon="fa-solid fa-xmark"/>
    </a>
    <div class="popup-content" ref="popupContentPoint">
      <MapPopupPointInfo :coordinates="currentOverlayPoint.coordinates"
                         :title="currentOverlayPoint?.description"
                         v-if="currentOverlayPoint!=null"/>
      <MapPopupPointInfo :coordinates="temporaryPointCoordinates"
                         title="Temporärer Punkt"
                         v-if="temporaryPointCoordinates!=null"/>
      <div class="btn-group btn-group-sm" role="group">
        <button v-if="currentOverlayPoint!=null" class="btn btn-primary">
          <!-- TODO click handler that opens edit window-->
          <font-awesome-icon icon="fa-solid fa-pen"/>
        </button>
        <button v-if="currentOverlayPoint!=null" class="btn btn-danger"
                @click="deletePoint(currentOverlayPointId); currentOverlayPointId=null">
          <font-awesome-icon icon="fa-solid fa-trash-can"/>
        </button>

        <button v-if="temporaryPointCoordinates!=null" class="btn btn-primary">
          <!-- TODO click handler that opens create window-->
          <font-awesome-icon icon="fa-solid fa-floppy-disk"/>
        </button>

        <div class="btn-group" role="group">
          <button id="openInDropdown" type="button" class="btn btn-secondary dropdown-toggle"
                  data-bs-toggle="dropdown" aria-expanded="false">
            Öffnen in
          </button>
          <ul class="dropdown-menu" aria-labelledby="openInDropdown" v-if="currentPopupPointCoordinates!=null">
            <li>
              <a class="dropdown-item" target="_blank"
                 :href="createSwissTopoLink(currentPopupPointCoordinates, currentMapZoom)">
                SwissTopo
              </a>
            </li>
            <li>
              <a class="dropdown-item" target="_blank"
                 :href="createGoogleMapsLink(LV03toWGS84(currentPopupPointCoordinates), currentMapZoom)">
                Google Maps
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
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
import {Tile, Vector as layer_Vector} from "ol/layer";
import {Feature, Overlay} from "ol";
import {Point} from "ol/geom";
import {Circle, Fill, Stroke, Style, Text as style_Text} from "ol/style";
import {watch} from "vue";
import {allPoints} from "@/points_list";
import {
  createGoogleMapsLink,
  createSwissTopoLink,
  formatCoordinatesLV03,
  getHeightFromSwissTopo,
  LV03toWGS84,
  WGS84toLV03,
} from "@/util";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import MapPopupPointInfo from "@/components/MapPopupPointInfo.vue";

const PIXEL_URL = "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg";
const SATELLITE_URL = "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg"
const VECTOR_STYLE_URL = "https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte.vt/style.json";
const VECTOR_TILE_URL = "https://vectortiles.geo.admin.ch/tiles/ch.swisstopo.leichte-basiskarte.vt/v2.0.0/{z}/{x}/{y}.pbf";

const FEATURE_TYPE_POINT = "POINT";

const OVERLAY_TYPE_POINT = "POINT";
const OVERLAY_TYPE_TEMPORARY = "TEMPORARY";

const featureStyleFunc = (feature) => [
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

export default {
  name: "MapView",
  components: {MapPopupPointInfo, FontAwesomeIcon},
  props: {},

  data() {
    let activeMapLayer = "pixel";
    return {
      mapLayers: {},
      activeMapLayer: activeMapLayer,
      overlay: null,
      currentOverlayPointId: null,
      temporaryPointCoordinates: null,
      map: null,
      currentMapZoom: 12,
      mapLayerNames: [
        {"id": "osm", "displayName": "OpenStreetMap"},
        {"id": "pixel", "displayName": "SwissTopo Pixel"},
        {"id": "vector", "displayName": "SwissTopo Vektor"},
        {"id": "satellite", "displayName": "SwissTopo Satellit"},
      ],

      OVERLAY_TYPE_POINT,
      OVERLAY_TYPE_TEMPORARY,
    };
  },
  mounted: async function () {
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
      Object.keys(allPoints).forEach(id => {
        const pt = allPoints[id];
        const wgs84pt = LV03toWGS84(pt.coordinates);
        vectorSource.addFeature(new Feature({
          name: pt.description,
          geometry: new Point(proj_transform([wgs84pt.longitude, wgs84pt.latitude], "EPSG:4326", "EPSG:3857")),
          type: FEATURE_TYPE_POINT,
          pointId: id,
        }));
      });
    };
    updatePoints();
    watch(allPoints, updatePoints);

    let featuresLayer = new layer_Vector({
      source: vectorSource,
      style: featureStyleFunc,
    });
    featuresLayer.setZIndex(100);
    this.overlay = new Overlay({
      element: this.$refs.popupContainer,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });
    this.map = new Map({
      target: this.$refs.map_root,
      layers: [
        this.mapLayers[this.activeMapLayer],
        featuresLayer,
      ],
      view: new View({
        zoom: this.currentMapZoom,
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
      overlays: [
        this.overlay,
      ],
    });

    this.map.on('moveend', () => {
      this.currentMapZoom = this.map.getView().getZoom();
    });

    this.map.on("singleclick", this.handleSingleClickOnMap);

    navigator.geolocation.getCurrentPosition(position => {
          let posLonLat = [position.coords.longitude, position.coords.latitude];
          this.map.getView().setCenter(proj_transform(posLonLat, 'EPSG:4326', 'EPSG:3857'));
          console.info("got initial map center from GPS ", posLonLat);
        },
        err => {
          console.info("didn't get GPS position: ", err);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 100_000,
        }
    );
  },
  methods: {
    LV03toWGS84,
    createGoogleMapsLink,
    createSwissTopoLink,
    formatCoordinates: formatCoordinatesLV03,
    setActiveMapLayer(newMapLayer) {
      this.map.removeLayer(this.mapLayers[this.activeMapLayer]);
      this.map.addLayer(this.mapLayers[newMapLayer]);
      this.activeMapLayer = newMapLayer;
    },
    LV03toEPSG3857(lv03coord) {
      const wgs84 = LV03toWGS84(lv03coord);
      return proj_transform([wgs84.longitude, wgs84.latitude], "EPSG:4326", 'EPSG:3857');
    },
    EPSG3857toLV03(epsgCoord) {
      const wgs84 = proj_transform(epsgCoord, 'EPSG:3857', "EPSG:4326");
      return WGS84toLV03({
        latitude: wgs84[1],
        longitude: wgs84[0],
        height: 0,
      });
    },
    handleSingleClickOnMap(evt) {
      const coordinate = evt.coordinate;
      // noinspection JSUnusedLocalSymbols
      const hitPoint = this.map.forEachFeatureAtPixel(evt.pixel, (feature, source) => {
        if (feature.get("type") === FEATURE_TYPE_POINT) {
          this.currentOverlayPointId = feature.get("pointId");
          return true;
        }
      });
      if (hitPoint) {
        return;
      }

      this.temporaryPointCoordinates = this.EPSG3857toLV03(coordinate);
      getHeightFromSwissTopo(this.temporaryPointCoordinates.x,
          this.temporaryPointCoordinates.y,
          (height) => {
            this.temporaryPointCoordinates.z = height;
          },
          console.log,
      );
    },
    deletePoint(pointId) {
      delete allPoints[pointId];
    }
  },
  watch: {
    temporaryPointCoordinates: function (newValue) {
      if (newValue !== null) {
        this.currentOverlayPointId = null;
        this.overlay.setPosition(this.LV03toEPSG3857(newValue));
      }
    },
    currentOverlayPointId: function (newValue) {
      if (newValue != null) {
        this.temporaryPointCoordinates = null;
        this.overlay.setPosition(this.LV03toEPSG3857(allPoints[newValue].coordinates));
      }
    },
  },
  computed: {
    currentPopupPointCoordinates() {
      if (this.currentOverlayPoint != null) {
        return this.currentOverlayPoint.coordinates;
      }
      return this.temporaryPointCoordinates;
    },
    currentOverlayPoint() {
      return allPoints[this.currentOverlayPointId];
    },
    overlayShowing: {
      set(value) {
        if (!value) {
          this.currentOverlayPointId = null;
          this.temporaryPointCoordinates = null;
        }
      },
      get() {
        return this.currentOverlayPointId != null || this.temporaryPointCoordinates != null;
      }
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

.ol-popup {
  position: absolute;
  background-color: var(--bs-body-bg);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 10px;
  bottom: 12px;
  left: -50px;
  min-width: 280px;
  display: none;
}

.ol-popup.shown {
  display: initial;
}

.ol-popup:after, .ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}

.ol-popup:after {
  border-top-color: var(--bs-body-bg);
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}

.ol-popup:before {
  border-top-color: var(--bs-body-bg);
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}

.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 2px;
  right: 8px;
  color: var(--bs-danger-text);
}
</style>