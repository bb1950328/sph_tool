<template>
  <form>
    <div class="mb-3">
      <label for="modalInputName" class="form-label">Name</label>
      <input type="text" class="form-control" id="modalInputName">

      <label for="modalInputSizeGroup" class="form-label">Grösse</label>
      <div class="input-group" id="modalInputSizeGroup">
        <input class="form-control" type="number" placeholder="Spalten" id="modalInputCols" ref="inpCols">
        <div class="input-group-prepend">
          <span class="input-group-text">&times;</span>
        </div>
        <input class="form-control" type="number" placeholder="Zeilen" id="modalInputRows" ref="inpRows">
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import {UserGridDefinition} from "@/user_grid";
import {PropType} from "vue";

export default {
  props: {
    value: {
      type: Object as PropType<UserGridDefinition>,
      required: true,
    }
  }
}
</script>

<style scoped>

</style>