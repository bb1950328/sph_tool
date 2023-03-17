import {
    unitVec,
    angleBetweenVectors,
    findMonotonicFunctionArgument,
    formatArtilleryPromilleValue,
    LV03coordinates,
    solveQuadraticEquation, combineVectorsToMatrix
} from "@/util";
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
    const maxPlaneDistToCenter = math.sin(fake_fov / 2);

    const imgPlanePoints: vec3[] = [];
    for (let i = 0; i < imgReferenceDistancesFromCenter.length; i++) {
        const imgDistToCenter = imgReferenceDistancesFromCenter[i];
        const planeDistToCenter = math.sin(imgDistToCenter / imgPixelDiagonal * fake_fov);
        const planeDistToCenterNorm = planeDistToCenter / maxPlaneDistToCenter;
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

function coordToMatrix(coord: LV03coordinates) {
    return math.matrix([coord.x, coord.y, coord.z]);
}

export function poseEstimation2(input: PoseEstimationInputParams): CameraPose {
    //https://www.mdpi.com/1290822

    const Oc = coordToMatrix(input.cameraPosition);
    const P1 = coordToMatrix(input.referencePoints[0].worldCoords);
    const P2 = coordToMatrix(input.referencePoints[1].worldCoords);
    const p1 = input.referencePoints[0].imgCoords;
    const p2 = input.referencePoints[1].imgCoords;
    const u1 = p1[0];
    const v1 = p1[1];
    const u2 = p2[0];
    const v2 = p2[1];

    //equation (5)
    const OcP1 = math.subtract(P1, Oc);
    const OcP2 = math.subtract(P2, Oc);

    //equation (6)
    // @ts-ignore
    const alpha: number = math.acos(math.dot(OcP1, OcP2) / (math.norm(OcP1) * math.norm(OcP2)));

    //equation (8)
    const b = u1 * u2 + v1 * v2;
    const c = math.square(u1) + math.square(v1);
    const d = math.square(u2) + math.square(v2);
    const cos2alpha = math.square(math.cos(alpha));
    const aSolutions = solveQuadraticEquation(1 - cos2alpha, 2 * b - c * cos2alpha - d * cos2alpha, -(c * d * cos2alpha));
    const possibleASolutions = aSolutions.filter(a => a > 0);

    const f = math.sqrt(possibleASolutions[0]);
    console.log("focal length: ", f);

    //equation (10)
    const Rox = math.matrix([
        [1, 0, 0],
        [0, 0, -1],
        [0, 1, 0],
    ]);

    //equation (9)
    const P1c = math.multiply(Rox, math.subtract(P1, Oc));

    //equation (11)
    const p1c = math.transpose(math.matrix([u1, v1, f]));

    //equation (12)
    const Oc_P1c = math.subtract(P1c, Oc);
    const Oc_p1c = math.subtract(p1c, Oc);
    // @ts-ignore
    const Ayc: number = math.acos(math.dot(Oc_P1c, Oc_p1c) / (math.norm(Oc_P1c) * math.norm(Oc_p1c)));

    //equation (14)
    const RcYc = math.matrix([
        [math.cos(Ayc), 0, -math.sin(Ayc)],
        [0, 1, 0],
        [math.sin(Ayc), 0, math.cos(Ayc)],
    ]);

    //equation (13)
    const P1_c1 = math.multiply(RcYc, P1c);
    const p1_c1 = p1c;

    //equation (15)
    const Oc_P1c1 = math.subtract(P1_c1, Oc);
    const Oc_p1c1 = math.subtract(p1_c1, Oc);
    // @ts-ignore
    const Ax_c1: number = math.acos(math.dot(Oc_P1c1, Oc_p1c1) / (math.norm(Oc_P1c1) * math.norm(Oc_p1c1)));

    //equation (17)
    const RcXc1 = math.matrix([
        [1, 0, 0],
        [0, math.cos(Ax_c1), -math.sin(Ax_c1)],
        [0, math.sin(Ax_c1), math.cos(Ax_c1)],
    ]);

    //equation (16)
    const p2w = math.add(math.multiply(math.inv(math.multiply(math.multiply(RcXc1, RcYc), Rox)), math.transpose(math.matrix([u2, v2, f]))), Oc);

    //equation (18)

    return {
        position: {x: 0, y: 0, z: 0},
        xDir: vec3.create(),
        yDir: vec3.create(),
        zDir: vec3.create(),
    };
}

export interface ReferencePoint2 {
    imgCoords: math.Matrix;//between -1 and +1
    worldCoords: LV03coordinates;
}

export interface PoseEstimationInputParams2 {
    cameraPosition: LV03coordinates,
    referencePoints: ReferencePoint2[],
}

export function poseEstimation3(input: PoseEstimationInputParams2): [number, math.Matrix] {
    const camCoords = coordToMatrix(input.cameraPosition);
    const worldCamToPoint: math.Matrix[] = [];
    for (let i = 0; i < 2; i++){
        const rp = input.referencePoints[i];
        const rpCoords = coordToMatrix(rp.worldCoords);
        worldCamToPoint.push(math.subtract(rpCoords, camCoords));
    }
    const angleBetweenReferencePoints = angleBetweenVectors(worldCamToPoint[0], worldCamToPoint[1]);

    function createCamSpace3dVectors(scale: number): [math.Matrix, math.Matrix] {
        const camSpace3dVectors: math.Matrix[] = [];
        for (let i = 0; i < 2; i++) {
            const imgCoords = input.referencePoints[i].imgCoords;
            camSpace3dVectors.push(math.matrix([
                imgCoords.get([0]) * scale,
                imgCoords.get([1]) * scale,
                1,
            ]));
        }
        // @ts-ignore
        return camSpace3dVectors;
    }

    const f = (scale: number) => {
        const camSpace3dVectors = createCamSpace3dVectors(scale);
        return angleBetweenVectors(camSpace3dVectors[0], camSpace3dVectors[1]);
    }
    const scale = findMonotonicFunctionArgument(f, 0, 10, angleBetweenReferencePoints);
    const camSpace3dVectors = createCamSpace3dVectors(scale);

    //make two vectors for the two reference points in camera space (angle between them is the same as the angle between the world reference vectors)

    //use triad method to find rotation
    //https://en.wikipedia.org/wiki/Triad_method
    const R1 = worldCamToPoint[0];
    const R2 = worldCamToPoint[1];
    const r1 = camSpace3dVectors[0];
    const r2 = camSpace3dVectors[1];

    const Shat = unitVec(R1);// (4)
    const shat = unitVec(r1);// (5)
    const Mhat = unitVec(<math.Matrix>math.cross(R1, R2));// (6)
    const mhat = unitVec(<math.Matrix>math.cross(r1, r2));// (7)

    const Ahat = math.multiply(combineVectorsToMatrix([Shat, Mhat, <math.Matrix>math.cross(Shat, Mhat)]),
        math.transpose(combineVectorsToMatrix([shat, mhat, <math.Matrix>math.cross(shat, mhat)])));// (9)

    return [scale, Ahat];
}

