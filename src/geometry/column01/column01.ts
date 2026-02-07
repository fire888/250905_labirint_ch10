import { _M } from "../_m"
import { IArrayForBuffers } from "types/GeomTypes"
import { Root } from "index"
import { NORM, GRAY, BLACK } from "../tileMapWall"


export const createColumn01 = (w: number, h: number, n: number = 8): IArrayForBuffers => {
    const v: number[] = []
    const c: number[] = []
    const uv: number[] = []

    {
        let rS1 = .3
        let rS2 = .3
        const nS = 8
        const hS = 0.3

        for (let i = 0; i < 30; ++i) {
            rS1 = rS2
            if (i % 2 === 0) {
                rS2 = (.2 + Math.random() * .5) * .3
            }

            const __v = []

            for (let i = 0; i < nS; ++i) {

                let prev = i / nS
                let cur = (i - 1) / nS

                if (i === 0) cur = (nS - 1) / nS

                const _v = _M.createPolygon(
                    [Math.cos(prev * Math.PI * 2) * rS1, 0, Math.sin(prev * Math.PI * 2) * rS1],
                    [Math.cos(cur * Math.PI * 2) * rS1, 0, Math.sin(cur * Math.PI * 2) * rS1],
                    [Math.cos(cur * Math.PI * 2) * rS2, hS, Math.sin(cur * Math.PI * 2) * rS2],
                    [Math.cos(prev * Math.PI * 2) * rS2, hS, Math.sin(prev * Math.PI * 2) * rS2],
                )

                __v.push(..._v)

                const ran = Math.random()
                if (ran < .05) {
                    uv.push(..._M.createUv(BLACK[0], BLACK[1], BLACK[0], BLACK[1]))
                } else if (ran < .2) {
                    uv.push(..._M.createUv(GRAY[0], GRAY[1], GRAY[2], GRAY[3]))
                } else {
                    uv.push(..._M.createUv(NORM[0], NORM[1], NORM[2], NORM[3]))
                }

                c.push(..._M.fillColorFace([1, 1, 1]))
            }

            _M.translateVertices(__v, 0, i * hS, 0)
            v.push(...__v)
        }
    }

    return { v, c, uv }
}