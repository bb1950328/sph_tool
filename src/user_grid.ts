import {binarySearchArrayElement, binarySearchArrayIndex, isDigits, LV03coordinates} from "@/util";
import {reactive, watch} from "vue";
import {isNumeric} from "mathjs";
import {d} from "vitest/dist/index-6e18a03a";
import {NumberingScheme, UserGridDefinition} from "@/user_grid_logic";


export const allUserGrids: UserGridDefinition[] = reactive(loadDefinitions());
watch(allUserGrids, () => storeDefinitions());

function storeDefinitions() {
    localStorage.setItem("userGrids", JSON.stringify(allUserGrids));
}

function loadDefinitions(): UserGridDefinition[] {
    const gridsStr = localStorage.getItem("userGrids");
    if (gridsStr === null) {
        return [];
    } else {
        const parsedGrids = JSON.parse(gridsStr);
        parsedGrids.sort((a: UserGridDefinition, b: UserGridDefinition) => a.id - b.id);
        return parsedGrids;
    }
}

export function getUserGridDefinition(id: number): UserGridDefinition | null {
    return binarySearchArrayElement(allUserGrids, "id", id);
}

export function createNewUserGridDefinition(): UserGridDefinition {
    return {
        id: -1,
        name: "Neues Führungsraster",
        rowNumberingScheme: NumberingScheme.NUMBERS,
        colNumberingScheme: NumberingScheme.EXCEL_LETTERS,
        cellQuadrantLetters: ["A", "B", "C", "D"],
        topLeftIdentifier: "A1",
        bottomRightIdentifier: "J10",
        refPoint0Cooords: null,
        refPoint1Coords: null,
        refPoint0Identifier: "",
        refPoint1Identifier: "",
    };
}

export function saveUserGridDefinition(def: UserGridDefinition) {
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