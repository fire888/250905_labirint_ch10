import { Root } from "../index"
import { _M, A3, A2 } from "../geometry/_m"
import * as THREE from "three"
import { IArrayForBuffers, SegmentType, IArea, ILevelConf, TSchemeElem, TLabData, T_ROOM } from "types/GeomTypes";
import { createColumn01 } from "geometry/column01/column01";
import { createFloor00 } from "geometry/floor00/floor00";
import { createLongWay } from "geometry/longWay/longWay";

export class Labyrinth {
    _root: Root
    _houses: THREE.Mesh[] = []
    _roads: THREE.Mesh[] = []
    _stricts: THREE.Group[] = []
    _collisionsNames: string[] = []
    _labSheme: TLabData = { areasData: [], positionsEnergy: [], positionsAntigravs: [] }

    constructor() {}
    async init (root: Root) {
        this._root = root
    }

    async build (conf: ILevelConf) {
        const v: number[] = []
        const c: number[] = []
        const uv: number[] = []
        const vCollide: number[] = []

        const longWay = createLongWay([-10, 20, 0], [200, 20, 0], this._root)
        _M.fill(longWay.v, v)
        _M.fill(longWay.c, c)
        _M.fill(longWay.uv, uv)
        _M.fill(longWay.vCollide, vCollide)

    
        // let dir = 0
        // let point: A3 = [0, 0, 0]

        // const rooms: T_ROOM[] = []

        // for (let i = 0; i < 20; ++i) {
        //     const d = Math.floor(Math.random() * 15) + 5
        //     const w = Math.floor(Math.random() * 10) + 3

        //     rooms.push({ id: i, point0: [...point], w, d, dir })
            
        //     dir += (Math.random() - .5) * .3  * Math.PI
            
        //     point[0] += Math.cos(dir) * d
        //     point[1] += (Math.random() - .5) * 3 
        //     point[2] += Math.sin(dir) * d
        // }

        // for (let i = 0; i < rooms.length; ++i) {
        //     let dir0 = Math.PI * .5
        //     let dir1 = Math.PI * .5
        //     let point1: A3 = rooms[i + 1] 
        //         ? [...rooms[i + 1].point0] 
        //         : [
        //             rooms[i].point0[0] + Math.cos(rooms[i].dir) * rooms[i].d,
        //             rooms[i].point0[1],
        //             rooms[i].point0[2] + Math.sin(rooms[i].dir) * rooms[i].d 
        //         ] 

        //     if (rooms[i - 1]) {
        //         dir0 = (rooms[i - 1].dir + rooms[i].dir) * .5 + Math.PI * .5 
        //     }
        //     if (rooms[i + 1]) {
        //         dir1 = (rooms[i + 1].dir + rooms[i].dir) * .5 + Math.PI * .5 
        //     } else if (dir0) {
        //         dir1 = dir0
        //     }

        //     rooms[i].dir0 = dir0
        //     rooms[i].dir1 = dir1
        //     rooms[i].point1 = point1
        // }


        /////////////////////////////////////////////////////////////////////

        const mat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            roughness: .05,
            metalness: .5,
            metalnessMap : this._root.loader.assets.el_0_spec,
            map: this._root.loader.assets.el_0,
            normalMap: this._root.loader.assets.el_0_norm,
            normalScale: new THREE.Vector2(3, 3),
            aoMap: this._root.loader.assets.el_0_ao,
            aoMapIntensity: 1,
            envMap: this._root.loader.assets.env,
            envMapIntensity: 1,
            // wireframe: true
        })

        const col = createColumn01(1, 1, 1)




        // for (let i = 0; i < rooms.length; ++i) {
        //     const floor = createFloor00(rooms[i], this._root)
        //     _M.fill(floor.v, v)
        //     _M.fill(floor.uv, uv)
        //     _M.fill(floor.c, c)

        //     _M.fill(floor.vCollide, vCollide)
        // }


        // for (let i = 0; i < rooms.length; ++i) {
        //     const r = createFloor00(rooms[i].d, rooms[i].w)
        //     _M.translateVertices(r.v, 0, 0, -rooms[i].w * .5)
        //     _M.rotateVerticesY(r.v, -rooms[i].dir)
        //     _M.translateVertices(r.v, rooms[i].point0[0], 0, rooms[i].point0[1])
        //     v.push(...r.v)
        //     uv.push(...r.uv)
        //     c.push(...r.c)


        //     _M.translateVertices(r.vCollide, 0, 0, -rooms[i].w * .5)
        //     _M.rotateVerticesY(r.vCollide, -rooms[i].dir)
        //     _M.translateVertices(r.vCollide, rooms[i].point0[0], 0, rooms[i].point0[1])
        //     vCollide.push(...r.vCollide)
        // }

        const m = new THREE.Mesh(_M.createBufferGeometry({ v, uv, c }), mat)
        m.position.set(0, 0, 0)
        this._root.studio.add(m)

        const mCol = new THREE.Mesh(_M.createBufferGeometry({ v: vCollide }), this._root.materials.collision)
        mCol.position.set(0, 0, 0)
        this._root.phisics.addMeshToCollision(mCol)
    }
}

// const floor = createFloor00(d, w)

// _M.translateVertices(floor.v, 0, 0, -w * .5)
// _M.rotateVerticesY(floor.v, -dir)
// _M.translateVertices(floor.v, point[0], 0, point[1])

// _M.translateVertices(floor.vCollide, 0, 0, -w * .5)
// _M.rotateVerticesY(floor.vCollide, -dir)
// _M.translateVertices(floor.vCollide, point[0], 0, point[1])

// v.push(...floor.v)
// uv.push(...floor.uv)
// c.push(...floor.c)
// vCollide.push(...floor.vCollide)

// const colCopy = _M.clone(col.v)
// _M.translateVertices(colCopy,  point[0], 0, point[1])
// v.push(...colCopy)
// c.push(...col.c)
// uv.push(...col.uv)

//const l = _M.createLabel(point[0].toFixed(2) + '_' + point[1].toFixed(2), [1, 0, 0], 1)
//l.position.set(point[0], 0, point[1])
//this._root.studio.add(l)