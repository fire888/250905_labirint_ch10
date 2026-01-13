import { _M } from "../_m"
import { tileMapWall } from '../tileMapWall'
import { IArrayForBuffers } from "types/GeomTypes"
import { Root } from "index"
import { COLOR_BLUE } from "constants/CONSTANTS"

export const createColumn01 = (w: number, h: number, n: number = 8): IArrayForBuffers => {
    const v: number[] = []
    const c: number[] = []
    const uv: number[] = []

    {
        const r = .3
        const n = 8
        const h = 0.3

        const __v: number[] = []
        const __c: number[] = []
        const __uv: number[] = []

        for (let i = 0; i < n; ++i) {
            let prev = i / n
            let cur = (i - 1) / n

            if (i === 0) cur = (n - 1) / n

            const _v = _M.createPolygon(
                [Math.cos(prev * Math.PI * 2) * r, 0, Math.sin(prev * Math.PI * 2) * r],
                [Math.cos(cur * Math.PI * 2) * r, 0, Math.sin(cur * Math.PI * 2) * r],
                [Math.cos(cur * Math.PI * 2) * r, h, Math.sin(cur * Math.PI * 2) * r],
                [Math.cos(prev * Math.PI * 2) * r, h, Math.sin(prev * Math.PI * 2) * r],
            )

            __v.push(..._v)
            __c.push(..._M.fillColorFace([1, 1, 1]))
            __uv.push(..._M.createUv([0, 0], [1, 0], [1, 1], [0, 1]))
        }

        for (let i = 0; i < 30; ++i) {
            const _vLoc = [...__v]
            _M.translateVertices(_vLoc, 0, i * h, 0)

            v.push(..._vLoc)
            c.push(...__c)
            uv.push(...__uv)
        }
    }

    return { v, c, uv }
}