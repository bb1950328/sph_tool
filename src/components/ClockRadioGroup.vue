<template>
  <div id="wrapper">
    <input type="radio" name="clock-radio" id="clock-1" autocomplete="off" v-model="internalValue" v-bind:value="1">
    <label for="clock-1"><span><span @click="setVal(1)">1</span></span></label>
    <input type="radio" name="clock-radio" id="clock-2" autocomplete="off" v-model="internalValue" v-bind:value="2">
    <label for="clock-2"><span><span @click="setVal(2)">2</span></span></label>
    <input type="radio" name="clock-radio" id="clock-3" autocomplete="off" v-model="internalValue" v-bind:value="3">
    <label for="clock-3"><span><span @click="setVal(3)">3</span></span></label>
    <input type="radio" name="clock-radio" id="clock-4" autocomplete="off" v-model="internalValue" v-bind:value="4">
    <label for="clock-4"><span><span @click="setVal(4)">4</span></span></label>
    <input type="radio" name="clock-radio" id="clock-5" autocomplete="off" v-model="internalValue" v-bind:value="5">
    <label for="clock-5"><span><span @click="setVal(5)">5</span></span></label>
    <input type="radio" name="clock-radio" id="clock-6" autocomplete="off" v-model="internalValue" v-bind:value="6">
    <label for="clock-6"><span><span @click="setVal(6)">6</span></span></label>
    <input type="radio" name="clock-radio" id="clock-7" autocomplete="off" v-model="internalValue" v-bind:value="7">
    <label for="clock-7"><span><span @click="setVal(7)">7</span></span></label>
    <input type="radio" name="clock-radio" id="clock-8" autocomplete="off" v-model="internalValue" v-bind:value="8">
    <label for="clock-8"><span><span @click="setVal(8)">8</span></span></label>
    <input type="radio" name="clock-radio" id="clock-9" autocomplete="off" v-model="internalValue" v-bind:value="9">
    <label for="clock-9"><span><span @click="setVal(9)">9</span></span></label>
    <input type="radio" name="clock-radio" id="clock-10" autocomplete="off" v-model="internalValue" v-bind:value="10">
    <label for="clock-10"><span><span @click="setVal(10)">10</span></span></label>
    <input type="radio" name="clock-radio" id="clock-11" autocomplete="off" v-model="internalValue" v-bind:value="11">
    <label for="clock-11"><span><span @click="setVal(11)">11</span></span></label>
    <input type="radio" name="clock-radio" id="clock-12" autocomplete="off" v-model="internalValue" v-bind:value="12">
    <label for="clock-12"><span><span @click="setVal(12)">12</span></span></label>
    <div id="highlight-bg" :style="cssVars"></div>
  </div>
</template>

<script>
export default {
  name: "ClockRadioGroup",
  props: ["modelValue"],
  emits: ["update:modelValue"],
  data() {
    return {
      internalValue: this.modelValue,
    };
  },
  watch: {
    internalValue() {
      this.$emit("update:modelValue", this.internalValue);
    },
  },
  methods: {
    setVal(newVal) {
      this.internalValue = newVal;
    },
  },
  computed: {
    cssVars() {
      return {
        "--angle": this.internalValue * 30 - 45,
      };
    },
  },
}
</script>

<style scoped>
#wrapper {
  width: 10rem;
  height: 10rem;
  position: relative;
  overflow: hidden;
}

#wrapper::after {
  width: 6rem;
  height: 6rem;
  content: "";
  position: absolute;
  top: 2rem;
  left: 2rem;
  background-color: #fff;
}

#wrapper, #wrapper::after {
  border-radius: 50%;
  border: #0d6efd solid 1px;
}

#wrapper label {
  position: absolute;
  top: 0;
  left: 4rem;
  width: 2rem;
  height: 2rem;
  transform-origin: center 5rem 4.5rem;
  color: #0d6efd;
}

label > span {
  position: absolute;
  width: 2rem;
  height: 2rem;
  top: 0;
  left: 0;
}

label > span > span {
  position: absolute;
  top: 0.4rem;
  left: 0.5rem;
  z-index: 100;
}

label::before {
  content: "";
  height: 2rem;
  transform: rotate(-15deg);
  transform-origin: center 5rem 5rem;
  border-left: #0d6efd solid 1px;
  position: absolute;
  top: 0;
  left: 1rem;
}

#highlight-bg {
  content: "";
  width: 5rem;
  height: 5rem;
  background-color: #0d6efd;
  position: absolute;
  left: 5rem;
  top: 0;
  transform-origin: bottom left;
  transform: rotate(calc(v-bind(internalValue) * 30deg - 75deg)) skew(-60deg);
  z-index: -10;
}

input {
  display: none;
}

input:checked + label {
  color: #fff !important;
}

label[for="clock-1"] {
  transform: rotate(calc(30deg * 1));
}

label[for="clock-2"] {
  transform: rotate(calc(30deg * 2));
}

label[for="clock-3"] {
  transform: rotate(calc(30deg * 3));
}

label[for="clock-4"] {
  transform: rotate(calc(30deg * 4));
}

label[for="clock-5"] {
  transform: rotate(calc(30deg * 5));
}

label[for="clock-6"] {
  transform: rotate(calc(30deg * 6));
}

label[for="clock-7"] {
  transform: rotate(calc(30deg * 7));
}

label[for="clock-8"] {
  transform: rotate(calc(30deg * 8));
}

label[for="clock-9"] {
  transform: rotate(calc(30deg * 9));
}

label[for="clock-10"] {
  transform: rotate(calc(30deg * 10));
}

label[for="clock-11"] {
  transform: rotate(calc(30deg * 11));
}

label[for="clock-12"] {
  transform: rotate(calc(30deg * 12));
}

label[for="clock-1"] > span {
  transform: rotate(calc(-30deg * 1));
}

label[for="clock-2"] > span {
  transform: rotate(calc(-30deg * 2));
}

label[for="clock-3"] > span {
  transform: rotate(calc(-30deg * 3));
}

label[for="clock-4"] > span {
  transform: rotate(calc(-30deg * 4));
}

label[for="clock-5"] > span {
  transform: rotate(calc(-30deg * 5));
}

label[for="clock-6"] > span {
  transform: rotate(calc(-30deg * 6));
}

label[for="clock-7"] > span {
  transform: rotate(calc(-30deg * 7));
}

label[for="clock-8"] > span {
  transform: rotate(calc(-30deg * 8));
}

label[for="clock-9"] > span {
  transform: rotate(calc(-30deg * 9));
}

label[for="clock-10"] > span {
  transform: rotate(calc(-30deg * 10));
}

label[for="clock-11"] > span {
  transform: rotate(calc(-30deg * 11));
}

label[for="clock-12"] > span {
  transform: rotate(calc(-30deg * 12));
}

</style>