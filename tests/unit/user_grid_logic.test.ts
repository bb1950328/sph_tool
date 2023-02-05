import {expect, test} from "vitest";
import {excelLettersToNumber, numberToExcelLetter} from "@/user_grid_logic";

test("excelLettersToNumber", () => {
    expect(excelLettersToNumber("A")).toEqual(0);
    expect(excelLettersToNumber("B")).toEqual(1);
    expect(excelLettersToNumber("Z")).toEqual(25);
    expect(excelLettersToNumber("AA")).toEqual(26);
    expect(excelLettersToNumber("AB")).toEqual(27);
    expect(excelLettersToNumber("AZ")).toEqual(26+25);
    expect(excelLettersToNumber("BA")).toEqual(26+25+1);
});
test("numberToExcelLetter", () => {
    expect(numberToExcelLetter(0)).toEqual("A");
    expect(numberToExcelLetter(1)).toEqual("B");
    expect(numberToExcelLetter(25)).toEqual("Z");
    expect(numberToExcelLetter(26)).toEqual("AA");
    expect(numberToExcelLetter(27)).toEqual("AB");
    expect(numberToExcelLetter(26+25)).toEqual("AZ");
    expect(numberToExcelLetter(26+25+1)).toEqual("BA");
});