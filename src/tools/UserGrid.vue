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
        <td>{{ gridDef.xAxis.size() }}&times;{{ gridDef.yAxis.size() }}</td>
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
            <UserGridForm :value="currentlyEditingGrid"
                          @value-change="editingGridChanged"
                          v-if="currentlyEditingGrid!=null"
                          :key="currentlyEditingGrid.id"/>
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
import {allUserGrids, deleteUserGridDefinition, getUserGridDefinition, saveUserGridDefinition} from "@/user_grid";
import {Modal} from "bootstrap"
import UserGridForm from "@/components/UserGridForm.vue";
import {UserGrid} from "@/user_grid_logic";

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
      this.currentlyEditingGrid = new UserGrid();
      this.modal.show();
    },
    startEditGrid(id) {
      this.currentlyEditingGrid = new UserGrid(getUserGridDefinition(id));
      this.modal.show();
    },
    editingGridChanged(newGrid) {
      this.currentlyEditingGrid = newGrid;
    },
  },
  data() {
    return {
      allUserGrids: allUserGrids,
      currentlyEditingGrid: null,
      modal: null,
    }
  },
  computed: {},
}
</script>

<style scoped>

</style>