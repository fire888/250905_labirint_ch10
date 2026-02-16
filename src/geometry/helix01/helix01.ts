import { _M, A2, A3 } from "../_m"
import { IArrayForBuffers } from "types/GeomTypes"
import * as THREE from "three" 
import { 
    UV_RED, COL_RED, COL_BLUE,
    UV_GRAY, COL_GRAY, 
    UV_NORM, COL_NORM, COL_NORM_2,
    UV_GRID, UV_GRID_C,
    UV_HT, COL_HT,
    UV_EMPTY
} from "../tileMapWall"
import { Root } from "index"

export type T_Floor = { 
    p0: THREE.Vector3 
    p1: THREE.Vector3
    p2: THREE.Vector3
    p3: THREE.Vector3
    d: number
    w: number
    isFillStart: boolean
    isFillEnd: boolean
}

export const createHelix01  = (H = 8, R: number = 1): IArrayForBuffers => {
    const v: number[] = []
    const c: number[] = []
    const uv: number[] = []
    const vCollide: number[] = [] 

    const vR = new THREE.Vector3(R, 1, R)

    const vDir = new THREE.Vector3(0, 0, 1)
    const heightSeg = new THREE.Vector3(0, .1, 0)
    const addY = new THREE.Vector3(0, .3, 0)
    const addAngle = Math.PI * .02

    while (vDir.y < H) {
        const vDirNext = vDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), addAngle).add(addY)

        const vPos0 = vDir.clone().multiply(vR)
        const vPos1 = vDirNext.clone().multiply(vR)
        const vPos2 = vPos1.clone().add(heightSeg)
        const vPos3 = vPos0.clone().add(heightSeg)

        // back
        { 
            const _v = _M.createPolygonV(vPos3, vPos2, vPos1, vPos0)
            v.push(..._v)
            c.push(...COL_NORM)
            uv.push(...UV_EMPTY)
        }

        vDir.copy(vDirNext)
    }

    return { v, uv, c, vCollide }
}