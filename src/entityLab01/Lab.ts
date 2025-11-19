import { Root } from "../index"
import { _M, A3 } from "../geometry/_m"
import * as THREE from "three"
import { IArrayForBuffers, SegmentType, IArea, ILevelConf, TSchemeElem, TLabData } from "types/GeomTypes";

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

        const v = []
        let currAngle = 0
        let currentPos = [0, 0, 0]

        for (let i = 0; i < 100; ++i) {
            currAngle += (Math.random() - .5) * Math.PI * .3

            const w = Math.random() * 10
            const d = Math.random() * 5

            const _v  = _M.createPolygon(
                [-w, 0, d],
                [w, 0, d],
                [w, 0, -d],
                [-w, 0, -d],
            )

            _M.rotateVerticesY(_v, currAngle)
            _M.translateVertices(_v, currentPos[0], currentPos[1], currentPos[2])

            currentPos[0] += Math.sin(currAngle) * w * 2 
            currentPos[0] += Math.cos(currAngle) * w * 2

            v.push(..._v)
        }

        const m = _M.createMesh({ v })
        this._root.studio.add(m)

    }
}

