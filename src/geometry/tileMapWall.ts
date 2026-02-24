import { _M, A2 } from "./_m"

const D = .25

export const tileMapWall = {
    'noise': [
        0, 0,
        1 * D, 0,
        1 * D, 1 * D,
        0, 0,
        1 * D, 1 * D,
        0, 1 * D,
    ],
    'noiseTree': [
        0, 0,
        1 * D, 0,
        .5 * D, 1 * D,
    ],
    'noiseLong': [
        0, 1 * D,
        1 * D, 1 * D,
        1 * D, 2 * D,
        0, 1 * D,
        1 * D, 2 * D,
        0, 2 * D,
    ],
    'break': [
        1 * D, 0,
        2 * D, 0,
        2 * D, 1 * D,
        1 * D, 0,
        2 * D, 1 * D,
        1 * D, 1 * D,
    ],
    'breakManyTree': [
        1 * D, 1 * D,
        2 * D, 1 * D,
        1.5 * D, 2 * D,
    ],
    'lines': [
        1 * D, 2 * D,
        2 * D, 2 * D,
        2 * D, 3 * D,
        1 * D, 2 * D,
        2 * D, 3 * D,
        1 * D, 3 * D,
    ],
    'linesTree': [
        1 * D, 2 * D,
        2 * D, 2 * D,
        1.5 * D, 2 * D,
    ],
    'white': [
        D * 3.7, D * 3.7, 
        D * 4, D * 3.7, 
        D * 4, D * 4, 
        D * 3.7, D * 3.7, 
        D * 4, D * 4, 
        D * 3.7, D * 4, 
    ],
    'stone': [
        0, D * 2,
        D, D * 2,
        D, D * 3,
        0, D * 2,
        D, D * 3,
        0, D * 3,
    ],
    'stoneTree': [
        0, D * 2,
        D, D * 2,
        D * .5, D * 3,
    ],
    'stoneLong': [
        0, D * 3,
        D, D * 3,
        D, D * 4,
        0, D * 3,
        D, D * 4,
        0, D * 4,
    ],
    'breakMany': [
        1 * D, 1 * D,
        2 * D, 1 * D,
        2 * D, 2 * D,
        1 * D, 1 * D,
        2 * D, 2 * D,
        1 * D, 2 * D,
    ],
    'emptyTree': [0, 0, 0, 0, 0, 0],
    'empty': [
        0, 0, 
        0, 0, 
        0, 0, 
        0, 0, 
        0, 0, 
        0, 0,
    ],
    'roof': [
        D * 1, D * 3,
        D * 2, D * 3,
        D * 2, D * 4,
        D * 1, D * 3,
        D * 2, D * 4,
        D * 1, D * 4,
    ],
    'roofTree': [
        D * 1, D * 3,
        D * 2, D * 3,
        D * 1.5, D * 4,
    ],
}

const S = 0.25
export const UV_EMPTY: number[] = _M.createUv([0, S * 3], [S, S * 3], [S, S * 4], [0, S * 4])
export const COL_EMPTY: number[] = _M.fillColorFace([1, 1, 1])


export const UV_RED: number[] = _M.createUv([S * 2, S * 3], [S * 3, S * 3], [S * 3, S * 4], [S * 2, S * 4])
export const COL_RED: number[] = _M.fillColorFace([1, 0, 0])
export const COL_BLUE: number[] = _M.fillColorFace([.5, .1, 1])

export const UV_NORM: number[] = _M.createUv([S * 1, S * 3], [S * 2, S * 3], [S * 2, S * 4], [S * 1, S * 4])
export const COL_NORM: number[] = _M.fillColorFace([1, 1, 1])
export const COL_NORM_2: number[] = _M.fillColorFace([.7, .6, 1])

export const UV_GRAY: number[] = _M.createUv([S * 3, S * 3], [S * 4, S * 3], [S * 4, S * 4], [S * 3, S * 4])
export const COL_GRAY: number[] = _M.fillColorFace([.7, .7, 1])

export const UV_GRID: number[] = _M.createUv([0, S * 2], [S * 1, S * 2], [S * 1, S * 3], [0, S * 3])
export const COL_GRID: number[] = _M.fillColorFace([.7, 1, .7])

export const UV_GRID_C: number[] = _M.createUv([S, S * 2], [S * 2, S * 2], [S * 2, S * 3], [S, S * 3])
export const COL_GRID_C = COL_GRID

export const UV_HT: number[] = _M.createUv([S * 2, S * 2], [S * 3, S * 2], [S * 3, S * 3], [S * 2, S * 3])
export const COL_HT: number[] = _M.fillColorFace([1, 1, 1])

export const COL_GOLD = _M.fillColorFace([1, 1, 0])
export const COL_BLACK = _M.fillColorFace([0.5, 0.5, 1])