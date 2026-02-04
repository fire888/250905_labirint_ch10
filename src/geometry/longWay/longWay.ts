import { _M, A2, A3 } from "../_m"
import { tileMapWall } from '../tileMapWall'
import { IArrayForBuffers, T_ROOM } from "types/GeomTypes"
import { Root } from "index"
import { COLOR_BLUE } from "constants/CONSTANTS"
import * as THREE from "three" 
import { createFloor00 } from "../floor00/floor00"

// const S = 0.3
const S = .3
const STAIR_W = 3 

enum I_TypeSeg {
    FLOOR, STAIR, 
}

type I_Seg = {
    p0: THREE.Vector3,
    type: I_TypeSeg
}

type T_SEGMENT = {
    p0: THREE.Vector3
    p1: THREE.Vector3
    dir: THREE.Vector3
    w: number
    type: I_TypeSeg
}

const MIN_SEG = 20
const MAX_SEG = 30
const MIN_STAIR_LEN = 4
const MAX_STAIR_LEN = 10


const prepareSegments = (point0: A3, point1: A3, root: Root) => {
    const segments: T_SEGMENT[] = []

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

    let iterate = 1001
    while (iterate > 0) {
        --iterate

        const type = iterate % 2 === 0 ? I_TypeSeg.FLOOR : I_TypeSeg.STAIR

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
            if (iterate === 1000) {
                newDir = new THREE.Vector3(1, 0, 0)
            }  else {
                newDir = e.clone().sub(curP).setY(0).normalize().applyAxisAngle(
                    new THREE.Vector3(0, 1, 0), 
                    (Math.random() - .5) * Math.PI * .7
                )
            }

            newDist = Math.random() * (MAX_SEG - MIN_SEG) + MIN_SEG

            newP = newDir.clone().multiplyScalar(newDist).add(curP)

            if (type === I_TypeSeg.STAIR) {
                const newY = Math.max(1, curP.y + (Math.random() - .5) * 30)
                newP.setY(newY)
                w = STAIR_W
            }
        }

        const el: T_SEGMENT = {
            p0: curP.clone(), p1: newP, dir: newDir.clone(), w,
            type 
        } 

        segments.push(el)

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

    return segments
}

const divideStairs = (segmemtsSrc: T_SEGMENT[], root: Root): T_ROOM[] => {
    const segments: T_ROOM[] = []

    let n = 0

    for (let i = 0; i < segmemtsSrc.length; i++) {
        const cur = segmemtsSrc[i]

        if (cur.type === I_TypeSeg.STAIR) {
            const prev = segmemtsSrc[i - 1] ?? null
            const next = segmemtsSrc[i + 1] ?? null

            if (prev && next) {
                const pStairStart = prev.dir.clone().multiplyScalar(cur.w).add(cur.p0)
                const pStairEnd = next.dir.clone().multiplyScalar(-next.w).add(cur.p1)

                const newDir = pStairEnd.clone().sub(pStairStart).setY(0).normalize()

                const dataS: T_ROOM = {
                    d: pStairStart.distanceTo(cur.p0),
                    w: cur.w,
                    point0: cur.p0,
                    point1: pStairStart,
                    dir0: prev.dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5),
                    dir1: newDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5),
                    dir: pStairStart.clone().sub(cur.p0).normalize(),
                    id: n,
                } 
                ++n
                segments.push(dataS)

                const dataForRoom: T_ROOM = {
                    d: pStairEnd.distanceTo(pStairStart),
                    w: cur.w,
                    point0: pStairStart,
                    point1: pStairEnd,
                    dir0: newDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5),
                    dir1: newDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5),
                    dir: newDir,
                    id: n,
                }
                ++n
                segments.push(dataForRoom)

                const dataE: T_ROOM = {
                    d: pStairEnd.distanceTo(cur.p1),
                    w: cur.w,
                    point0: pStairEnd,
                    point1: cur.p1,
                    dir0: newDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5),
                    dir1: next.dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5),
                    dir: cur.p1.clone().sub(pStairEnd).setY(0).normalize(),
                    id: n,
                } 
                ++n
                segments.push(dataE)
            }

    
        } else if (cur.type === I_TypeSeg.FLOOR) {
            const { p0, p1 } = cur

            const vDir = p1.clone().sub(p0).normalize()

            const dataForRoom: T_ROOM = {
                d: p0.distanceTo(p1),
                w: cur.w,
                point0: p0,
                point1: p1,
                dir0: vDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5),
                dir1: vDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5),
                dir: vDir,
                id: n,
            }
            ++n

            segments.push(dataForRoom)
        }
    }

    return segments
}

export const createLongWay = (point0: A3 = [0, 0, 0], point1: A3 = [100, 0, 0], root: Root): IArrayForBuffers => {
    const segments = prepareSegments(point0, point1, root)

    const segments2: T_ROOM[] = divideStairs(segments, root)

    const v: number[] = []
    const c: number[] = []
    const uv: number[] = []
    const vCollide: number[] = []

    segments2.forEach((s: T_ROOM, i) => {
        const r = createFloor00(s, root)
        v.push(...r.v)
        c.push(...r.c)
        uv.push(...r.uv)
        vCollide.push(...r.vCollide)
    })

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