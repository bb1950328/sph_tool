<template>
  <div class="input-group">
    <input v-mask="'### ###'" class="form-control" placeholder="X" :value="mutableValue.x" @input="inputX" ref="inputX">
    <span class="input-group-text">/</span>
    <input v-mask="'### ###'" class="form-control" placeholder="Y" :value="mutableValue.y" @input="inputY" ref="inputY">
    <span v-if="withHeight" class="input-group-text">/</span>
    <input v-if="withHeight" v-mask="'####'" class="form-control" placeholder="H" :value="mutableValue.z"
           @input="inputZ" ref="inputZ">
    <button type="button" class="btn btn-outline-secondary" @click="openList">
      <font-awesome-icon icon="fa-solid fa-list"/>
    </button>
    <button type="button" class="btn btn-outline-secondary" @click="paste">
      <font-awesome-icon icon="fa-solid fa-paste"/>
    </button>
  </div>
</template>

<script lang="ts">
import {mask} from "vue-the-mask";
import {
  deepClone,
  extractCoordinatesFromString,
  LV03_X_MAX,
  LV03_X_MIN,
  LV03_Y_MAX,
  LV03_Y_MIN,
  LV03coordinates
} from "@/util";
import {PropType, reactive} from "vue";

export default {
  name: "PointInput",
  directives: {
    mask,
  },
  props: {
    withHeight: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Object as PropType<LV03coordinates>,
    },
  },
  emits: [
    "value-change",
  ],
  data() {
    const clone = this.value ? deepClone(this.value) : {x: 0, y: 0, z: 0};
    return {
      mutableValue: reactive(clone),
    };
  },
  mounted() {
    this.updateValidation();
  },
  methods: {
    inputX(event: any) {
      this.mutableValue.x = parseInt(event.target.value.replaceAll(" ", ""));
    },
    inputY(event: any) {
      this.mutableValue.y = parseInt(event.target.value.replaceAll(" ", ""));
    },
    inputZ(event: any) {
      this.mutableValue.z = parseInt(event.target.value);
    },

    openList() {
      //todo
    },
    paste() {
      navigator
          .clipboard
          .readText()
          .then(extractCoordinatesFromString)
          .then(coords => this.mutableValue = coords);
    },
    validateRange(value: number, min: number, max: number, element: HTMLInputElement) {
      if (element) {
        if (value < min) {
          element.setCustomValidity("zu klein")
        } else if (value > max) {
          element.setCustomValidity("zu gross")
        } else {
          element.setCustomValidity("");
        }
      }
    },
    updateValidation() {
      this.validateRange(this.mutableValue.x, LV03_X_MIN, LV03_X_MAX, this.$refs.inputX);
      this.validateRange(this.mutableValue.y, LV03_Y_MIN, LV03_Y_MAX, this.$refs.inputY);
      this.validateRange(this.mutableValue.z, 0, 9999, this.$refs.inputZ);
    },
  },
  watch: {
    mutableValue: {
      handler() {
        this.updateValidation();
        this.$emit("value-change", deepClone(this.mutableValue));
      },
      deep: true,
    }
  }
}
</script>

<style scoped>

</style>