import { _M, A2, A3 } from "../_m"
import { tileMapWall } from '../tileMapWall'
import { IArrayForBuffers, T_ROOM } from "types/GeomTypes"
import { Root } from "index"
import { COLOR_BLUE } from "constants/CONSTANTS"
import * as THREE from "three" 
import { BLACK, GRAY, NORM } from "../tileMapWall"

// const S = 0.3
const S = .3

export const createFloor00 = (floor: T_ROOM, root: Root): IArrayForBuffers => {
    const { d, w, p0, p1, p2, p3, dir0, dir1 } = floor

    const v: number[] = []
    const c: number[] = []
    const uv: number[] = []
    const vCollide: number[] = []

    const countD = Math.ceil(d / S)
    const countW = Math.ceil(w / S)

    const p0_p1: THREE.Vector3[] = []
    const p3_p2: THREE.Vector3[] = []

    // divide front\back lines
    for (let i = 0; i < (countD + 1); ++i) {
        const cur = i / countD
        
        p0_p1.push(new THREE.Vector3(
            p0.x * (1 - cur) + p1.x * cur, 
            p0.y * (1 - cur) + p1.y * cur, 
            p0.z * (1 - cur) + p1.z * cur
        ))
        p3_p2.push(new THREE.Vector3(
            p3.x * (1 - cur) + p2.x * cur, 
            p3.y * (1 - cur) + p2.y * cur,  
            p3.z * (1 - cur) + p2.z * cur
        ))
    }

    // fill tiles full perimeter
    for (let i = 1; i < p0_p1.length; ++i) {
        for (let j = 1; j < countW + 1; ++j) {
            const p0 = p0_p1[i - 1].clone().sub(p3_p2[i - 1]).multiplyScalar(j / countW).add(p3_p2[i - 1])
            const p1 = p0_p1[i].clone().sub(p3_p2[i]).multiplyScalar(j / countW).add(p3_p2[i])
            const p2 = p0_p1[i].clone().sub(p3_p2[i]).multiplyScalar((j - 1) / countW).add(p3_p2[i])
            const p3 = p0_p1[i - 1].clone().sub(p3_p2[i - 1]).multiplyScalar((j - 1) / countW).add(p3_p2[i - 1])

            const _v = _M.createPolygon(p0.toArray(), p1.toArray(), p2.toArray(), p3.toArray())
            v.push(..._v)
            c.push(..._M.fillColorFace([1, 1, 1]))

            const ran = Math.random()
            if (ran < .01) {
                uv.push(..._M.createUv(BLACK[0], BLACK[1], BLACK[2], BLACK[3]))
            } else if (ran < .02) {
                uv.push(..._M.createUv(GRAY[0], GRAY[1], GRAY[2], GRAY[3]))
            } else {
                if (i === 1 || j === 1 || i === p0_p1.length - 1 || j === countW) {
                    uv.push(..._M.createUv(BLACK[0], BLACK[1], BLACK[2], BLACK[3]))
                } else {
                    uv.push(..._M.createUv(NORM[0], NORM[1], NORM[2], NORM[3]))
                }
            }
        }
    }
    
    const _vCollide = _M.createPolygon(p0.toArray(), p1.toArray(), p2.toArray(), p3.toArray())
    vCollide.push(..._vCollide) 

    return { v, uv, c, vCollide }
}