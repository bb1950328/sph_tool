<template>
  <video autoplay></video>
</template>

<script>
export default {
  name: "CameraGonio",
  data() {
    return {
      cameraNumber: 0,
      cameraCount: 0,
      cameraIds: [],
    };
  },
  setup() {

  },
  methods: {
    setupVideoFeed() {
      console.log(this.cameraIds);
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        this.cameraCount = videoDevices.length;
        this.cameraIds = videoDevices.map(camera => camera.deviceId);
        console.log(`found ${videoDevices.length} cameras.`);

        if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices && this.cameraCount > 0) {
          const constraints = {
            video: true,
            deviceId: {
              exact: this.cameraIds[this.cameraNumber],
            },
          };
          navigator.mediaDevices.getUserMedia(constraints)
              .then(device => document.querySelector("video").srcObject = device);
        } else {
          alert("No camera access");
        }
      });
    },
  },
  mounted() {
    this.setupVideoFeed();
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