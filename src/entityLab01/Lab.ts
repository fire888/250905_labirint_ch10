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

        for (let i = 0; i < 1000; ++i) { 
            const m = new THREE.Mesh(
                new THREE.BoxGeometry(
                    Math.random() * 10, 
                    .3, 
                    Math.random() * 10
                ), 
                mat
            )
            this._root.studio.add(m)
            m.position.set(
                Math.random() * 100 - 50, 
                Math.random() * 100 - 50, 
                Math.random() * 100 - 50
            )
            m.rotation.y = Math.random() * 2 * Math.PI
            boxes.push({
                n: i,
                m,
                pos: m.position,
            })
            m.userData.n = i
        }

        const connectionsNearests = {}

        // let savedDistdata = { b1: null, b2: null, d: Infinity }
        // for (let i = 0; i < boxes.length; ++i) {
        //     const b1 = boxes[i]
        //     for (let j = i + 1; j < boxes.length; ++j) {
        //         const b2 = boxes[j]
        //         const d = _M.distance(b1.pos, b2.pos)
        //         if (d < 10) {
        //             if (!connectionsNearests[b1.n]) connectionsNearests[b1.n] = []

    }
}

