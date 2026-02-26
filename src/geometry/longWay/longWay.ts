import { _M, A3 } from "../_m"
import { IArrayForBuffers, T_ROOM, I_TypeSeg } from "types/GeomTypes"
import { Root } from "index"
import * as THREE from "three" 
import { createPlatform00 } from "geometry/platform00/platform00"
import { createColumn01 } from "../column01/column01"
import { createColumn02 } from "../column02/column02"
import { createArc00 } from "geometry/arc00/arc00"
import { createHelix00 } from "geometry/helix00/helix00"
import { createHelix01 } from "geometry/helix01/helix01"
import { createPlatform01Round } from "geometry/platform01Round/platfotm01Round"
import { createSphereHel } from "geometry/sphereHel/sphereHel"

type T_SEGMENT = {
    p0: THREE.Vector3
    p1: THREE.Vector3
    dir: THREE.Vector3
    w: number
    type: I_TypeSeg
    count: number
}

const MIN_DIST_TO_END = 20
const MIN_SEG = 1
const MAX_SEG = 10
const MIN_W = 2
const MAX_W = 5
const STAIR_W = 3
const STAIR_MIN_W = 1
const MIN_Y = -10


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

const prepareSegments = (point0: THREE.Vector3, dir0: THREE.Vector3, point1: THREE.Vector3, dir1: THREE.Vector3) => {
    const segments: T_SEGMENT[] = []

    const s = point0.clone()
    const e = point1.clone()

    // {
    //     const sL = _M.createLabel('s', [0, 0, 1], 10)
    //     sL.position.set(s.x, s.y, s.z)
    //     root.studio.add(sL)

    //     const eL = _M.createLabel('e', [0, 0, 1], 10)
    //     eL.position.set(e.x, e.y, e.z)
    //     root.studio.add(eL)
    // }

    const curP = new THREE.Vector3().copy(s)
    const curDir = dir0.clone()
    let nnDir = dir0.clone()
    const mainDir = point1.clone().sub(point0).normalize()

    let count = 0
    let iterate = 1001
    while (iterate > 0) {
        --iterate

        let type: I_TypeSeg = iterate % 2 === 0 ? 'FLOOR' : 'STAIR'

        let newDir
        let newP
        
        const eDist = curP.clone().setY(0).distanceTo(e.clone().setY(0))
        if (eDist < MIN_DIST_TO_END) { // подсоединение к завершающей платформе
            iterate = 0

            newDir = e.clone().sub(curP).setY(0).normalize()
            newP = e.clone()

            let pS = null
            const pE = newP.clone().sub(newDir.clone().multiplyScalar(eDist * .7)).setY(curP.y)
            
            if (type === 'FLOOR') { // небольшая платформа если нужна
                const el: T_SEGMENT = { 
                    p0: curP.clone(), 
                    p1: pE.clone(), 
                    dir: newDir.clone(), 
                    w: 4, 
                    type: 'FLOOR',
                    count: ++count
                }
                segments.push(el)

                // const l = _M.createLabel('l', [0, 1, 1], 10)
                // l.position.set(el.p0.x, el.p0.y, el.p0.z)
                // root.studio.add(l)      

                pS = pE.clone()
                pE.add(newDir.clone().multiplyScalar(eDist * .2)).setY(newP.y)
            }

            pE.setY(newP.y)

            const el: T_SEGMENT = { // лестница к последней платформе
                p0: pS ?? curP.clone(), 
                p1: pE, 
                dir: newDir.clone(), 
                w: STAIR_MIN_W + Math.random() * STAIR_W, 
                type: 'STAIR',
                count: ++count
            }
            segments.push(el)

            curP.copy(pE)
            type = 'FLOOR'
        } else {
            if (iterate === 1000) { // стартовая платформа
                newDir = curDir.clone()
            }
            if (iterate !== 1000) { // промежуточные платформы
                if (type === 'STAIR') {
                    newDir = nnDir.clone().sub(curDir).multiplyScalar(.5).add(curDir) 
                }
                if (type === 'FLOOR') {
                    newDir = nnDir.clone()

                    const diff = mainDir.distanceTo(curDir)
                    if (diff > .5) {
                        nnDir = mainDir.clone().sub(curDir).normalize().multiplyScalar(.2).add(curDir)
                    } else {
                        nnDir = e.clone().sub(curP).setY(0).normalize().applyAxisAngle(
                            new THREE.Vector3(0, 1, 0), 
                            (Math.random() - .5) * Math.PI * .4
                        )
                    }
                }
            }

            let newDist = Math.random() * (MAX_SEG - MIN_SEG) + MIN_SEG
            newP = newDir.clone().multiplyScalar(newDist).add(curP)

            if (type === 'STAIR') {
                let newY = Math.max(MIN_Y, curP.y + (Math.random() - .5) * newDist * .8)
                newP.setY(newY)
            }
        }

        let w
        if (type === 'FLOOR') { 
            w = Math.random() * MAX_W + MIN_W 
        }
        if (type === 'STAIR') {
            const d = curP.distanceTo(newP) 
            const wRan = (STAIR_MIN_W + Math.random() * STAIR_W)
            w = Math.min(wRan, wRan * (d * .8 / wRan)) 
        }

        const el: T_SEGMENT = { 
            p0: curP.clone(), 
            p1: newP, 
            dir: newDir.clone(), 
            w, 
            type, 
            count: ++count 
        }
        segments.push(el)

        curP.copy(newP)
        curDir.copy(newDir)
    }

    return segments
}


const checkMinOffset = (prevDir: THREE.Vector3, curDir: THREE.Vector3, w: number): number => {
    const pp0 = prevDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5).multiplyScalar(w * .5)
    const pp1 = curDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * .5).multiplyScalar(w * .5)
    const d1 = Math.max(.1, pp0.distanceTo(pp1))
    return d1
}

const divideStairs = (segmemtsSrc: T_SEGMENT[]): T_ROOM[] => {
    const segments: T_ROOM[] = []

    let n = 0

    for (let i = 0; i < segmemtsSrc.length; i++) {
        const cur = segmemtsSrc[i]

        if (cur.type === 'STAIR') {
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
                        type: 'STAIR_ADAPTER',
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
                        type: 'STAIR'
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
                        type: 'STAIR_ADAPTER'
                    } 
                    ++n
                    segments.push(dataE)
                }
            }

    
        } else if (cur.type === 'FLOOR') {
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
                type: 'FLOOR'
            }
            ++n

            segments.push(dataForRoom)
        }
    }

    return segments
}

const createSingleWay = (options: T_LONG_WAY, isLastHelix: boolean): { geomData: IArrayForBuffers, segments: T_ROOM[] } => {
    const { p0, dir0, p1, dir1 } = options

    // central
    const segments = prepareSegments(p0, dir0, p1, dir1)
    const segments2: T_ROOM[] = divideStairs(segments)

    const v: number[] = []
    const c: number[] = []
    const uv: number[] = []
    const vCollide: number[] = []

    segments2.forEach((s: T_ROOM, i) => {
        { // columns
            if (s.type === 'FLOOR') {
                const offsetAxis = s.dir.clone().multiplyScalar(.4)
                const offsetAxisM = s.dir.clone().multiplyScalar(-.4)

                // const offsetDir1_0 = s.dir1.clone().multiplyScalar(.4).add(offsetAxis).add(s.p0)
                // const offsetDir1_1 = s.dir0.clone().multiplyScalar(-.4).add(offsetAxis).add(s.p3)
                // const offsetDir2_0 = s.dir1.clone().multiplyScalar(-.4).add(offsetAxisM).add(s.p2)
                // const offsetDir2_1 = s.dir1.clone().multiplyScalar(.4).add(offsetAxisM).add(s.p1)
                // const offsetRoof = s.dir.clone().multiplyScalar(.4).add(s.axisP0)

                const createColumns = (r: IArrayForBuffers, coord: THREE.Vector3 ) => {
                    _M.translateVertices(r.v, coord.x, coord.y, coord.z)
                    _M.fill(r.v, v)
                    _M.fill(r.c, c)
                    _M.fill(r.uv, uv)

                    if (r.vCollide) {
                        _M.translateVertices(r.vCollide, coord.x, coord.y, coord.z)
                        _M.fill(r.vCollide, vCollide)
                    }
                }

                let typeColumn = 'COLUMN01'
                const ran = Math.random()
                if (ran < .5) { 
                    typeColumn = 'COLUMN02' 
                }
                if (i === segments2.length - 1 && isLastHelix) {
                    typeColumn = 'HELIX' 
                } else {
                    if (s.w > 6 && s.d > 6) {
                        typeColumn = 'SPHERE_HEL'
                    }
                }


                if (typeColumn === 'COLUMN01') {
                    if (Math.random() < .6) {
                        const Y = new THREE.Vector3(0, 0, 0)
                        const offsetDir1_0 = s.dir1.clone().multiplyScalar(.3).add(offsetAxis).add(s.p0).add(Y)
                        const offsetDir1_1 = s.dir0.clone().multiplyScalar(-.3).add(offsetAxis).add(s.p3).add(Y)
                        const offsetDir2_0 = s.dir1.clone().multiplyScalar(-.3).add(offsetAxisM).add(s.p2).add(Y)
                        const offsetDir2_1 = s.dir1.clone().multiplyScalar(.3).add(offsetAxisM).add(s.p1).add(Y)

                        const r0 = createColumn01(1, Math.random() * 3 + 1)
                        createColumns(r0, offsetDir1_0)
                        const r1 = createColumn01(1, Math.random() * 3 + 1)
                        createColumns(r1, offsetDir1_1)
                        const r2 = createColumn01(1, Math.random() * 3 + 1)
                        createColumns(r2, offsetDir2_0)
                        const r3 = createColumn01(1, Math.random() * 3 + 1)
                        createColumns(r3, offsetDir2_1) 
                    }
                } else if (typeColumn === 'COLUMN02') {
                    if (s.w > 2 && s.d > 2) {
                        const offsetDir1_0 = s.dir1.clone().multiplyScalar(.4).add(offsetAxis).add(s.p0)
                        const offsetDir1_1 = s.dir0.clone().multiplyScalar(-.4).add(offsetAxis).add(s.p3)
                        const offsetDir2_0 = s.dir1.clone().multiplyScalar(-.4).add(offsetAxisM).add(s.p2)
                        const offsetDir2_1 = s.dir1.clone().multiplyScalar(.4).add(offsetAxisM).add(s.p1)
                        const offsetRoof = s.dir.clone().multiplyScalar(.4).add(s.axisP0)

                        const h = Math.random() * 3 + .5
                        const d = offsetDir1_1.distanceTo(offsetDir2_0)
                        const count = Math.ceil(d / 1.3)

                        for (let i = 0; i < count + 1; i++) {
                            const r0 = createColumn02(.08 + Math.random() * .12, h)
                            const p = offsetDir1_1.clone().lerp(offsetDir2_0, i / (count))
                            createColumns(r0, p)

                            const r1 = createColumn02(.08 + Math.random() * .12, h)
                            const p1 = offsetDir1_0.clone().lerp(offsetDir2_1, i / (count))
                            createColumns(r1, p1)
                        }

                        const arc = createArc00(s.w * .5 - .4, s.d - .8)
                        const angle = _M.angleFromCoords(s.dir.x, s.dir.z)
                        _M.rotateVerticesY(arc.v, -angle - Math.PI * .5)
                        _M.translateVertices(arc.v, offsetRoof.x, offsetRoof.y + h, offsetRoof.z)
                        _M.fill(arc.v, v)
                        _M.fill(arc.c, c)
                        _M.fill(arc.uv, uv)
                    }
                } else if (typeColumn === 'HELIX') {
                    const rPlatform = Math.random() * 5 + 2
                    const hHelix = rPlatform + Math.random() * 40

                    {
                        const r0 = createHelix00(hHelix, rPlatform)

                        const offset = s.dir.clone().multiplyScalar(rPlatform).add(s.axisP1)
                        _M.translateVertices(r0.v, offset.x, offset.y - 2, offset.z)
                        _M.fill(r0.v, v)
                        _M.fill(r0.c, c)
                        _M.fill(r0.uv, uv)
                    }

                    {
                        const pl = createPlatform01Round(rPlatform)
                        const v3Diff = s.axisP1.clone().sub(s.axisP0)
                        const angle = _M.angleFromCoords(v3Diff.x, v3Diff.z)

                        _M.rotateVerticesY(pl.v, -angle - Math.PI * .5)
                        _M.translateVertices(pl.v, s.axisP1.x, s.axisP1.y, s.axisP1.z)

                        _M.rotateVerticesY(pl.vCollide, -angle - Math.PI * .5)
                        _M.translateVertices(pl.vCollide, s.axisP1.x, s.axisP1.y, s.axisP1.z)

                        _M.fill(pl.v, v)
                        _M.fill(pl.c, c)
                        _M.fill(pl.uv, uv)
                        _M.fill(pl.vCollide, vCollide)
                    }

                } else if (typeColumn === 'SPHERE_HEL') {
                    let sss
                    let r1 = Math.random() * .12 + 0.01
                    const r2 = Math.random() * .12 + 0.01
                    if (Math.abs(r1 - r2) < 0.015) {
                        r1 += 0.05
                    }
                    sss = [r1, r2]
                    const r = createSphereHel(sss[0], sss[1])
                    const center = s.axisP0.clone().add(s.axisP1.clone().sub(s.axisP0).multiplyScalar(.5)) 
                    _M.translateVertices(r.v, center.x, center.y + 1.05, center.z)
                    _M.fill(r.v, v)
                    _M.fill(r.c, c)
                    _M.fill(r.uv, uv)
                    
                    _M.translateVertices(r.vCollide, center.x, center.y + 1.05, center.z)
                    _M.fill(r.vCollide, vCollide)
                }
            }
        }


        const platformData = createPlatform00(s)
        _M.fill(platformData.v, v)
        _M.fill(platformData.c, c)
        _M.fill(platformData.uv, uv)
        _M.fill(platformData.vCollide, vCollide)
    })

    return { geomData: { v, c, uv, vCollide }, segments: segments2 }
}


type T_LONG_WAY = { p0: THREE.Vector3, dir0: THREE.Vector3, p1: THREE.Vector3, dir1: THREE.Vector3 }

export const createLongWay = (options: T_LONG_WAY):  { geomData: IArrayForBuffers, segments: T_ROOM[] } => {

    const { geomData: { v, c, uv, vCollide }, segments } = createSingleWay(options, false)

    const helixGlobal = createHelix01(400, 50)
    _M.rotateVerticesZ(helixGlobal.v, -Math.PI * .5)
    _M.fill(helixGlobal.v, v)
    _M.fill(helixGlobal.c, c)
    _M.fill(helixGlobal.uv, uv)

    const L_SLEEP_WAYS = 45
    
    let count = 0
    let currentN = 1

    while (currentN < segments.length && count < 10) {
        while (segments[currentN].type !== 'FLOOR') { 
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

            const { geomData } = createSingleWay({ p0: start, dir0: dirSeg, p1: end, dir1: dirSeg }, true)

            _M.fill(geomData.v, v)
            _M.fill(geomData.c, c)
            _M.fill(geomData.uv, uv)
            _M.fill(geomData.vCollide, vCollide)

            count += 1
        }

        currentN += 1
    }



    return { geomData: { v, uv, c, vCollide }, segments }
}
