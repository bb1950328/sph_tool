<template>
  <form>
    <div class="mb-3">
      <label for="modalInputName" class="form-label">Name</label>
      <input type="text" class="form-control" id="modalInputName" v-model="mutableValue.name">

      <label for="modalInputSizeGroup" class="form-label">Grösse</label>
      <div class="input-group" id="modalInputSizeGroup">
        <input class="form-control" type="number" placeholder="Spalten" id="modalInputCols"
               v-model="mutableValue.numCols">
        <div class="input-group-prepend">
          <span class="input-group-text">&times;</span>
        </div>
        <input class="form-control" type="number" placeholder="Zeilen" id="modalInputRows"
               v-model="mutableValue.numRows">
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import {UserGridDefinition} from "@/user_grid";
import {PropType, reactive} from "vue";
import {deepClone} from "@/util";

export default {
  props: {
    value: {
      type: Object as PropType<UserGridDefinition>,
      required: true,
    }
  },
  data() {
    return {
      mutableValue: reactive(deepClone(this.value)),
    }
  },
  watch: {
    mutableValue: {
      handler() {
        this.$emit("grid-change", this.mutableValue);
      },
      deep: true,
    },
  },
}
</script>

<style scoped>

</style>