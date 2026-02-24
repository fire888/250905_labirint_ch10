import { _M } from "../_m"
import { IArrayForBuffers } from "types/GeomTypes"
import { Root } from "index"
import { UV_NORM, COL_NORM, UV_GRAY, COL_GRAY, UV_GRID, UV_GRID_C, UV_EMPTY, COL_BLUE, COL_GRID, 
    COL_GOLD, COL_BLACK,
    COL_GRID_C,
    UV_RED
 } from "../tileMapWall"


//export const createArc00 = (w: number = 1, d: number = 20, root: Root): IArrayForBuffers => {
export const createArc00 = (w: number = 1, d: number = 20): IArrayForBuffers => {
    const v: number[] = []
    const c: number[] = []
    const uv: number[] = []

    const S = .8
    const wP = .1
    const hP = .7

    const TYPE = Math.random() < .5 ? 'CIRCLE' : 'CROSS'

    { // arc
        const arrPoints = []
        let currAng = Math.PI * .5
        const maxAngle = Math.PI * 0.85
        const count = Math.ceil(w / S)
        const stepAngle = (maxAngle - currAng) / count

        while (currAng <= maxAngle) {
            const newP = [Math.cos(currAng), Math.sin(currAng)]
            arrPoints.push(newP)
            currAng += stepAngle
        }
    
        const lastP = arrPoints[arrPoints.length - 1]
        const scaleX = Math.abs(w / lastP[0])
        const startY: number = (lastP[1]) * scaleX

        const DZ = -d
        const countZ = Math.abs(Math.ceil(DZ / S))
        const stepD = Math.abs(DZ / countZ)

        const ROOF_H = .25

        for (let i = 1; i < arrPoints.length; ++i) {
            const prev = arrPoints[i - 1]
            const curr = arrPoints[i]

            for (let j = 1; j < countZ + 1; ++j) {
                // bottom
                const _v = _M.createPolygon(
                    [prev[0] * scaleX, prev[1] * scaleX, DZ + j * stepD],
                    [curr[0] * scaleX, curr[1] * scaleX, DZ + j * stepD],
                    [curr[0] * scaleX, curr[1] * scaleX, DZ + (j - 1) * stepD],
                    [prev[0] * scaleX, prev[1] * scaleX, DZ + (j - 1) * stepD],
                )
                v.push(..._v)
                if (j === 1 || j === countZ) {
                    c.push(...COL_NORM)
                    uv.push(...UV_RED)
                } else {
                    if (TYPE === 'CIRCLE') {
                        if (Math.random() < .8) {
                            uv.push(...UV_GRID_C) 
                        } else {
                            uv.push(...UV_GRID)
                        }
                        c.push(...COL_BLACK)
                    } else if (TYPE === 'CROSS') {
                        if (Math.random() < .95) {
                            uv.push(...UV_GRID) 
                        } else {
                            uv.push(...UV_GRID_C)
                        }
                        c.push(...COL_BLACK)
                    }
                }

                // top
                const _vt = _M.createPolygon(
                    [prev[0] * scaleX, prev[1] * scaleX + ROOF_H, DZ + (j - 1) * stepD],
                    [curr[0] * scaleX, curr[1] * scaleX + ROOF_H, DZ + (j - 1) * stepD],
                    [curr[0] * scaleX, curr[1] * scaleX + ROOF_H, DZ + (j) * stepD],
                    [prev[0] * scaleX, prev[1] * scaleX + ROOF_H, DZ + (j) * stepD],
                )
                v.push(..._vt)
                c.push(...COL_GRAY)
                uv.push(...UV_GRID)

                // left
                if (i === arrPoints.length - 1) {
                    const _vl = _M.createPolygon(
                        [curr[0] * scaleX, curr[1] * scaleX, DZ + (j - 1) * stepD],
                        [curr[0] * scaleX, curr[1]* scaleX, DZ + (j) * stepD],
                        [curr[0] * scaleX, curr[1]* scaleX + ROOF_H, DZ + (j) * stepD],
                        [curr[0] * scaleX, curr[1]* scaleX + ROOF_H, DZ + (j - 1) * stepD],
                    )
                    v.push(..._vl)
                    c.push(...COL_GRAY)
                    uv.push(...UV_EMPTY)
                }

            }

            // fill front
            const _v = _M.createPolygon(
                [curr[0] * scaleX, curr[1]* scaleX, 0],
                [prev[0] * scaleX, prev[1]* scaleX, 0],
                [prev[0] * scaleX, prev[1]* scaleX + ROOF_H, 0],
                [curr[0] * scaleX, curr[1]* scaleX + ROOF_H, 0],
            )
            v.push(..._v)
            c.push(...COL_NORM)
            uv.push(...UV_EMPTY)

            // fill back
            const _vb = _M.createPolygon(
                [prev[0] * scaleX, prev[1]* scaleX, DZ],
                [curr[0] * scaleX, curr[1]* scaleX, DZ],
                [curr[0] * scaleX, curr[1]* scaleX + ROOF_H, DZ],
                [prev[0] * scaleX, prev[1]* scaleX + ROOF_H, DZ],
            )
            v.push(..._vb)
            c.push(...COL_NORM)
            uv.push(...UV_EMPTY)
        }
        _M.translateVertices(v, 0, -startY + hP, 0)
    }

    { // sides balks
        { // front
            const _v = _M.createPolygon(
                [-w - wP, 0, 0],
                [-w + wP, 0, 0],
                [-w + wP, hP, 0],
                [-w - wP, hP, 0],
            )
            v.push(..._v)
            c.push(...COL_NORM)
            uv.push(...UV_NORM)
        }

        { // back
            const _v = _M.createPolygon(
                [-w + wP, 0, -d],
                [-w - wP, 0, -d],
                [-w - wP, hP, -d],
                [-w + wP, hP, -d],
            )
            v.push(..._v)
            c.push(...COL_NORM)
            uv.push(...UV_NORM)
        }

        const countZ = Math.ceil(d / S)
        const stepZ = d / countZ

        for (let i = 1; i < countZ + 1; ++i) {
            // right
            const _v = _M.createPolygon(
                [-w + wP, 0, -d + stepZ * i],
                [-w + wP, 0, -d + stepZ * (i - 1)],
                [-w + wP, hP, -d + stepZ * (i - 1)],
                [-w + wP, hP, -d + stepZ * i],
            )
            v.push(..._v)
            c.push(...COL_NORM)
            uv.push(...UV_NORM)

            // left
            const _v2 = _M.createPolygon(
                [-w - wP, 0, -d + stepZ * (i - 1)],
                [-w - wP, 0, -d + stepZ * i],
                [-w - wP, hP, -d + stepZ * i],
                [-w - wP, hP, -d + stepZ * (i - 1)],
            )
            v.push(..._v2)
            c.push(...COL_NORM)
            uv.push(...UV_NORM)

            // bottom
            const _vb = _M.createPolygon(
                [-w + wP, 0, -d + stepZ * i],
                [-w - wP, 0, -d + stepZ * i],
                [-w - wP, 0, -d + stepZ * (i - 1)],
                [-w + wP, 0, -d + stepZ * (i - 1)],
            )
            v.push(..._vb)
            c.push(...COL_NORM)
            uv.push(...UV_EMPTY)
        }
    }




    _M.appendMirrorX(v, c, uv)

    return { v, c, uv }
}