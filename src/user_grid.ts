import {binarySearchArray, LV03coordinates} from "@/util";
import {reactive, watch} from "vue";

enum NumberingScheme {
    NUMBERS,
    EXCEL_LETTERS,
}

export interface UserGridDefinition {
    id: number,
    name: string,
    numRows: number,
    numCols: number,
    rowNumberingScheme: NumberingScheme,
    colNumberingScheme: NumberingScheme,
    cellQuadrantLetters: [string, string, string, string] | null;
    refPoint0Cooords: LV03coordinates | null,
    refPoint1Coords: LV03coordinates | null,
    refPoint0Identifier: string,
    refPoint1Identifier: string,
}

export const allUserGrids: UserGridDefinition[] = reactive(loadDefinitions());
watch(allUserGrids, () => storeDefinitions());

const LOCAL_STORAGE_KEY = "userGrids";

function storeDefinitions() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allUserGrids));
}

function loadDefinitions(): UserGridDefinition[] {
    const gridsStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (gridsStr === null) {
        return [];
    } else {
        const parsedGrids = JSON.parse(gridsStr);
        parsedGrids.sort((a: UserGridDefinition, b: UserGridDefinition) => a.id - b.id);
        return parsedGrids;
    }
}

export function getUserGridDefinition(id: number): UserGridDefinition | null {
    return binarySearchArray(allUserGrids, "id", id);
}

export function addUserGridDefinition(): UserGridDefinition {
    const newId = allUserGrids.length == 0
        ? 1
        : allUserGrids[allUserGrids.length - 1].id + 1;
    const newDef: UserGridDefinition = {
        id: newId,
        name: "Neues Führungsraster",
        numRows: 10,
        numCols: 10,
        rowNumberingScheme: NumberingScheme.NUMBERS,
        colNumberingScheme: NumberingScheme.EXCEL_LETTERS,
        cellQuadrantLetters: ["A", "B", "C", "D"],
        refPoint0Cooords: null,
        refPoint1Coords: null,
        refPoint0Identifier: "",
        refPoint1Identifier: "",
    };
    allUserGrids.push(newDef);
    return newDef;
}

export function deleteUserGridDefinition(id: number): void {
    for (let i = 0; i < allUserGrids.length; i++) {
        if (allUserGrids[i].id == id) {
            allUserGrids.splice(i, 1);
            return;
        }
    }
}