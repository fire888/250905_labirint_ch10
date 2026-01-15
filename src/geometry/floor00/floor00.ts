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

    const l0 = _M.createLabel('point', [1, 0, 0], 1)
    l0.position.set(point0[0], 0, point0[1])
    root.studio.add(l0)

    const l1 = _M.createLabel('point_1', [1, 0, 0], 1)
    l1.position.set(point1[0], 0, point1[1])
    root.studio.add(l1)

    const p0: A3 = [
        point0[0] + Math.cos(dir0) * w * .5,
        0,
        point0[1] + Math.sin(dir0) * w * .5
    ]

    const l = _M.createLabel('p0', COLOR_BLUE, 1)
    l.position.set(p0[0], 0, p0[2])
    root.studio.add(l)

    const p1: A3 = [
        point1[0] + Math.cos(dir1) * w * .5,
        0,
        point1[1] + Math.sin(dir1) * w * .5
    ]

    const p2: A3 = [
        point1[0] - Math.cos(dir1) * w * .5,
        0,
        point1[1] - Math.sin(dir1) * w * .5
    ]

    const p3: A3 = [
        point0[0] - Math.cos(dir0) * w * .5,
        0,
        point0[1] - Math.sin(dir0) * w * .5
    ]

    const v: number[] = []
    const c: number[] = []
    const uv: number[] = []
    const vCollide: number[] = []

    const countD = Math.ceil(d / S)
    const countW = Math.ceil(w / S)

    const p0_p1: THREE.Vector3[] = []
    const p3_p2: THREE.Vector3[] = []

    for (let i = 0; i < (countD + 1); ++i) {
        const cur = i / countD
        
        p0_p1.push(new THREE.Vector3(
            p0[0] * (1 - cur) + p1[0] * cur, 
            0, 
            p0[2] * (1 - cur) + p1[2] * cur
        ))
        p3_p2.push(new THREE.Vector3(
            p3[0] * (1 - cur) + p2[0] * cur, 
            0, 
            p3[2] * (1 - cur) + p2[2] * cur
        ))
    }

    // p0_p1.forEach((e, i) => {
    //     const l = _M.createLabel(i + '', [1, 1, 1], 1)
    //     l.position.set(e.x, 0, e.z)
    //     root.studio.add(l)
    // })
    // p3_p2.forEach((e, i) => {
    //     const l = _M.createLabel(i + '', [1, 1, 1], 1)
    //     l.position.set(e.x, 0, e.z)
    //     root.studio.add(l)
    // })

    // const p0_p3: THREE.Vector3[] = []
    // const p1_p2: THREE.Vector3[] = []

    // for (let j = 0; j < countW; ++j) {
    //     const cur = j / countW
    //     p0_p3.push(new THREE.Vector3(p0[0] * (1 - cur) + p3[0] * cur, 0, p0[2] * (1 - cur) + p3[2] * cur))
    //     p1_p2.push(new THREE.Vector3(p1[0] * (1 - cur) + p2[0] * cur, 0, p1[2] * (1 - cur) + p2[2] * cur))
    // }

    // p0_p3.forEach((e, i) => {
    //     const l = _M.createLabel(i + '', [1, 1, 1], 1)
    //     l.position.set(e.x, 0, e.z)
    //     root.studio.add(l)
    // })
    // p1_p2.forEach((e, i) => {
    //     const l = _M.createLabel(i + '', [1, 1, 1], 1)
    //     l.position.set(e.x, 0, e.z)
    //     root.studio.add(l)
    // })

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

            //const l = _M.createLabel('+', [1, 1, 1], 1)
            //l.position.set(p0.x, 0, p0.z)
            //root.studio.add(l)
        }
    }
    


    console.log('---------------------------------')




    // const _v = _M.createPolygon(p0, p1, p2, p3)
    // v.push(..._v)
    // c.push(..._M.fillColorFace([1, 1, 1]))
    // uv.push(..._M.createUv([0, 0], [1, 0], [1, 1], [0, 1]))

    const _vCollide = _M.createPolygon(p0, p1, p2, p3)
    vCollide.push(..._vCollide) 

    return { v, uv, c, vCollide }
}