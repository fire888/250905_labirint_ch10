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

const S = .3

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

export const createHelix00 = (isConsole: boolean = false): IArrayForBuffers => {
    const v: number[] = []
    const c: number[] = []
    const uv: number[] = []
    const vCollide: number[] = []

    const clockDir: number = Math.random() < .5 ? 1 : -1 

    const rM = .05 + Math.random() * .2
    const rI = Math.max(rM * .5, 0.02)

    const vR = new THREE.Vector3(rM, 1, rM)
    const vR_0 = new THREE.Vector3(.2, 1, .2)

    const vR_2 = new THREE.Vector3(rI, 1, rI)
    const vDir = new THREE.Vector3(0, 0, clockDir)
    const addY = new THREE.Vector3(0, .02, 0)
    const heightS = new THREE.Vector3(0, .1, 0)
    const addAngle = Math.PI * .2 * clockDir

    const H = 4
    const isSpherize = Math.random() < .5

    while (vDir.y < H) {

        let phase = Math.abs(Math.cos((vDir.y / H) * Math.PI))
        if (isConsole) console.log('phase', phase)
        if (isSpherize) {
            phase = Math.sin((vDir.y / H) * Math.PI)
        }
        phase = Math.max(.2, phase)

        const _vR = vR.clone().multiplyScalar(phase).setY(1)

        const vPos0 = vDir.clone().multiply(_vR)
        const vDirNext = vDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), addAngle).add(addY)
        const vPos1 = vDirNext.clone().multiply(_vR)
        const vPos2 = vPos1.clone().add(heightS)
        const vPos3 = vPos0.clone().add(heightS)

        const vPos0_0 = vPos0.clone().multiply(vR_0)
        const vPos1_0 = vPos1.clone().multiply(vR_0)
        const vPos2_0 = vPos2.clone().multiply(vR_0)
        const vPos3_0 = vPos3.clone().multiply(vR_0)

        { // front

            const _v = clockDir > 0 
                ? _M.createPolygonV(vPos0, vPos1, vPos2, vPos3) 
                : _M.createPolygonV(vPos3, vPos2, vPos1, vPos0)
            v.push(..._v)
            c.push(...COL_NORM)
            if (Math.random() < .9) {
                uv.push(...UV_EMPTY)
            } else {
                uv.push(...UV_GRAY)
            }
        }

        // top

        { 
            const _v = clockDir > 0 
                ? _M.createPolygonV(vPos3, vPos2, vPos2_0, vPos3_0)
                : _M.createPolygonV(vPos3_0, vPos2_0, vPos2, vPos3)
            v.push(..._v)
            c.push(...COL_NORM)
            uv.push(...UV_EMPTY)
        }

        // bottom
        { 
            const _v = clockDir > 0 
                ? _M.createPolygonV(vPos1, vPos0, vPos0_0, vPos1_0) 
                : _M.createPolygonV(vPos1_0, vPos0_0, vPos0, vPos1)
            v.push(..._v)
            c.push(...COL_NORM)
            uv.push(...UV_EMPTY)
        }
        // back
        { 
            const _v = clockDir > 0 
                ? _M.createPolygonV(vPos3_0, vPos2_0, vPos1_0, vPos0_0) 
                : _M.createPolygonV(vPos0_0, vPos1_0, vPos2_0, vPos3_0)
            v.push(..._v)
            c.push(...COL_RED)
            uv.push(...UV_EMPTY)
        }

        // back

        // const l = _M.createLabel(i.toString(), [0, 0, 1], .5)
        // l.position.set(vPos0.x, vPos0.y, vPos0.z)
        // root.studio.add(l)  

        vDir.copy(vDirNext)
    }

    return { v, uv, c, vCollide }
}