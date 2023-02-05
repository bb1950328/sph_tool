<template>
  <form ref="form" class="was-validated">
    <div class="mb-3">
      <label for="modalInputName" class="form-label">Name</label>
      <input type="text" class="form-control" id="modalInputName" v-model="mutableValue.name" required>
    </div>
    <div class="mb-3">
      <label for="numberingSchemeGroup" class="form-label">Nummerierung</label>
      <div class="input-group" id="numberingSchemeGroup">
        <div class="col-6 pe-3">
          <label for="inpColNumberScheme">Spalten</label>
          <select class="form-select" aria-label="Spaltennummerierung"
                  v-model="mutableValue.colNumberingScheme" id="inpColNumberScheme" required>
            <option :value="NumberingScheme.EXCEL_LETTERS">Buchstaben</option>
            <option :value="NumberingScheme.NUMBERS">Zahlen</option>
          </select>
        </div>
        <div class="col-6">
          <label for="inpRowNumberScheme">Zeilen</label>
          <select class="form-select" aria-label="Zeilennummerierung"
                  v-model="mutableValue.rowNumberingScheme" id="inpRowNumberScheme" required>
            <option :value="NumberingScheme.EXCEL_LETTERS">Buchstaben</option>
            <option :value="NumberingScheme.NUMBERS">Zahlen</option>
          </select>
        </div>
      </div>
    </div>
    <div class="mb-3">
      <label for="cornerCellIdentifierGroup" class="form-label">Zellbezeichungen Ecken</label>
      <div class="input-group" id="cornerCellIdentifierGroup">
        <div class="col pe-3">
          <label for="inpTopLeftIdentifier" class="form-label">oben links</label>
          <input id="inpTopLeftIdentifier" class="form-control" v-model="mutableValue.topLeftIdentifier"
                 ref="topLeftIdentifier" required>
        </div>
        <div class="col">
          <label for="inpBottomRightIdentifier" class="form-label">unten rechts</label>
          <input id="inpBottomRightIdentifier" class="form-control" v-model="mutableValue.bottomRightIdentifier"
                 ref="bottomRightIdentifier" required>
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
        <div :class="{'col-6': true, 'd-inline-block': true, 'pe-2':i%2===1, 'pb-2':i%2===0}" v-for="i in 4" :key="i">
          <input v-model="mutableValue.cellQuadrantLetters[i-1]" class="form-control" required/>
        </div>
      </div>
    </div>
    <div class="mb-3">
      <label class="form-label">Referenzpunkt 1</label>
      <div>
        <label for="refPoint0Input" class="form-label">Koordinaten</label>
        <PointInput id="refPoint0Input"
                    :with-height="false"
                    :value="mutableValue.refPoint0Coords"
                    @value-change="val => mutableValue.refPoint0Coords = val"></PointInput>
      </div>
      <div>
        <label for="refPoint0IdentifierInput" class="form-label">Bezeichnung</label>
        <input v-model="mutableValue.refPoint0Identifier" class="form-control" ref="refPoint0Identifier" required>
      </div>
    </div>
    <div class="mb-3">
      <label class="form-label">Referenzpunkt 2</label>
      <div>
        <label for="refPoint1Input" class="form-label">Koordinaten</label>
        <PointInput id="refPoint1Input"
                    :with-height="false"
                    :value="mutableValue.refPoint1Coords"
                    @value-change="val => mutableValue.refPoint1Coords = val"></PointInput>
      </div>
      <div>
        <label for="refPoint1IdentifierInput" class="form-label">Bezeichnung</label>
        <input v-model="mutableValue.refPoint1Identifier" class="form-control" ref="refPoint1Identifier" required>
      </div>
    </div>
    <div class="mb-3">
      <label class="form-label">Kontrolle</label>
      <div class="row">
        <span class="col-3">Zeilen</span>
        <span class="col">{{ checkValues.rowTitles }}</span>
      </div>
      <div class="row">
        <span class="col-3">Spalten</span>
        <span class="col">{{ checkValues.columnTitles }}</span>
      </div>
      <div class="row">
        <span class="col-3">Zellengrösse</span>
        <span class="col">{{ checkValues.cellSizeX }} &times; {{ checkValues.cellSizeY }} m</span>
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import {getAxisTitles, getCellSize, NumberingScheme, splitIdentifier, UserGridDefinition} from "@/user_grid_logic";
import {PropType, reactive} from "vue";
import {deepClone} from "@/util";
import PointInput from "@/components/PointInput.vue";

export default {
  components: {PointInput},
  props: {
    value: {
      type: Object as PropType<UserGridDefinition>,
      required: true,
    }
  },
  emits: [
    "value-change",
  ],
  data() {
    const mutableValue = reactive(deepClone(this.value));
    return {
      mutableValue,
      hasQuadrantLetters: this.value.cellQuadrantLetters != null,
      NumberingScheme,
    }
  },
  watch: {
    mutableValue: {
      handler() {
        this.validateIdentifierValue(this.$refs.topLeftIdentifier, this.mutableValue.topLeftIdentifier);
        this.validateIdentifierValue(this.$refs.bottomRightIdentifier, this.mutableValue.bottomRightIdentifier);
        this.validateIdentifierValue(this.$refs.refPoint0Identifier, this.mutableValue.refPoint0Identifier);
        this.validateIdentifierValue(this.$refs.refPoint1Identifier, this.mutableValue.refPoint1Identifier);
        this.$refs.form.checkValidity();
        this.$emit("value-change", this.mutableValue);
      },
      deep: true,
    },
    hasQuadrantLetters() {
      this.mutableValue.cellQuadrantLetters = this.$refs.inpQuadrantLettersActive.value
          ? ["A", "B", "D", "C"]
          : null;
    }
  },
  methods: {
    arrayElementsEllipsis(arr: string[]) {
      if (arr.length <= 10) {
        return arr.join(", ");
      } else {
        return [...arr.slice(0, 5), "...", ...arr.slice(arr.length - 5)].join(", ");
      }
    },
    validateIdentifierValue(element: HTMLInputElement, identifierValue: string) {
      element.setCustomValidity("");
      try {
        splitIdentifier(this.mutableValue, identifierValue);
      } catch (UserGridIdentifierFormatError) {
        element.setCustomValidity("Ungültig");
      }
    }
  },
  computed: {
    /* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
    checkValues() {
      const values = {
        columnTitles: "",
        rowTitles: "",
        cellSizeX: "",
        cellSizeY: "",
      }
      try {
        values.rowTitles = this.arrayElementsEllipsis(getAxisTitles(this.mutableValue, 0));
        values.columnTitles = this.arrayElementsEllipsis(getAxisTitles(this.mutableValue, 1));
      } catch (UserGridIdentifierFormatError) {
      }
      const cellSize = getCellSize(this.mutableValue);
      if (cellSize != null) {
        values.cellSizeX = Math.round(cellSize[0]).toString();
        values.cellSizeY = Math.round(cellSize[1]).toString();
      }
      return values;
    },
  }
}
</script>

<style scoped>

</style>