import {formatArtilleryPromilleValue, LV03coordinates} from "@/util";
import {glMatrix, vec2, vec3} from "gl-matrix"
import * as math from "mathjs";

glMatrix.setMatrixArrayType(Array);

export interface ReferencePoint {
    imgCoords: vec2,
    worldCoords: LV03coordinates,
}

export interface PoseEstimationInputParams {
    imageResolution: vec2,
    cameraPosition: LV03coordinates,
    referencePoints: ReferencePoint[],
}

export interface CameraPose {
    position: LV03coordinates,
    xDir: vec3,
    yDir: vec3,
    zDir: vec3,
}

export function estimateCameraPose(input: PoseEstimationInputParams): CameraPose {
    const result = {
        position: input.cameraPosition,
        xDir: vec3.create(),
        yDir: vec3.create(),
        zDir: vec3.create(),
    };
    const imgCenter = vec2.create();
    vec2.divide(imgCenter, input.imageResolution, vec2.fromValues(2, 2));
    const imgPixelDiagonal = vec2.len(input.imageResolution);

    const referenceDirections: vec3[] = [];
    const referenceDistances: number[] = [];
    const imgReferenceDistancesFromCenter: number[] = [];

    for (const rp of input.referencePoints) {
        const diff = vec3.create();
        const worldCorrdsVec = lvToVec(rp.worldCoords);
        const camPosVec = lvToVec(input.cameraPosition);
        referenceDistances.push(vec3.distance(worldCorrdsVec, camPosVec));
        vec3.subtract(diff, worldCorrdsVec, camPosVec);
        vec3.normalize(diff, diff);
        referenceDirections.push(diff);

        imgReferenceDistancesFromCenter.push(vec2.distance(rp.imgCoords, imgCenter));
    }

    const fake_fov = 90 / 180 * math.pi;
    const maxPlaneDistToCenter=math.sin(fake_fov/2);

    const imgPlanePoints: vec3[] = [];
    for (let i = 0; i < imgReferenceDistancesFromCenter.length; i++) {
        const imgDistToCenter = imgReferenceDistancesFromCenter[i];
        const planeDistToCenter = math.sin(imgDistToCenter / imgPixelDiagonal * fake_fov);
        const planeDistToCenterNorm = planeDistToCenter/maxPlaneDistToCenter;
        const planePoint = vec3.create();
        const distToCam = Math.sqrt(planeDistToCenterNorm * planeDistToCenterNorm + 1);
        vec3.multiply(planePoint, vec3.fromValues(distToCam, distToCam, distToCam), referenceDirections[i]);
        imgPlanePoints.push(planePoint);
    }

    const cameraDirection = planeNormalFromPoints(imgPlanePoints);
    const azimutRad = math.atan2(cameraDirection[0], cameraDirection[1]);
    const azimutMils = azimutRad / math.pi * 3200;
    const azimutDeg = azimutRad / math.pi * 180;
    const xylength = vec2.len(vec2.fromValues(cameraDirection[0], cameraDirection[1]));
    const elevation = math.atan(cameraDirection[2] / xylength);
    console.log("cameraDirection", cameraDirection);
    console.log("azimut", formatArtilleryPromilleValue(azimutMils), "=", azimutDeg, "degrees");
    console.log("elevation", elevation * 180 / math.pi, "degrees");
    return result;
}

function planeNormalFromPoints(points: vec3[]): vec3 {
    // https://stackoverflow.com/a/44315488/8733066
    if (points.length < 3) {
        throw new Error("need at least 3 points to find the plane normal");
    }
    const tmp_A = []
    const tmp_b = []
    for (let i = 0; i < points.length; i++) {
        tmp_A.push([points[i][0], points[i][1], 1]);
        tmp_b.push(points[i][2]);
    }

    const b = tmp_b.map(val => [val]);
    const A = tmp_A
    const AT = math.transpose(A);
    const fit = math.multiply(math.multiply(math.inv(math.multiply(AT, A)), AT), b);
    const result = vec3.create()
    vec3.normalize(result, vec3.fromValues(fit[0][0], fit[1][0], fit[2][0]))
    return result;
}


function calculateFOV(referencePoints: ReferencePoint[], referenceDirections: vec3[], imageResolution: vec2) {
    const pointCount = referencePoints.length;
    for (let ia = 0; ia < pointCount; ia++) {
        for (let ib = 0; ib < ia; ib++) {
            const aImg = referencePoints[ia].imgCoords;

        }
    }
}

function lvToVec(coords: LV03coordinates): vec3 {
    return vec3.fromValues(coords.x, coords.y, coords.z);
}