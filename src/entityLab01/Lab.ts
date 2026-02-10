import { Root } from "../index"
import { _M, A3, A2 } from "../geometry/_m"
import * as THREE from "three"
import { IArrayForBuffers, SegmentType, IArea, ILevelConf, TSchemeElem, TLabData, T_ROOM } from "types/GeomTypes";
import { createColumn01 } from "geometry/column01/column01";
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

        const options = {
            p0: new THREE.Vector3(0, 20, 0),
            p1: new THREE.Vector3(400, 20, 0),
            dir0: new THREE.Vector3(1, 0, 0),
            dir1: new THREE.Vector3(1, 0, 0),
        }

        const longWay = createLongWay(options, this._root)
        _M.fill(longWay.v, v)
        _M.fill(longWay.c, c)
        _M.fill(longWay.uv, uv)
        _M.fill(longWay.vCollide, vCollide)

        /////////////////////////////////////////////////////////////////////

        const mat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            //roughness: .05,
            metalness: .5,
            metalnessMap : this._root.texturesCanvas.iron00Map,
            //map: this._root.loader.assets.el_0,
            map: this._root.texturesCanvas.iron00Map,
            //normalMap: this._root.loader.assets.el_0_norm,
            bumpMap: this._root.texturesCanvas.iron00Map,
            bumpScale: 1,
            //normalScale: new THREE.Vector2(3, 3),
            aoMap: this._root.texturesCanvas.iron00Map,
            aoMapIntensity: 1,
            envMap: this._root.texturesCanvas.iron00Map,
            envMapIntensity: 1,
            vertexColors: true,
            // wireframe: true
        })

        const m = new THREE.Mesh(_M.createBufferGeometry({ v, uv, c }), mat)
        m.position.set(0, 0, 0)
        this._root.studio.add(m)

        const mCol = new THREE.Mesh(_M.createBufferGeometry({ v: vCollide }), this._root.materials.collision)
        mCol.position.set(0, 0, 0)
        this._root.phisics.addMeshToCollision(mCol)
    }
}
