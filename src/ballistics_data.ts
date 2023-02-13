import {LookUpTable1D, LookUpTable2D, LookUpTable3D} from "./lookup_table"

export const GP04_ELEVATION_CLICKS = new LookUpTable1D([
    [25, 10],
    [50, 2],
    [75, 0],
    [100, 0],
    [125, 0],
    [150, 2],
    [175, 3],
    [200, 4],
    [225, 4 + 2],
    [250, 4 + 4],
    [275, 4 + 6],
    [300, 11],
    [325, 11 + 2],
    [350, 11 + 4],
    [375, 11 + 6],
    [400, 20],
    [425, 20 + 2],
    [450, 20 + 5],
    [475, 20 + 7],
    [500, 29],
    [525, 29 + 3],
    [550, 29 + 5],
    [575, 29 + 8],
    [600, 39],
    [625, 39 + 3],
    [650, 39 + 6],
    [675, 39 + 9],
    [700, 51],
    [725, 51 + 3],
    [750, 51 + 6],
    [775, 51 + 9],
    [800, 63],
    [825, 63 + 4],
    [850, 63 + 7],
    [875, 63 + 11],
    [900, 77],
    [925, 77 + 4],
    [950, 77 + 8],
    [975, 77 + 11],
    [1000, 92],
    [1025, 92 + 4],
    [1050, 92 + 9],
    [1075, 92 + 13],
    [1100, 109],
    [1125, 109 + 5],
    [1150, 109 + 10],
    [1175, 109 + 15],
    [1200, 128],
    [1225, 128 + 5],
    [1250, 128 + 11],
    [1275, 128 + 16],
]);
export const GP04_ELEVATION_OLD_BARREL_CORRECTION = new LookUpTable1D([
    [200, 0],
    [300, 2],
    [400, 1],
    [500, 2],
    [600, 2],
    [700, 2],
    [800, 4],
    [900, 4],
    [1000, 5],
    [1100, 6],
    [1200, 6],
]);
export const GP04_ELEVATION_AIR_PRESSURE_CORRECTION = new LookUpTable2D(
    [300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200],
    [950, 900, 850, 800, 750],
    [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [-1, -2, -3, -4, -5],
        [-1, -2, -3, -5, -6],
        [-2, -3, -5, -6, -7],
        [-2, -4, -6, -8, -9],
        [-3, -6, -9, -11, -14],
        [-4, -8, -11, -15, -18],
        [-5, -9, -13, -17, -20],
        [-6, -10, -14, -19, -23],
    ]);
export const GP04_ELEVATION_TEMPERATURE_CORRECTION = new LookUpTable2D(
    [300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200],
    [45, 35, 25, 15, 5, -5, -15, -25],
    [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [-2, -1, -1, 0, 1, 1, 2, 2],
        [-2, -1, -1, 0, 1, 1, 2, 3],
        [-3, -2, -2, 0, 2, 2, 3, 3],
        [-3, -3, -2, 0, 2, 2, 3, 4],
        [-4, -3, -2, 0, 2, 3, 4, 5],
        [-5, -4, -3, 0, 3, 4, 5, 7],
        [-7, -5, -4, 0, 3, 6, 8, 11],
        [-9, -6, -5, 0, 4, 8, 10, 15],
    ]);

export const GP04_WINDAGE_DERIVATION = new LookUpTable1D([
    [300, 0],
    [400, 0],
    [500, -1],
    [600, -1],
    [700, -2],
    [800, -2],
    [900, -3],
    [1000, -3],
    [1100, -4],
    [1200, -4],
]);

export const GP04_WINDAGE_WIND = new LookUpTable3D(
    [300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200],//distance
    [0, 1, 2, 3],//wind clock
    [0, 2, 4, 6, 8, 10],//wind speed

    [
        [//300m
            [0, 0, 0, 0, 0, 0],
            [0, 1, 2, 3, 4, 5],
            [0, 2, 4, 6, 7, 9],
            [0, 2, 4, 6, 9, 11],
        ],
        [//400m
            [0, 0, 0, 0, 0, 0],
            [0, 1, 3, 4, 6, 7],
            [0, 3, 5, 8, 10, 13],
            [0, 3, 6, 9, 12, 15],
        ],
        [//500m
            [0, 0, 0, 0, 0, 0],
            [0, 2, 4, 6, 8, 10],
            [0, 3, 7, 10, 13, 17],
            [0, 4, 8, 12, 15, 19],
        ],
        [//600m
            [0, 0, 0, 0, 0, 0],
            [0, 2, 5, 7, 9, 12],
            [0, 4, 8, 12, 16, 20],
            [0, 5, 9, 14, 19, 23],
        ],
        [//700m
            [0, 0, 0, 0, 0, 0],
            [0, 3, 6, 8, 11, 14],
            [0, 5, 10, 15, 19, 24],
            [0, 6, 11, 17, 23, 28],
        ],
        [//800m
            [0, 0, 0, 0, 0, 0],
            [0, 3, 7, 10, 14, 17],
            [0, 6, 12, 17, 23, 29],
            [0, 7, 14, 20, 27, 34],
        ],
        [//900m
            [0, 0, 0, 0, 0, 0],
            [0, 4, 8, 12, 16, 20],
            [0, 7, 14, 20, 27, 34],
            [0, 8, 16, 24, 32, 39],
        ],
        [//1000m
            [0, 0, 0, 0, 0, 0],
            [0, 5, 9, 14, 18, 23],
            [0, 8, 16, 23, 31, 39],
            [0, 9, 18, 27, 36, 45],
        ],
        [//1100m
            [0, 0, 0, 0, 0, 0],
            [0, 5, 10, 15, 21, 26],
            [0, 9, 18, 26, 35, 44],
            [0, 10, 21, 31, 41, 51],
        ],
        [//1200m
            [0, 0, 0, 0, 0, 0],
            [0, 6, 12, 17, 23, 29],
            [0, 10, 20, 30, 40, 50],
            [0, 12, 23, 35, 46, 58],
        ],
    ]);

export const GP04_FLIGHT_TIME = new LookUpTable1D([
    [300, 0.35],
    [400, 0.5],
    [500, 0.65],
    [600, 0.85],
    [700, 1.0],
    [800, 1.2],
    [900, 1.4],
    [1000, 1.6],
    [1100, 1.85],
    [1200, 2.1],
]);

export const GP90_ELEVATION_CLICKS = new LookUpTable1D([
    [25, 8],
    [50, 1],
    [75, 0],
    [100, 0],
    [125, 0],
    [150, 0],
    [175, 0],
    [200, 1],
    [225, 1],
    [250, 1 + 1],
    [275, 1 + 2],
    [300, 4],
    [325, 4],
    [350, 4 + 1],
    [375, 4 + 2],
    [400, 8],
    [425, 8 + 1],
    [450, 8 + 2],
    [475, 8 + 3],
    [500, 13],
    [525, 13 + 1],
    [550, 13 + 2],
    [575, 13 + 4],
    [600, 19],
    [625, 19 + 1],
    [650, 19 + 3],
    [675, 19 + 5],
    [700, 26],
    [725, 26 + 2],
    [750, 26 + 4],
    [775, 26 + 7],
]);

export const GP90_ELEVATION_AIR_PRESSURE_CORRECTION = new LookUpTable2D(
    [200, 300, 400, 500, 600, 700],
    [950, 900, 850, 800, 750],
    [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [-1, -2, -3, -3, -4],
        [-2, -3, -4, -5, -6],
    ]);

export const GP90_ELEVATION_TEMPERATURE_CORRECTION = new LookUpTable2D(
    [200, 300, 400, 500, 600, 700],
    [45, 35, 25, 15, 5, -5, -15, -25],
    [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [-3, -2, 0, 0, 0, 0, 2, 3],
        [-3, -2, -1, 0, 0, 1, 4, 6],
    ]);
export const GP90_WINDAGE_DERIVATION = new LookUpTable1D([
    [200, 0],
    [300, 0],
    [400, 0],
    [500, 0],
    [600, 0],
    [700, -1],
]);

export const GP90_WINDAGE_WIND = new LookUpTable3D(
    [200, 300, 400, 500, 600, 700],//distance
    [0, 1, 2, 3],//wind clock
    [0, 2, 4, 6, 8],//wind speed

    [
        [//200m
            [0, 0, 0, 0, 0],
            [0, 0, 1, 1, 2],
            [0, 0, 1, 2, 3],
            [0, 1, 2, 3, 4],
        ],
        [//300m
            [0, 0, 0, 0, 0],
            [0, 0, 1, 2, 3],
            [0, 1, 2, 4, 5],
            [0, 1, 3, 5, 6],
        ],
        [//400m
            [0, 0, 0, 0, 0],
            [0, 1, 2, 3, 7],
            [0, 2, 4, 6, 8],
            [0, 2, 4, 7, 9],
        ],
        [//500m
            [0, 0, 0, 0, 0],
            [0, 1, 3, 4, 6],
            [0, 2, 5, 8, 11],
            [0, 3, 6, 9, 12],
        ],
        [//600m
            [0, 0, 0, 0, 0],
            [0, 2, 4, 6, 8],
            [0, 3, 7, 10, 14],
            [0, 4, 8, 12, 16],
        ],
        [//700m
            [0, 0, 0, 0, 0],
            [0, 2, 5, 7, 10],
            [0, 4, 9, 13, 18],
            [0, 5, 10, 15, 21],
        ],
    ]);