import { _M, A3 } from "../_m"
import { IArrayForBuffers, T_ROOM } from "types/GeomTypes"
import { Root } from "index"
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

const calcPerimeter = (
    point0: THREE.Vector3, dir0: THREE.Vector3, point1: THREE.Vector3, dir1: THREE.Vector3, w: number
): { p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3 } => {
    const hW = w * .5
    
    const p0 = new THREE.Vector3().copy(dir0).multiplyScalar(-hW).add(point0)
    const p1 = new THREE.Vector3().copy(dir1).multiplyScalar(-hW).add(point1)
    const p2 = new THREE.Vector3().copy(dir1).multiplyScalar(hW).add(point1)
    const p3 = new THREE.Vector3().copy(dir0).multiplyScalar(hW).add(point0)
    
    return { p0, p1, p2, p3 }
}

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
    const pp0 = prevDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5).multiplyScalar(w * .5)
    const pp1 = curDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5).multiplyScalar(w * .5)
    const d1 = pp0.distanceTo(pp1)
    return d1
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

                {
                    const dir0 = prev.dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5)
                    const dir1 = newDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5)
                    const points = calcPerimeter(cur.p0, dir0, pStairStart, dir1, cur.w)

                    const dataS: T_ROOM = {
                        d: pStairStart.distanceTo(cur.p0),
                        w: cur.w,
                        axisP0: cur.p0,
                        axisP1: pStairStart,
                        dir0,
                        dir1,
                        dir: sDir,
                        id: n,
                        ...points
                    } 
                    ++n
                    segments.push(dataS)
                }

                {
                    const dir0 = newDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5)
                    const dir1 = newDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5)
                    const points = calcPerimeter(pStairStart, dir0, pStairEnd, dir1, cur.w)

                    const dataForRoom: T_ROOM = {
                        d: pStairEnd.distanceTo(pStairStart),
                        w: cur.w,
                        axisP0: pStairStart,
                        axisP1: pStairEnd,
                        dir0: newDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5),
                        dir1: newDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5),
                        dir: newDir,
                        id: n,
                        ...points
                    }
                    ++n
                    segments.push(dataForRoom)
                }

                {
                    const dir0 = newDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5)
                    const dir1 = next.dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5)
                    const points = calcPerimeter(pStairEnd, dir0, cur.p1, dir1, cur.w)
                    
                    const dataE: T_ROOM = {
                        d: pStairEnd.distanceTo(cur.p1),
                        w: cur.w,
                        axisP0: pStairEnd,
                        axisP1: cur.p1,
                        dir0: newDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5),
                        dir1: next.dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5),
                        dir: eDir,
                        id: n,
                        ...points
                    } 
                    ++n
                    segments.push(dataE)
                }
            }

    
        } else if (cur.type === I_TypeSeg.FLOOR) {
            const { p0, p1 } = cur

            const vDir = p1.clone().sub(p0).normalize()

            const dir0 = vDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5)
            const dir1 = vDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5)
            const points = calcPerimeter(p0, dir0, p1, dir1, cur.w)

            const dataForRoom: T_ROOM = {
                d: p0.distanceTo(p1),
                w: cur.w,
                axisP0: p0,
                axisP1: p1,
                dir0: vDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5),
                dir1: vDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5),
                dir: vDir,
                id: n,
                ...points
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
        //if (i === 0) 
        { // columns
            const center = s.axisP0.clone().add(s.axisP1.clone().sub(s.axisP0).multiplyScalar(.5))
            
            const r0 = createColumn01(1, 2)

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

        // perimeter vertical
        const hPL = .3

        { // left
            const _v = _M.createPolygonV(
                s.p0.clone().setY(s.p0.y - hPL), 
                s.p1.clone().setY(s.p1.y - hPL), 
                s.p1,
                s.p0
            )
            _M.fill(_v, v)
            _M.fill([
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
            ], c)
            _M.fill([
                0, 0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 0
            ], uv)
        }

        { // right
            const _v = _M.createPolygonV(
                s.p2.clone().setY(s.p2.y - hPL), 
                s.p3.clone().setY(s.p3.y - hPL), 
                s.p3,
                s.p2
            )
            _M.fill(_v, v)
            _M.fill([
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
            ], c)
            _M.fill([
                0, 0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 0
            ], uv)
        }

        { // фронт
            const _v = _M.createPolygonV(
                s.p3.clone().setY(s.p3.y - hPL), 
                s.p0.clone().setY(s.p0.y - hPL), 
                s.p0.clone(),
                s.p3.clone() 
            )
            _M.fill(_v, v)
            _M.fill([
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
            ], c)
            _M.fill([
                0, 0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 0
            ], uv)
        }

        { // бэк
            const _v = _M.createPolygonV(
                s.p1.clone().setY(s.p1.y - hPL), 
                s.p2.clone().setY(s.p2.y - hPL), 
                s.p2.clone(),
                s.p1.clone() 
            )
            _M.fill(_v, v)
            _M.fill([
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
            ], c)
            _M.fill([
                0, 0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 0
            ], uv)
        }

        { // боттом
            const _v = _M.createPolygonV(
                s.p3.clone().setY(s.p3.y - hPL), 
                s.p2.clone().setY(s.p2.y - hPL), 
                s.p1.clone().setY(s.p1.y - hPL),
                s.p0.clone().setY(s.p0.y - hPL) 
            )
            _M.fill(_v, v)
            _M.fill([
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
            ], c)
            _M.fill([
                0, 0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 0
            ], uv)
        }

    })

    return { v, uv, c, vCollide }
}
