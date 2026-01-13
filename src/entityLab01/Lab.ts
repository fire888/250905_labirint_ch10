import { Root } from "../index"
import { _M, A3 } from "../geometry/_m"
import * as THREE from "three"
import { IArrayForBuffers, SegmentType, IArea, ILevelConf, TSchemeElem, TLabData } from "types/GeomTypes";
import { createColumn01 } from "geometry/column01/column01";
import { createFloor00 } from "geometry/floor00/floor00";

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
        //const mat = new THREE.MeshStandardMaterial({ color: 0xffffff })

        const boxes = []

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

        const v: number[] = []
        const c: number[] = []
        const uv: number[] = []
        const vCollide: number[] = []

        let dir = 0
        let point = [0, 0]

        for (let i = 0; i < 80; ++i) {
            const d = Math.floor(Math.random() * 15) + 5
            const w = Math.floor(Math.random() * 10) + 3
            
            dir += (Math.random() - .5) * .3  * Math.PI

            const floor = createFloor00(d, w)
            
            _M.translateVertices(floor.v, 0, 0, -w * .5)
            _M.rotateVerticesY(floor.v, -dir)
            _M.translateVertices(floor.v, point[0], 0, point[1])
            
            _M.translateVertices(floor.vCollide, 0, 0, -w * .5)
            _M.rotateVerticesY(floor.vCollide, -dir)
            _M.translateVertices(floor.vCollide, point[0], 0, point[1])

            v.push(...floor.v)
            uv.push(...floor.uv)
            c.push(...floor.c)
            vCollide.push(...floor.vCollide)

            const colCopy = _M.clone(col.v)
            _M.translateVertices(colCopy,  point[0], 0, point[1])
            v.push(...colCopy)
            c.push(...col.c)
            uv.push(...col.uv)

            point[0] += Math.cos(dir) * d
            point[1] += Math.sin(dir) * d

            //const l = _M.createLabel(point[0].toFixed(2) + '_' + point[1].toFixed(2), [1, 0, 0], 1)
            //l.position.set(point[0], 0, point[1])
            //this._root.studio.add(l)
        }



        const m = new THREE.Mesh(_M.createBufferGeometry({ v, uv, c }), mat)
        m.position.set(0, 0, 0)
        this._root.studio.add(m)

        const mCol = new THREE.Mesh(_M.createBufferGeometry({ v: vCollide }), this._root.materials.collision)
        mCol.position.set(0, 0, 0)
        this._root.phisics.addMeshToCollision(mCol)
    }
}

