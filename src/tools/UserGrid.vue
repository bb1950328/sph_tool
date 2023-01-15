<template>
  <div class="p-2">
    <button type="button" class="btn btn-primary" @click="newGrid()">
      <font-awesome-icon icon="fa-solid fa-plus"/>
      Neues Führungsraster
    </button>
    <table class="table table-striped table-bordered table-sm mt-2">
      <thead>
      <tr>
        <th scope="col">Name</th>
        <th scope="col">Grösse</th>
        <th scope="col"></th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="gridDef in allUserGrids" :key="gridDef.id">
        <th scope="row">{{ gridDef.name }}</th>
        <td>{{ gridDef.numCols }}&times;{{ gridDef.numRows }}</td>
        <td>
          <div class="btn-group" role="group" aria-label="Aktionen {{gridDef.name}}">
            <button type="button" class="btn btn-outline-secondary btn-sm edit-grid-button"
                    @click="startEditGrid(gridDef.id)" aria-label="Bearbeite {{gridDef.name}}">
              <font-awesome-icon icon="fa-solid fa-pen"/>
            </button>
            <button type="button" class="btn btn-outline-secondary btn-sm edit-grid-button"
                    @click="deleteUserGridDefinition(gridDef.id)" aria-label="Lösche {{gridDef.name}}">
              <font-awesome-icon icon="fa-solid fa-trash-can"/>
            </button>
          </div>
        </td>
      </tr>
      </tbody>
    </table>

    <div class="modal" tabindex="-1" role="dialog" id="gridEditModal" ref="divModal">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" v-if="currentlyEditingGrid!=null">
              Führungsraster {{ currentlyEditingGrid.name }} bearbeiten
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
              <span aria-hidden="true" hidden>&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <UserGridForm v-model:value="currentlyEditingGrid"/>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="saveChangesFromModal();modal.hide()">
              Speichern
            </button>
            <button type="button" class="btn btn-secondary" @click="modal.hide()">
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  allUserGrids,
  createNewUserGridDefinition,
  deleteUserGridDefinition,
  getUserGridDefinition,
  saveUserGridDefinition
} from "@/user_grid";
import {Modal} from "bootstrap"
import {deepClone} from "@/util";
import UserGridForm from "@/components/UserGridForm.vue";

export default {
  name: "UserGrid",
  components: {UserGridForm},
  mounted() {
    this.modal = new Modal(this.$refs.divModal);
  },
  methods: {
    deleteUserGridDefinition: deleteUserGridDefinition,
    saveChangesFromModal() {
      saveUserGridDefinition(this.currentlyEditingGrid);
    },
    closeModal() {
      this.modal.hide();
    },
    newGrid() {
      this.currentlyEditingGrid = createNewUserGridDefinition();
      this.modal.show();
    },
    startEditGrid(id) {
      this.currentlyEditingGrid = deepClone(getUserGridDefinition(id));
      this.modal.show();
    }
  },
  data() {
    return {
      allUserGrids: allUserGrids,
      currentlyEditingGrid: createNewUserGridDefinition(),
      modal: null,
    }
  },
  computed: {},
}
</script>

<style scoped>

</style>