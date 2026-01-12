import { Root } from "../index"
import { _M, A3 } from "../geometry/_m"
import * as THREE from "three"
import { IArrayForBuffers, SegmentType, IArea, ILevelConf, TSchemeElem, TLabData } from "types/GeomTypes";
import { createColumn01 } from "geometry/column01/column01";

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
        const mat = new THREE.MeshStandardMaterial({ color: 0xffffff })

        const boxes = []

        const col = createColumn01(1, 1, 1)
        const m = _M.createMesh({ 
            ...col, 
            material: new THREE.MeshStandardMaterial({ 
                color: 0xffffff,
                // roughness: 1,
                metalness: 1,
                metalnessMap : this._root.loader.assets.el_0_spec,
                map: this._root.loader.assets.el_0,
                normalMap: this._root.loader.assets.el_0_norm,
                normalScale: new THREE.Vector2(3, 3),
                aoMap: this._root.loader.assets.el_0_ao,
                aoMapIntensity: 1
            }) 
        })
        m.position.set(0, 0, 0)
        this._root.studio.add(m)

        // const p = new THREE.Mesh(
        //     new THREE.BoxGeometry(1, 1, 1), 
        //     new THREE.MeshStandardMaterial({ 
        //         color: 0xffffff,
        //        // roughness: 1,
        //         //roughnessMap: this._root.loader.assets.el_0_spec,
        //         normalMap: this._root.loader.assets.el_0_norm,
        //         normalScale: new THREE.Vector2(3, 3),
        //         aoMap: this._root.loader.assets.el_0_ao,
        //         aoMapIntensity: 1
        //     })
        // )
        // p.position.set(0, 0, 0)
        // this._root.studio.add(p)

        // for (let i = 0; i < 1000; ++i) { 
        //     const m = new THREE.Mesh(
        //         new THREE.BoxGeometry(
        //             Math.random() * 10, 
        //             .3, 
        //             Math.random() * 10
        //         ), 
        //         mat
        //     )
        //     this._root.studio.add(m)
        //     m.position.set(
        //         Math.random() * 100 - 50, 
        //         Math.random() * 100 - 50, 
        //         Math.random() * 100 - 50
        //     )
        //     m.rotation.y = Math.random() * 2 * Math.PI
        //     boxes.push({
        //         n: i,
        //         m,
        //         pos: m.position,
        //     })
        //     m.userData.n = i
        // }

        // const v = []
        // let currAngle = 0
        // let currentPos = [0, 0, 0]

        // for (let i = 0; i < 100; ++i) {
        //     currAngle += (Math.random() - .5) * Math.PI * .3

        //     const w = Math.random() * 2
        //     const d = Math.random() * 5

        //     const _v  = _M.createPolygon(
        //         [0, 0, w],
        //         [d, 0, w],
        //         [d, 0, -w],
        //         [0, 0, -w],
        //     )

        //     _M.rotateVerticesY(_v, currAngle)
        //     _M.translateVertices(_v, currentPos[0], currentPos[1], currentPos[2])

        //     const l = _M.createLabel(`[${i}]${currentPos[0].toFixed(1)},${currentPos[1].toFixed(1)},${currentPos[2].toFixed(1)}`)
        //     l.position.set(currentPos[0], currentPos[1], currentPos[2])
        //     this._root.studio.add(l)

        //     currentPos[0] += Math.sin(currAngle) * w * 2
        //     currentPos[2] += Math.cos(currAngle) * w * 2 

        //     v.push(..._v)
        // }

        // const m = _M.createMesh({ v })
        // this._root.studio.add(m)

        // const l0 = _M.createLabel('0, 0, 0')
        // this._root.studio.add(l0)

        // const l1 = _M.createLabel('10, 0, 0')
        // l1.position.set(10, 0, 0)
        // this._root.studio.add(l1)

    }
}

