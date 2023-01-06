<template>
  <div class="row">
    <label for="barrelGroup" class="form-label">Bildquelle</label>
    <div class="btn-group" role="group" aria-label="Bildquelle" id="image-source">
      <input type="radio" class="btn-check" name="barrel-radio" id="image-source-webcam" autocomplete="off"
             v-model="imageSourceType" v-bind:value="ImageSourceType.WEBCAM">
      <label class="btn btn-outline-primary" for="image-source-webcam">Webcam</label>

      <input type="radio" class="btn-check" name="barrel-radio" id="image-source-file-import" autocomplete="off"
             v-model="imageSourceType" v-bind:value="ImageSourceType.FILE_IMPORT">
      <label class="btn btn-outline-primary" for="image-source-file-import">Dateiimport</label>
    </div>
  </div>
  <h1>1</h1>
  <h1>1</h1>
  <h1>1</h1>
  <h1>1</h1>
  <h1>1</h1>
  <h1>1</h1>
  <div style="width: 40rem;height: 60rem;margin-left: 2rem">
    <PhotoCamera v-if="imageSourceType===ImageSourceType.WEBCAM"/>
  </div>
  <h1>2</h1>
  <h1>2</h1>
  <h1>2</h1>
</template>

<script>
import PhotoCamera from "@/components/PhotoCamera.vue";

const ImageSourceType = Object.freeze({
  WEBCAM: "WEBCAM",
  FILE_IMPORT: "FILE_IMPORT",
});
export default {
  name: "CameraGonio",
  components: {PhotoCamera},
  data() {
    return {
      cameraNumber: 0,
      cameraCount: 0,
      cameraIds: [],
      imageSourceType: ImageSourceType.WEBCAM,

      ImageSourceType: ImageSourceType,
    };
  },
  setup() {

  },
  methods: {},
  mounted() {
  },
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
</style>