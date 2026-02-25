import { _M } from "../_m"
import { IArrayForBuffers } from "types/GeomTypes"
import { Root } from "index"
import { UV_NORM, COL_NORM, UV_GRAY, COL_GRAY, 
    UV_RED, COL_RED,
    UV_EMPTY, COL_EMPTY,
    UV_GRID, UV_GRID_C,
    COL_GRID, COL_NORM_2, UV_HT, COL_HT
} from "../tileMapWall"
import * as THREE from 'three'


export const createColumn02 = (w: number = .5, h: number = 2, n: number = 8): IArrayForBuffers => {
    const v: number[] = []
    const c: number[] = []
    const uv: number[] = []

    let mode = 'ARROW'
    const r = Math.random()
    if (r < .33) {
        mode = 'GRID'
    } else if (r < .66) {
        mode = 'HT'
    } else if (r < .8) {
        mode = 'EMPTY'
    }

    {
        const nS = 8

        const points0 = [] 
        const points1 = []
        const v3 = new THREE.Vector3(w + .05, 0, 0)
        const v3_1 = new THREE.Vector3(w, 0, 0)
        for (let i = 0; i < nS; ++i) {
            const vec = v3.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), i / nS * Math.PI * 2) 
            points0.push(vec)
            const vec1 = v3_1.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), i / nS * Math.PI * 2)
            points1.push(vec1)
        }

        for (let i = 0; i < points0.length; i++) { 
            const prev = i - 1 > -1 ? i - 1 : points0.length - 1
            const cur = i

            {
                const pol = _M.createPolygonV(
                    points0[prev].clone().setY(0),
                    points0[cur].clone().setY(0),
                    points0[cur].clone().setY(.1),
                    points0[prev].clone().setY(.1),
                )
                v.push(...pol)
                uv.push(...UV_RED)
                c.push(...COL_RED)
            }

            {
                const pol = _M.createPolygonV(
                    points0[prev].clone().setY(.1),
                    points0[cur].clone().setY(.1),
                    points1[cur].clone().setY(.2),
                    points1[prev].clone().setY(.2),
                )
                v.push(...pol)
                uv.push(...UV_EMPTY)
                c.push(...COL_RED)
            }

            let currentH = .2 
            const hs = .15

            {
                while (currentH < h - .3) {
                    currentH += hs
                    const pol = _M.createPolygonV(
                        points1[prev].clone().setY(currentH - hs),
                        points1[cur].clone().setY(currentH - hs),
                        points1[cur].clone().setY(currentH),
                        points1[prev].clone().setY(currentH),
                    )
                    v.push(...pol)

                    if (mode === 'GRID') { // grid
                        if (Math.random() < .1) { 
                            uv.push(...UV_GRID)
                        } else {
                            uv.push(...UV_GRID_C)
                        }
                    } else if (mode === 'ARROW') { // arrows
                        if (Math.random() < .1) { 
                            uv.push(...UV_GRAY)
                        } else {
                            uv.push(...UV_NORM)
                        }
                    } else if (mode === 'HT') { // HT
                        if (Math.random() < .1) { 
                            uv.push(...UV_RED)
                        } else {
                            uv.push(...UV_HT)
                        }
                    } else if (mode === 'EMPTY') {
                        if (Math.random() < .1) { 
                            uv.push(...UV_EMPTY) 
                        } else {
                            uv.push(...UV_GRAY)
                        }
                    }

                    c.push(...COL_NORM)
                }
            }

            {
                const pol = _M.createPolygonV(
                    points1[prev].clone().setY(currentH),
                    points1[cur].clone().setY(currentH),
                    points0[cur].clone().setY(currentH + .12),
                    points0[prev].clone().setY(currentH + .12),
                )
                v.push(...pol)
                uv.push(...UV_EMPTY)
                c.push(...COL_RED)
            }

            {
                const pol = _M.createPolygonV(
                    points0[prev].clone().setY(currentH + .12),
                    points0[cur].clone().setY(currentH + .12),
                    points0[cur].clone().setY(h),
                    points0[prev].clone().setY(h),
                )
                v.push(...pol)
                uv.push(...UV_RED)
                c.push(...COL_RED)
            }

            v.push(
                points0[prev].x, h, points0[prev].z,
                points0[cur].x, h, points0[cur].z,
                0, h, 0
            )
            uv.push(.55, .55,  .55, .55,  .55, .55)
            c.push(1, 0, 0,  1, 0, 0,   1, 0, 0)
        }
    }

    return { v, c, uv }
}