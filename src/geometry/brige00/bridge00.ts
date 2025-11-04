import { _M } from "../_m"
import { tileMapWall } from '../tileMapWall'
import { IArrayForBuffers } from "types/GeomTypes"
import { Root } from "index"
import { COLOR_BLUE } from "constants/CONSTANTS"

export const createBrige00 = (w: number, h: number, d: number): IArrayForBuffers => {
    const v: number[] = []
    const uv: number[] = []
    const c: number[] = []

    const _v = _M.createPolygon(
        [0, h, d],
        [w, h, d],
        [w, h, -d],
        [0, h, -d],
    )
    v.push(..._v)
    const _c = _M.fillColorFace(COLOR_BLUE)
    c.push(..._c)
    const _uv = tileMapWall.stone
    uv.push(..._uv)

    return { v, uv, c }
}