<template>
  <div class="p-2">
    <div class="row me-5">
      <!--      <div class="mb-3 col-6">
              <label for="image-source" class="form-label col-4">Bildquelle</label>
              <div class="btn-group" role="group" aria-label="Bildquelle" id="image-source">
                <input type="radio" class="btn-check" name="image-source-radio" id="image-source-webcam" autocomplete="off"
                       v-model="imageSourceType" v-bind:value="ImageSourceType.WEBCAM">
                <label class="btn btn-outline-primary" for="image-source-webcam">Webcam</label>

                <input type="radio" class="btn-check" name="image-source-radio" id="image-source-file-import"
                       autocomplete="off"
                       v-model="imageSourceType" v-bind:value="ImageSourceType.FILE_IMPORT">
                <label class="btn btn-outline-primary" for="image-source-file-import">Dateiimport/Kamera-App</label>
              </div>
            </div>-->
      <div class="mb-3 col-6" v-show="imageSourceType===ImageSourceType.FILE_IMPORT">
        <input type="file" accept="image/*" class="form-control" ref="file_input" @change="newFileUploaded">
      </div>
      <div class="mb-3 col-6" v-show="imageSourceType===ImageSourceType.WEBCAM">
        <button type="button" class="btn btn-secondary">
          Webcam öffnen
        </button>
      </div>
    </div>
    <div class="row me-5 mb-3">
      <div class="col-3">
        <label for="direction-source" class="form-label">Datenquelle eigener Standort</label>
        <div class="btn-group" role="group" id="direction-source">
          <input type="radio" class="btn-check" name="direction-source-radio" id="direction-source-sensors"
                 autocomplete="off"
                 v-model="ownLocationType" v-bind:value="OwnLocationType.EXIF_GPS">
          <label class="btn btn-outline-primary" for="direction-source-sensors">GPS</label>
          <input type="radio" class="btn-check" name="direction-source-radio" id="direction-source-map"
                 autocomplete="off"
                 v-model="ownLocationType" v-bind:value="OwnLocationType.POINT">
          <label class="btn btn-outline-primary" for="direction-source-map">Gespeicherter Punkt</label>
        </div>
      </div>
      <div v-show="ownLocationType===OwnLocationType.POINT" class="col-3">
        <!-- TODO create proper point chooser -->
        <label class="form-label" for="own-location-point-nr">Punkt-Nr</label>
        <input class="form-control" type="number" id="own-location-point-nr" v-model="ownLocationPointNr">
      </div>
      <div class="col align-self-end">
        <h4 v-if="ownLocationLV03!=null">
          Koordinaten: {{ formatCoordinatesLV03(ownLocationLV03) }}
        </h4>
      </div>
    </div>
    <div class="row">
      <img ref="image" id="image">
    </div>
    <!--    <div style="width: 40rem;height: 60rem;margin-left: 2rem">
          <PhotoCamera v-show="imageSourceType===ImageSourceType.WEBCAM"/>
        </div>-->
  </div>
</template>

<script>
import EXIF from "exif-js";
import {formatCoordinatesLV03, WGS84toLV03} from "@/util";
import {allPoints} from "@/points_list";

const ImageSourceType = Object.freeze({
  WEBCAM: "WEBCAM",
  FILE_IMPORT: "FILE_IMPORT",
});
const OwnLocationType = Object.freeze({
  EXIF_GPS: "EXIF_GPS",
  POINT: "POINT",
});
export default {
  name: "CameraGonio",
  components: {/*PhotoCamera*/},
  data() {
    return {
      currentImageFile: null,
      currentImageFileExif: null,
      currentImageFileLocation: null,

      ownLocationPointNr: 0,

      imageSourceType: ImageSourceType.FILE_IMPORT,
      ownLocationType: OwnLocationType.EXIF_GPS,

      ImageSourceType,
      OwnLocationType,
    };
  },
  setup() {

  },
  methods: {
    formatCoordinatesLV03,
    newFileUploaded(evt) {
      this.currentImageFile = this.$refs.file_input.files[0];
      const outerThis = this;
      EXIF.getData(this.currentImageFile, function () {
        outerThis.currentImageFileExif = EXIF.getAllTags(this);
      });
      this.$refs.image.src = URL.createObjectURL(this.currentImageFile);
    },
  },
  mounted() {
  },
  computed: {
    currentImageFileCoordinatesLV03() {
      if (this.currentImageFileExif == null) {
        return null;
      }
      let wgs84 = {
        latitude: 0,
        longitude: 0,
        height: 0,
      };
      if (Object.hasOwn(this.currentImageFileExif, "GPSLatitude")) {
        const [deg, min, sec] = this.currentImageFileExif["GPSLatitude"];
        wgs84.latitude = deg + min / 60 + sec / 3600;
        if (this.currentImageFileExif["GPSLatitudeRef"] !== "N") {
          wgs84.latitude *= -1;
        }
      }
      if (Object.hasOwn(this.currentImageFileExif, "GPSLongitude")) {
        const [deg, min, sec] = this.currentImageFileExif["GPSLongitude"];
        wgs84.longitude = deg + min / 60 + sec / 3600;
        if (this.currentImageFileExif["GPSLongitudeRef"] !== "E") {
          wgs84.longitude *= -1;
        }
      }
      if (Object.hasOwn(this.currentImageFileExif, "GPSAltitude")) {
        wgs84.height = this.currentImageFileExif["GPSAltitude"];
      }
      return WGS84toLV03(wgs84);
    },
    ownLocationLV03() {
      if (this.ownLocationType === OwnLocationType.EXIF_GPS) {
        return this.currentImageFileCoordinatesLV03;
      } else if (this.ownLocationType === OwnLocationType.POINT) {
        return Object.hasOwn(allPoints, this.ownLocationPointNr) ? allPoints[this.ownLocationPointNr].coordinates : null;
      } else {
        return null;
      }
    }
  }
}
</script>

<style scoped>
video {
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
}

</style>
<style>
body {
  min-height: 100vh;
}

.form-label[for="direction-source"] {
  display: block;
}

#image {
  width: 100%;
}
</style>