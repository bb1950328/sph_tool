import {expect, test, it} from "vitest";
import * as fs from 'fs';
import * as path from "path";
import * as ExifReader from "exifreader"
import {vec2} from "gl-matrix";

import {estimateCameraPose, poseEstimation2, ReferencePoint} from "@/camera_pose_estimation";

const data: any[] = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../data/camera_pose_estimation/data.json"), "utf-8"));

test.each(data)("estimate camera pose", async ({file_name, own_location, reference_points}) => {
    if (reference_points.length === 0) {
        console.warn(`no reference points specified for ${file_name}`);
        return;
    }
    const exifTags = await ExifReader.load(fs.readFileSync(path.resolve(__dirname, "../data/camera_pose_estimation/" + file_name)));
    const imgWidth = exifTags["Image Width"].value;
    const imgHeight = exifTags["Image Height"].value;
    expect(imgWidth).toBeTruthy();
    expect(imgHeight).toBeTruthy();
    const input = {
        // @ts-ignore
        imageResolution: vec2.fromValues(imgWidth, imgHeight),
        cameraPosition: own_location,
        referencePoints: reference_points,
    };
    const result = estimateCameraPose(input);
    expect(result.position).toBe(own_location);
});
test.each(data)("estimate camera pose 2", async ({file_name, own_location, reference_points}) => {
    if (reference_points.length === 0) {
        console.warn(`no reference points specified for ${file_name}`);
        return;
    }
    const exifTags = await ExifReader.load(fs.readFileSync(path.resolve(__dirname, "../data/camera_pose_estimation/" + file_name)));
    const imgWidth = parseInt(exifTags["Image Width"].value);
    const imgHeight = parseInt(exifTags["Image Height"].value);
    expect(imgWidth).toBeTruthy();
    expect(imgHeight).toBeTruthy();
    const normalizedReferencePoints: ReferencePoint[] = [];
    for (const rp of reference_points) {
        normalizedReferencePoints.push({
            worldCoords: rp.worldCoords,
            imgCoords: [
                (rp.imgCoords[0] / imgWidth - 0.5) * 2,
                (rp.imgCoords[1] / imgHeight - 0.5) * 2,
            ],
        });
    }
    const input = {
        // @ts-ignore
        imageResolution: vec2.fromValues(imgWidth, imgHeight),
        cameraPosition: own_location,
        referencePoints: normalizedReferencePoints,
    };
    const result = poseEstimation2(input);
    expect(result.position).toBe(own_location);
});