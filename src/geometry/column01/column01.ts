import { _M } from "../_m"
import { IArrayForBuffers } from "types/GeomTypes"
import { Root } from "index"
import { UV_NORM, COL_NORM, UV_GRAY, COL_GRAY, UV_GRID, UV_GRID_C } from "../tileMapWall"


export const createColumn01 = (w: number = 1, h: number = 20, n: number = 8): IArrayForBuffers => {
    const v: number[] = []
    const c: number[] = []
    const uv: number[] = []

    {
        let rS1 = .3
        let rS2 = .3
        const nS = 8

        let curH = 0
        let i = 0
        while (curH < h) {
            rS1 = rS2
            ++n
            if (i % 2 === 0) {
                rS2 = (.2 + Math.random() * .5) * .3
            }
            const segH = Math.random() * .2 + .2

            const __v = []

            for (let i = 0; i < nS; ++i) {
                let prev = i / nS
                let cur = (i - 1) / nS

                if (i === 0) cur = (nS - 1) / nS

                const _v = _M.createPolygon(
                    [Math.cos(prev * Math.PI * 2) * rS1, 0, Math.sin(prev * Math.PI * 2) * rS1],
                    [Math.cos(cur * Math.PI * 2) * rS1, 0, Math.sin(cur * Math.PI * 2) * rS1],
                    [Math.cos(cur * Math.PI * 2) * rS2, segH, Math.sin(cur * Math.PI * 2) * rS2],
                    [Math.cos(prev * Math.PI * 2) * rS2, segH, Math.sin(prev * Math.PI * 2) * rS2],
                )

                __v.push(..._v)

                const ran = Math.random()
                if (ran < .02) {
                    uv.push(...UV_GRAY)
                    c.push(...COL_GRAY)
                } else if (ran < .04) {
                    uv.push(...UV_GRAY)
                    c.push(...COL_GRAY)
                } else {
                    //uv.push(...UV_NORM)
                    uv.push(...UV_GRID_C)
                    c.push(...COL_NORM)
                }

                // last 
                if (curH + segH > h) {
                    __v.push(
                        Math.cos(prev * Math.PI * 2) * rS2, segH, Math.sin(prev * Math.PI * 2) * rS2,
                        Math.cos(cur * Math.PI * 2) * rS2, segH, Math.sin(cur * Math.PI * 2) * rS2,
                        0, segH, 0
                    )
                    c.push(1, 1, 1, 1, 1, 1, 1, 1, 1)
                    uv.push(.55, .55,  .55, .55,  .55, .55)
                }
            }
            
            _M.translateVertices(__v, 0, curH, 0)
            v.push(...__v)                        
            
            curH += segH
        }
    }

    return { v, c, uv }
}