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
        })


        const col = createColumn01(1, 1, 1)

        const v: number[] = []
        const c: number[] = []
        const uv: number[] = [] 

        for (let i = 0; i < 20; ++i) {
            for (let j = 0; j < 20; ++j) {
                const _v = [...col.v]
                _M.translateVertices(_v, i * 2, 0, j * 2)
                v.push(..._v)
                uv.push(...col.uv)
                c.push(...col.c)
            }
        }


        {
            const s = .3
            const tV = []  
            const tC = []  
            const tUv = []  
            for (let i = 0; i < 100; ++i) {
                for (let j = 0; j < 100; ++j) {
                    const _v = _M.createPolygon(
                        [(i + 1) * s, 0, j * s],
                        [i * s, 0, j * s],
                        [i * s, 0, (j + 1) * s],
                        [(i + 1) * s, 0, (j + 1) * s],
                    )
                    tV.push(..._v)
                    tUv.push(..._M.createUv([0, 0], [1, 0], [1, 1], [0, 1]))
                    tC.push(..._M.fillColorFace([1, 1, 1]))
                }
            }

            // bottom
            _M.fill(tV, v)
            _M.fill(tUv, uv)
            _M.fill(tC, c)

            // top
            {
                const _v0 = _M.clone(tV)
                _M.rotateVerticesX(_v0, Math.PI)
                _M.translateVertices(_v0, 0, 3, 20)
                _M.fill(_v0, v)
                _M.fill(tUv, uv)
                _M.fill(tC, c)
            }


            // walls
            {
                const _v0 = _M.clone(tV)
                _M.rotateVerticesX(_v0, -Math.PI / 2)
                _M.translateVertices(_v0, 0, 0, 20)
                _M.fill(_v0, v)
                _M.fill(tUv, uv)
                _M.fill(tC, c)
            }

            {
                const _v0 = _M.clone(tV)
                _M.rotateVerticesX(_v0, -Math.PI / 2)
                _M.rotateVerticesY(_v0, -Math.PI / 2)
                _M.fill(_v0, v)
                _M.fill(tUv, uv)
                _M.fill(tC, c)
            }

            {
                const _v0 = _M.clone(tV)
                _M.rotateVerticesX(_v0, -Math.PI / 2)
                _M.rotateVerticesY(_v0, Math.PI)
                _M.translateVertices(_v0, 20, 0, 0)
                _M.fill(_v0, v)
                _M.fill(tUv, uv)
                _M.fill(tC, c)
            }

            {
                const _v0 = _M.clone(tV)
                _M.rotateVerticesX(_v0, -Math.PI / 2)
                _M.rotateVerticesY(_v0, -Math.PI * 1.5)
                _M.translateVertices(_v0, 20, 0, 20)
                _M.fill(_v0, v)
                _M.fill(tUv, uv)
                _M.fill(tC, c)
            }
        }

        const m = new THREE.Mesh(_M.createBufferGeometry({ v, uv, c }), mat)
        m.position.set(0, 0, 0)
        this._root.studio.add(m)
    }
}

