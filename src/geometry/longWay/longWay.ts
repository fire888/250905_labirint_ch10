import { _M, A2, A3 } from "../_m"
import { tileMapWall } from '../tileMapWall'
import { IArrayForBuffers, T_ROOM } from "types/GeomTypes"
import { Root } from "index"
import { COLOR_BLUE } from "constants/CONSTANTS"
import * as THREE from "three" 
import { createFloor00 } from "../floor00/floor00"
import { createColumn01 } from "../column01/column01";

const STAIR_W = 3 

enum I_TypeSeg {
    FLOOR, STAIR
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

const MIN_SEG = 5
const MAX_SEG = 20

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

        const eDist = curP.clone().setY(0).distanceTo(e.clone().setY(0))
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
                    (Math.random() - .5) * Math.PI * .4
                )
            }

            newDist = Math.random() * (MAX_SEG - MIN_SEG) + MIN_SEG

            newP = newDir.clone().multiplyScalar(newDist).add(curP)

            if (type === I_TypeSeg.STAIR) {
                const newY = Math.max(1, curP.y + (Math.random() - .5) * newDist * .8)
                newP.setY(newY)
                w = 2 + Math.random() * STAIR_W
            }
        }

        const el: T_SEGMENT = { p0: curP.clone(), p1: newP, dir: newDir.clone(), w, type }

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


const checkMinOffset = (prevDir: THREE.Vector3, curDir: THREE.Vector3, w: number): number => { 
    // bottom
    const pp0 = prevDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5).multiplyScalar(w * .5)
    const pp1 = curDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5).multiplyScalar(w * .5)
    const d1 = pp0.distanceTo(pp1)
   
    return d1
    // top
   
    //const pp2 = prevDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5).multiplyScalar(-w * .5)
    //const pp3 = curDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5).multiplyScalar(-w * .5)
    //const d2 = pp2.distanceTo(pp3)
    // dist
    //const d = Math.max(d1, d2) * .5
    //return d
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
                const sDir = cur.dir.clone().add(prev.dir).normalize().divideScalar(2).add(prev.dir)
                const eDir = next.dir.clone().add(cur.dir).normalize().divideScalar(2).add(cur.dir)
                
                const sDist = checkMinOffset(prev.dir, cur.dir, cur.w)
                const pStairStart = sDir.clone().multiplyScalar(sDist).add(cur.p0)

                const eDist = checkMinOffset(cur.dir, next.dir, cur.w) 
                const pStairEnd = eDir.clone().multiplyScalar(-eDist).add(cur.p1)

                const newDir = pStairEnd.clone().sub(pStairStart).setY(0).normalize()

                const dataS: T_ROOM = {
                    d: pStairStart.distanceTo(cur.p0),
                    w: cur.w,
                    point0: cur.p0,
                    point1: pStairStart,
                    dir0: prev.dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5),
                    dir1: newDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5),
                    dir: sDir,
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
                    dir: eDir,
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
        { // columns
            const center = s.point0.clone().add(s.point1.clone().sub(s.point0).multiplyScalar(.5))
            const r0 = createColumn01(1, 1)
            _M.translateVertices(r0.v, center.x, center.y, center.z)
            _M.fill(r0.v, v)
            _M.fill(r0.c, c)
            _M.fill(r0.uv, uv)
        }

        { // floor
            const r = createFloor00(s, root)
            v.push(...r.v)
            c.push(...r.c)
            uv.push(...r.uv)
            vCollide.push(...r.vCollide)
        }
    })

    return { v, uv, c, vCollide }
}
