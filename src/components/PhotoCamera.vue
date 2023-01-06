<template>
  <div id="wrapper">
    <div id="video-wrapper">
      <video autoplay></video>
    </div>
    <div id="controls">
      <div class="btn-group-vertical" role="group">
        <button type="button" class="btn btn-primary" aria-label="Switch camera">
          <font-awesome-icon icon="fa-solid fa-camera-rotate"/>
        </button>
      </div>
    </div>
    <button class="btn btn-light" id="shutter" @click="takePicture()">
      <font-awesome-icon icon="fa-solid fa-camera" size="2xl"/>
    </button>
  </div>
</template>

<script>
export default {
  name: "PhotoCamera",
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
              .then(mediaStream => {
                return document.querySelector("video").srcObject = mediaStream;
              });
        } else {
          alert("No camera access");
        }
      });
    },
    takePicture() {
      //todo get picture data and emit event
    }
  },
  mounted() {
    this.setupVideoFeed();
  },
}
</script>

<style scoped>
#controls {
  position: absolute;
  right: 2rem;
  bottom: 2rem;
}

#wrapper {
  position: relative;
  background-color: black;
  width: 100%;
  height: 100%;
}

#video-wrapper {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;
}

video {
  object-fit: cover;
}

#video-wrapper::before,
#video-wrapper::after,
#wrapper::after {
  position: absolute;
  content: '';
  z-index: 10;
}

#video-wrapper::before {
  border-bottom: solid 1px red;
  width: 100%;
  height: 1px;
}

#video-wrapper::after {
  border-left: solid 1px red;
  height: 100%;
  width: 1px;
}

#wrapper::after {
  top: calc(50% - 2.5rem);
  left: calc(50% - 2.5rem);
  border: solid 1px red;
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
}

#shutter {
  position: absolute;
  bottom: 2rem;
  left: calc(50% - 2.5rem);
  width: 5rem;
  height: 5rem;
  z-index: 100;
  border-radius: 50%;
}
</style>