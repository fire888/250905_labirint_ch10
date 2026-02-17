import { _M, A2, A3 } from "../_m"
import { IArrayForBuffers } from "types/GeomTypes"
import { Root } from "index"
import { UV_NORM, COL_NORM, UV_GRAY, COL_GRAY } from "../tileMapWall"


const createSingle = (h: number, w: number = 20): IArrayForBuffers => {
    const v: number[] = []
    const c: number[] = []
    const uv: number[] = []

    let currH = 0

    while (currH < h) {
        const newH = currH + Math.random() + 2 * (currH / h) + .5

        const p = 1 - currH / h
        const wS = p * w

        const bwl = -wS + (Math.random() -.5) * 5 * (1 - currH / h)
        const twl = -wS - (Math.random() - .5) * 5 * (1 - currH / h)

        const bwr = wS + (Math.random() - .5) * 5 * (1 - currH / h)
        const twr = wS + (Math.random() - .5) * 5 * (1 - currH / h)
        

        const _v = _M.createPolygon(
            [bwl, currH, 0],
            [bwr, currH, 0],
            [twr, newH - p + .2, 0],
            [twl, newH - p + .2, 0],
        )
        v.push(..._v)
        c.push(...COL_NORM)
        uv.push(...UV_NORM)
        currH = newH
    }

    return { v, c, uv }
}

const createGround = (): IArrayForBuffers => {
    const v: number[] = []
    const c: number[] = []
    const uv: number[] = []

    const N = 50
    const lh = .5
    const hStep = .6

    let pT: A3 = [0, 0, 0]
    let pB: A3 = [0, 0, 0]

    for (let i = 0; i < N + 10; ++i) {
        const absX = Math.sin(i / N * Math.PI * .5) * 75 + Math.random() * 20
        const signX = Math.abs(i % 2) > 0 ? -1 : 1

        const hAdd = -Math.random() * 2 - 10

        let p0: A3, p1: A3, p2: A3, p3: A3
        if (signX > 0) {
            p0 = pB
            p1 = [absX, i * hStep + hAdd, 0]
            p2 = [absX, i * hStep + lh + hAdd, 0]
            p3 = pT

            pT = p2
            pB = p1
        }
        if (signX < 0) {
            p0 = [-absX, i * hStep + hAdd, 0]
            p1 = pB
            p2 = pT
            p3 = [-absX, i * hStep + lh + hAdd, 0]

            pT = p3
            pB = p0
        }

        const _v = _M.createPolygon(p0, p1, p2, p3)
        v.push(..._v)
        c.push(...COL_NORM)
        uv.push(...UV_NORM)
    }

    return { v, c, uv }
}

export const createTowerSilhouette = ( root: Root): IArrayForBuffers => {
    const v: number[] = []
    const c: number[] = []
    const uv: number[] = []

    for (let i = 0; i < 7; ++i) { // towers
        const r = createSingle(50 + Math.random() * 300, Math.random() * 10 + 2)
        _M.translateVertices(r.v, Math.random() * 75 - 37.5, 0, 0)
        _M.fill(r.v, v)
        _M.fill(r.c, c)
        _M.fill(r.uv, uv)
    }

    { // ground
        const r = createGround()
        _M.fill(r.v, v)
        _M.fill(r.c, c)
        _M.fill(r.uv, uv)
    }

    return { v, c, uv }
}