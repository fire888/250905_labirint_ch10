import { _M, A2, A3 } from "../_m"
import { tileMapWall } from '../tileMapWall'
import { IArrayForBuffers } from "types/GeomTypes"
import { Root } from "index"
import { COLOR_BLUE } from "constants/CONSTANTS"
import { T_ROOM } from "entityLab01/Lab"
import * as THREE from "three" 

// const S = 0.3
const S = .3

export const createFloor00 = (floor: T_ROOM, root: Root): IArrayForBuffers => {
    const { d, w, point0, point1, dir0, dir1 } = floor

    // const l0 = _M.createLabel('point', [1, 0, 0], 1)
    // l0.position.set(...point0)
    // root.studio.add(l0)

    // const l1 = _M.createLabel('point_1', [1, 0, 0], 1)
    // l1.position.set(...point1)
    // root.studio.add(l1)

    // perimeter
    const p0: A3 = [
        point0[0] + Math.cos(dir0) * w * .5,
        point0[1],
        point0[2] + Math.sin(dir0) * w * .5
    ]
    const p1: A3 = [
        point1[0] + Math.cos(dir1) * w * .5,
        point1[1],
        point1[2] + Math.sin(dir1) * w * .5
    ]
    const p2: A3 = [
        point1[0] - Math.cos(dir1) * w * .5,
        point1[1],
        point1[2] - Math.sin(dir1) * w * .5
    ]
    const p3: A3 = [
        point0[0] - Math.cos(dir0) * w * .5,
        point0[1],
        point0[2] - Math.sin(dir0) * w * .5
    ]

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
            p0[0] * (1 - cur) + p1[0] * cur, 
            p0[1], 
            p0[2] * (1 - cur) + p1[2] * cur
        ))
        p3_p2.push(new THREE.Vector3(
            p3[0] * (1 - cur) + p2[0] * cur, 
            p3[1], 
            p3[2] * (1 - cur) + p2[2] * cur
        ))
    }

    // fill tiles full perimeter
    for (let i = 1; i < p0_p1.length; ++i) {
        for (let j = 1; j < countW; ++j) {
            const p0 = p0_p1[i - 1].clone().sub(p3_p2[i - 1]).multiplyScalar(j / countW).add(p3_p2[i - 1])
            const p1 = p0_p1[i].clone().sub(p3_p2[i]).multiplyScalar(j / countW).add(p3_p2[i])
            const p2 = p0_p1[i].clone().sub(p3_p2[i]).multiplyScalar((j - 1) / countW).add(p3_p2[i])
            const p3 = p0_p1[i - 1].clone().sub(p3_p2[i - 1]).multiplyScalar((j - 1) / countW).add(p3_p2[i - 1])

            const _v = _M.createPolygon(p0.toArray(), p1.toArray(), p2.toArray(), p3.toArray())
            v.push(..._v)
            c.push(..._M.fillColorFace([1, 1, 1]))
            uv.push(..._M.createUv([0, 0], [1, 0], [1, 1], [0, 1]))
        }
    }
    
    const _vCollide = _M.createPolygon(p0, p1, p2, p3)
    vCollide.push(..._vCollide) 

    return { v, uv, c, vCollide }
}