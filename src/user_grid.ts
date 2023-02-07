import {binarySearchArrayElement, binarySearchArrayIndex} from "@/util";
import {reactive, watch} from "vue";
import {UserGrid, UserGridDefinition} from "@/user_grid_logic";


export const allUserGrids: UserGrid[] = reactive(loadDefinitions()) as UserGrid[];
watch(allUserGrids, () => storeDefinitions());

function storeDefinitions() {
    localStorage.setItem("userGrids", JSON.stringify(allUserGrids));
}

function loadDefinitions(): UserGrid[] {
    const gridsStr = localStorage.getItem("userGrids");
    if (gridsStr === null) {
        return [];
    } else {
        const parsedGrids = JSON.parse(gridsStr);
        parsedGrids.sort((a: UserGridDefinition, b: UserGridDefinition) => a.id - b.id);
        const result = [];
        for (const item of parsedGrids) {
            result.push(new UserGrid(item));
        }
        return result;
    }
}

export function getUserGridDefinition(id: number): UserGrid | null {
    return binarySearchArrayElement(allUserGrids, "id", id) as UserGrid;
}

/**
 * @deprecated use constructor directly
 */
export function createNewUserGridDefinition(): UserGrid {
    return new UserGrid();
}

export function saveUserGridDefinition(def: UserGrid) {
    if (def.id < 0) {
        def.id = allUserGrids.length == 0
            ? 1
            : allUserGrids[allUserGrids.length - 1].id + 1;
        allUserGrids.push(def);
    } else {
        const idx = binarySearchArrayIndex(allUserGrids, "id", def.id);
        if (idx != null) {
            allUserGrids[idx] = def;
        } else {
            allUserGrids.push(def);
        }
    }
}

export function deleteUserGridDefinition(id: number): void {
    const idx = binarySearchArrayIndex(allUserGrids, "id", id);
    if (idx != null) {
        allUserGrids.splice(idx, 1);
    }
}