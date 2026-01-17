import { _M, A2, A3 } from "../_m"
import { tileMapWall } from '../tileMapWall'
import { IArrayForBuffers } from "types/GeomTypes"
import { Root } from "index"
import { COLOR_BLUE } from "constants/CONSTANTS"
import { T_ROOM } from "entityLab01/Lab"
import * as THREE from "three" 

// const S = 0.3
const S = .3

enum I_TypeSeg {
    STAIR, FLOOR
}

type I_Seg = {
    p0: THREE.Vector3,
    type: I_TypeSeg
}

const MIN_SEG = 20
const MAX_SEG = 30
const MIN_STAIR_LEN = 4
const MAX_STAIR_LEN = 10



export const createLongWay = (point0: A3 = [0, 0, 0], point1: A3 = [100, 0, 0], root: Root): IArrayForBuffers => {
    const segments = []

    const s = new THREE.Vector3().fromArray(point0)
    const e = new THREE.Vector3().fromArray(point1)

    const curP = new THREE.Vector3().copy(s)
    const curDir = new THREE.Vector3().subVectors(e, s).normalize()

    const sL = _M.createLabel('s', [0, 0, 1], 10)
    sL.position.set(s.x, s.y, s.z)
    root.studio.add(sL)

    const eL = _M.createLabel('e', [0, 0, 1], 10)
    eL.position.set(e.x, e.y, e.z)
    root.studio.add(eL)

    let iterate = 1000
    while (iterate > 0) {
        --iterate

        const type = iterate % 2 ? I_TypeSeg.STAIR : I_TypeSeg.FLOOR

        let newDir
        let newDist
        let newP
        let w = Math.random() * 5 + 5 

        const eDist = curP.clone().setY(0).distanceTo(e)
        if (eDist < MAX_SEG) {
            newDist = eDist
            newDir = e.clone().sub(curP).normalize()
            newP = e.clone()

            iterate = 0
        } else {
            newDist = Math.random() * (MAX_SEG - MIN_SEG) + MIN_SEG
            newDir = e.clone().sub(curP).setY(0).normalize().applyAxisAngle(
                new THREE.Vector3(0, 1, 0), 
                (Math.random() - .5) * Math.PI * .7
            )
            newP = newDir.clone().multiplyScalar(newDist).add(curP)

            if (type === I_TypeSeg.STAIR) {
                const newY = (Math.random() - .5) * 30
                newP.setY(newY)
                w = 3
            }
        }

        segments.push({ 
            p0: curP.clone(), p1: newP, dir: newDir.clone(), w,
            type 
        })

        curP.copy(newP)
        curDir.copy(newDir)
    }

    segments.forEach((s, i) => {
        const l = _M.createLabel('p0_' + i, [1, 0, 0], 4)
        l.position.set(s.p0.x, s.p0.y, s.p0.z)
        root.studio.add(l)

        const l1 = _M.createLabel('p1_' + i, [1, 0, 0], 4)
        l1.position.set(s.p1.x, s.p1.y + .5, s.p1.z)
        root.studio.add(l1)
    })






    console.log(segments)

    const v: number[] = []
    const c: number[] = []
    const uv: number[] = []
    const vCollide: number[] = []

    return { v, uv, c, vCollide }
}



    // // const l0 = _M.createLabel('point', [1, 0, 0], 1)
    // // l0.position.set(...point0)
    // // root.studio.add(l0)

    // // const l1 = _M.createLabel('point_1', [1, 0, 0], 1)
    // // l1.position.set(...point1)
    // // root.studio.add(l1)

    // // perimeter
    // const p0: A3 = [
    //     point0[0] + Math.cos(dir0) * w * .5,
    //     point0[1],
    //     point0[2] + Math.sin(dir0) * w * .5
    // ]
    // const p1: A3 = [
    //     point1[0] + Math.cos(dir1) * w * .5,
    //     point1[1],
    //     point1[2] + Math.sin(dir1) * w * .5
    // ]
    // const p2: A3 = [
    //     point1[0] - Math.cos(dir1) * w * .5,
    //     point1[1],
    //     point1[2] - Math.sin(dir1) * w * .5
    // ]
    // const p3: A3 = [
    //     point0[0] - Math.cos(dir0) * w * .5,
    //     point0[1],
    //     point0[2] - Math.sin(dir0) * w * .5
    // ]

    // const v: number[] = []
    // const c: number[] = []
    // const uv: number[] = []
    // const vCollide: number[] = []

    // const countD = Math.ceil(d / S)
    // const countW = Math.ceil(w / S)

    // const p0_p1: THREE.Vector3[] = []
    // const p3_p2: THREE.Vector3[] = []

    // // divide front\back lines
    // for (let i = 0; i < (countD + 1); ++i) {
    //     const cur = i / countD
        
    //     p0_p1.push(new THREE.Vector3(
    //         p0[0] * (1 - cur) + p1[0] * cur, 
    //         p0[1], 
    //         p0[2] * (1 - cur) + p1[2] * cur
    //     ))
    //     p3_p2.push(new THREE.Vector3(
    //         p3[0] * (1 - cur) + p2[0] * cur, 
    //         p3[1], 
    //         p3[2] * (1 - cur) + p2[2] * cur
    //     ))
    // }

    // // fill tiles full perimeter
    // for (let i = 1; i < p0_p1.length; ++i) {
    //     for (let j = 1; j < countW; ++j) {
    //         const p0 = p0_p1[i - 1].clone().sub(p3_p2[i - 1]).multiplyScalar(j / countW).add(p3_p2[i - 1])
    //         const p1 = p0_p1[i].clone().sub(p3_p2[i]).multiplyScalar(j / countW).add(p3_p2[i])
    //         const p2 = p0_p1[i].clone().sub(p3_p2[i]).multiplyScalar((j - 1) / countW).add(p3_p2[i])
    //         const p3 = p0_p1[i - 1].clone().sub(p3_p2[i - 1]).multiplyScalar((j - 1) / countW).add(p3_p2[i - 1])

    //         const _v = _M.createPolygon(p0.toArray(), p1.toArray(), p2.toArray(), p3.toArray())
    //         v.push(..._v)
    //         c.push(..._M.fillColorFace([1, 1, 1]))
    //         uv.push(..._M.createUv([0, 0], [1, 0], [1, 1], [0, 1]))
    //     }
    // }
    
    // const _vCollide = _M.createPolygon(p0, p1, p2, p3)
    // vCollide.push(..._vCollide) 