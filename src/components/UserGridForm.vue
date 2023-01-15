<template>
  <form>
    <div class="mb-3">
      <label for="modalInputName" class="form-label">Name</label>
      <input type="text" class="form-control" id="modalInputName" v-model="mutableValue.name">
    </div>
    <div class="mb-3">
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
    <div class="mb-3">
      <label for="numberingSchemeGroup" class="form-label">Nummerierung</label>
      <div class="input-group" id="numberingSchemeGroup">
        <div class="col-6 pe-3">
          <label for="inpColNumberScheme">Spalten</label>
          <select class="form-select" aria-label="Spaltennummerierung"
                  v-model="mutableValue.colNumberingScheme" id="inpColNumberScheme">
            <option :value="NumberingScheme.EXCEL_LETTERS">Buchstaben</option>
            <option :value="NumberingScheme.NUMBERS">Zahlen</option>
          </select>
        </div>
        <div class="col-6">
          <label for="inpRowNumberScheme">Zeilen</label>
          <select class="form-select" aria-label="Zeilennummerierung"
                  v-model="mutableValue.rowNumberingScheme" id="inpRowNumberScheme">
            <option :value="NumberingScheme.EXCEL_LETTERS">Buchstaben</option>
            <option :value="NumberingScheme.NUMBERS">Zahlen</option>
          </select>
        </div>
      </div>
    </div>
    <div class="mb-3">
      <div class="form-check">
        <input type="checkbox" v-model="hasQuadrantLetters" ref="inpQuadrantLettersActive"
               id="inpQuadrantLettersActive" class="form-check-input">
        <label for="inpQuadrantLettersActive" class="form-check-label">Zellen in Quadrante unterteilen</label>
      </div>
      <div v-if="hasQuadrantLetters">
        <div class="p-2 col-6 d-inline-block" v-for="i in 4" :key="i">
          <input v-model="mutableValue.cellQuadrantLetters[i-1]" class="form-control"/>
        </div>
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import {UserGridDefinition, NumberingScheme} from "@/user_grid";
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
      hasQuadrantLetters: this.value.cellQuadrantLetters!=null,
      NumberingScheme,
    }
  },
  watch: {
    mutableValue: {
      handler() {
        this.$emit("grid-change", this.mutableValue);
      },
      deep: true,
    },
    hasQuadrantLetters() {
      this.mutableValue.cellQuadrantLetters = this.$refs.inpQuadrantLettersActive.value
          ? ["A", "B", "C", "D"]
          : null;
    }
  },
  methods: {
  },
}
</script>

<style scoped>

</style>