import { _M, A2 } from "../_m"
import { tileMapWall } from '../tileMapWall'
import { IArrayForBuffers } from "types/GeomTypes"
import { Root } from "index"
import { COLOR_BLUE } from "constants/CONSTANTS"

//export const createFloor00 = (perimeter: A2[]): IArrayForBuffers => {

const S = 0.3

export const createFloor00 = (d: number, w: number): IArrayForBuffers => {
    const v: number[] = []
    const c: number[] = []
    const uv: number[] = []
    const vCollide: number[] = [] 
 
    const countX = Math.ceil(d / S)
    const countZ = Math.ceil(w / S)
    const sX = d / countX
    const sZ = w / countZ

    for (let x = 0; x < countX; ++x) {
        for (let z = 0; z < countZ; ++z) {
            const _v = _M.createPolygon(
                [x * sX, 0, z * sZ],
                [x * sX, 0, (z + 1) * sZ],
                [(x + 1) * sX, 0, (z + 1) * sZ],
                [(x + 1) * sX, 0, z * sZ],
            )
            v.push(..._v)
            c.push(..._M.fillColorFace([1, 1, 1]))
            uv.push(..._M.createUv([0, 0], [1, 0], [1, 1], [0, 1]))
        }
    }

    vCollide.push(..._M.createPolygon(
        [0, 0, 0],
        [d, 0, 0],
        [d, 0, w],
        [0, 0, w],
    ))


    return { v, uv, c, vCollide }
}