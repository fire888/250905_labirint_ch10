import { _M, A3 } from "../_m"
import { IArrayForBuffers, T_ROOM, I_TypeSeg } from "types/GeomTypes"
import { Root } from "index"
import * as THREE from "three" 
import { createPlatform00 } from "geometry/platform00/platform00"
import { createColumn01 } from "../column01/column01";

type T_SEGMENT = {
    p0: THREE.Vector3
    p1: THREE.Vector3
    dir: THREE.Vector3
    w: number
    type: I_TypeSeg
}

const MIN_SEG = 1
const MAX_SEG = 10
const MIN_W = 2
const MAX_W = 5
const STAIR_W = 1
const STAIR_MIN_W = 2

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

const prepareSegments = (point0: THREE.Vector3, dir0: THREE.Vector3, point1: THREE.Vector3, dir1: THREE.Vector3, root: Root) => {
    const segments: T_SEGMENT[] = []

    const s = point0.clone()
    const e = point1.clone()

    const curP = new THREE.Vector3().copy(s)
    const curDir = dir0.clone()
    const mainDir = point1.clone().sub(point0).normalize()

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
        let w = Math.random() * MAX_W + MIN_W 

        const eDist = curP.clone().setY(0).distanceTo(e.clone().setY(0))
        if (eDist < MAX_SEG) {
            newDist = eDist
            newDir = e.clone().sub(curP).normalize()
            newP = e.clone()

            iterate = 0
        } else {
            if (iterate === 1000) {
                newDir = curDir.clone()
            }  else {
                const diff = mainDir.distanceTo(curDir)
                if (diff > .5) {
                    newDir =  mainDir.clone().sub(curDir).normalize().multiplyScalar(.2).add(curDir)
                } else {
                    newDir = e.clone().sub(curP).setY(0).normalize().applyAxisAngle(
                        new THREE.Vector3(0, 1, 0), 
                        (Math.random() - .5) * Math.PI * .4
                    )
                }
            }

            newDist = Math.random() * (MAX_SEG - MIN_SEG) + MIN_SEG

            newP = newDir.clone().multiplyScalar(newDist).add(curP)

            if (type === I_TypeSeg.STAIR) {
                const newY = Math.max(1, curP.y + (Math.random() - .5) * newDist * .8)
                newP.setY(newY)
                w = STAIR_MIN_W + Math.random() * STAIR_W
            }
        }

        const el: T_SEGMENT = { p0: curP.clone(), p1: newP, dir: newDir.clone(), w, type }

        segments.push(el)

        curP.copy(newP)
        curDir.copy(newDir)
    }

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
                        type: I_TypeSeg.STAIR_ADAPTER,
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
                        ...points,
                        type: I_TypeSeg.STAIR
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
                        ...points,
                        type: I_TypeSeg.STAIR_ADAPTER
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
                ...points,
                type: I_TypeSeg.FLOOR
            }
            ++n

            segments.push(dataForRoom)
        }
    }

    return segments
}

const createSingleWay = (options: T_LONG_WAY, root: Root): { geomData: IArrayForBuffers, segments: T_ROOM[] } => {
    const { p0, dir0, p1, dir1 } = options

    // central
    const segments = prepareSegments(p0, dir0, p1, dir1, root)
    const segments2: T_ROOM[] = divideStairs(segments, root)

    const v: number[] = []
    const c: number[] = []
    const uv: number[] = []
    const vCollide: number[] = []

    segments2.forEach((s: T_ROOM, i) => {
        { // columns
            if (s.type === I_TypeSeg.FLOOR) {
                const offsetAxis = s.dir.clone().multiplyScalar(.4)
                const offsetAxisM = s.dir.clone().multiplyScalar(-.4)
                {
                    const offsetDir1 = s.dir1.clone().multiplyScalar(.4).add(offsetAxis).add(s.p0)
                    const r0 = createColumn01(1, 2)
                    _M.translateVertices(r0.v, offsetDir1.x, offsetDir1.y, offsetDir1.z)
                    _M.fill(r0.v, v)
                    _M.fill(r0.c, c)
                    _M.fill(r0.uv, uv)
                }
                {
                    const offsetDir1 = s.dir0.clone().multiplyScalar(-.4).add(offsetAxis).add(s.p3)
                    const r0 = createColumn01(1, 2)
                    _M.translateVertices(r0.v, offsetDir1.x, offsetDir1.y, offsetDir1.z)
                    _M.fill(r0.v, v)
                    _M.fill(r0.c, c)
                    _M.fill(r0.uv, uv)
                }
                {
                    const offsetDir2 = s.dir1.clone().multiplyScalar(-.4).add(offsetAxisM).add(s.p2)
                    const r0 = createColumn01(1, 2)
                    _M.translateVertices(r0.v, offsetDir2.x, offsetDir2.y, offsetDir2.z)
                    _M.fill(r0.v, v)
                    _M.fill(r0.c, c)
                    _M.fill(r0.uv, uv)
                }
                {
                    const offsetDir2 = s.dir1.clone().multiplyScalar(.4).add(offsetAxisM).add(s.p1)
                    const r0 = createColumn01(1, 2)
                    _M.translateVertices(r0.v, offsetDir2.x, offsetDir2.y, offsetDir2.z)
                    _M.fill(r0.v, v)
                    _M.fill(r0.c, c)
                    _M.fill(r0.uv, uv)
                }
            }
        }

        const platformData = createPlatform00(s, root)
        _M.fill(platformData.v, v)
        _M.fill(platformData.c, c)
        _M.fill(platformData.uv, uv)
        _M.fill(platformData.vCollide, vCollide)
    })

    return { geomData: { v, c, uv, vCollide }, segments: segments2 }
}


type T_LONG_WAY = { p0: THREE.Vector3, dir0: THREE.Vector3, p1: THREE.Vector3, dir1: THREE.Vector3 }

export const createLongWay = (options: T_LONG_WAY, root: Root): IArrayForBuffers => {

    const { geomData: { v, c, uv, vCollide }, segments } = createSingleWay(options, root)

    const L_SLEEP_WAYS = 100
    
    let count = 0
    let currentN = 1

    while (currentN < segments.length && count < 10) {
        while (segments[currentN].type !== I_TypeSeg.FLOOR) { 
            ++currentN 
        }

        if (Math.random() < .3) {
            const { p0, p1, p2, p3, dir } = segments[currentN]

            let start, dirSeg, end
            if (count % 2 === 0) {
                start = p2.clone().sub(p3).multiplyScalar(.5).add(p3).setY(p2.y)
                dirSeg = dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5)
                end = dirSeg.clone().multiplyScalar(L_SLEEP_WAYS).add(start)
            } else {
                start = p1.clone().sub(p0).multiplyScalar(.5).add(p0).setY(p1.y)
                dirSeg = dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI * .5)
                end = dirSeg.clone().multiplyScalar(L_SLEEP_WAYS).add(start) 
            }

            const { geomData } = createSingleWay({ p0: start, dir0: dirSeg, p1: end, dir1: dirSeg }, root)

            _M.fill(geomData.v, v)
            _M.fill(geomData.c, c)
            _M.fill(geomData.uv, uv)
            _M.fill(geomData.vCollide, vCollide)

            count += 1
        }

        currentN += 1
    }

    return { v, uv, c, vCollide }
}
