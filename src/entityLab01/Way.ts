import { Root } from "../index"
import { _M } from "../geometry/_m"
import * as THREE from "three"
import { T_ROOM } from "types/GeomTypes"
import { IS_USE_WORKER } from '../constants/CONSTANTS'
import { createLongWay } from "geometry/longWay/longWay"
import { pause } from "helpers/htmlHelpers"

const VERT_COUNT = 700000 * 3 * 4
const UV_COUNT = 700000 * 2 * 4
const COLLIDE_VERT_COUNT = 6000 * 3 * 4

export class Way {
    name: string
    startPoint: THREE.Vector3
    endPoint: THREE.Vector3
    centerPoint: THREE.Vector3
    segments: T_ROOM[]
    
    _root: Root
    _m: THREE.Mesh
    _mCollision: THREE.Mesh
    
    _worker: Worker
    _flagComplete: Int32Array
    _coordsLongWayParts: Float32Array

    constructor(name: string, root: Root) {
        this._root = root
        
        this.name = name
        this.endPoint = new THREE.Vector3()
        this.startPoint = new THREE.Vector3()
        this.centerPoint = new THREE.Vector3()

        /////////////////////////////////////

        let geometry
        let geomCollision
        if (IS_USE_WORKER) {
            const { geometry: geom, geomCollision: geomColl } = this._buildGeometryWorker()
            geometry = geom
            geomCollision = geomColl
        } else {
            const { geometry: geom, geomCollision: geomColl } = this._createGeometryReal()
            geometry = geom
            geomCollision = geomColl
        }

        this._m = new THREE.Mesh(geometry, this._root.materials.materialLab)
        this._m.frustumCulled = false
        this._root.studio.add(this._m)

        this._mCollision = new THREE.Mesh(geomCollision, this._root.materials.collision)
        this._mCollision.name = 'Col|' + this.name
    }

    build (startPoint: THREE.Vector3) {
        return new Promise<void>((resolve, reject) => {

            if (IS_USE_WORKER) {
                const tick = () => {
                    if (Atomics.load(this._flagComplete, 0) === 1) {
                        Atomics.store(this._flagComplete, 0, 0)
                        
                        this._updateMeshesWorker(startPoint)
                        resolve()
                    } else {
                        setTimeout(tick, 10)
                    }
                }
                tick()

                this._worker.postMessage({ keyMessage: 'update' })
            } else {
                this._updateGeometry(startPoint).then(() => resolve())
            }


        })
    }

    // @region WORKER 

    _buildGeometryWorker() {
        const flagCompleteSAB = new SharedArrayBuffer(4)
        this._flagComplete = new Int32Array(flagCompleteSAB)

        const coordsLongWayPartsSAB = new SharedArrayBuffer(4 * 9)
        this._coordsLongWayParts = new Float32Array(coordsLongWayPartsSAB)

        ////////////////////////////////////////
        
        const sabVertex = new SharedArrayBuffer(VERT_COUNT)
        const posF32 = new Float32Array(sabVertex)

        const sabNormals = new SharedArrayBuffer(VERT_COUNT)
        const normalsF32 = new Float32Array(sabNormals)

        const sabColor = new SharedArrayBuffer(VERT_COUNT)
        const colorF32 = new Float32Array(sabColor)

        const sabUv = new SharedArrayBuffer(UV_COUNT)
        const uvF32 = new Float32Array(sabUv)

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(posF32, 3))
        geometry.setAttribute('normal', new THREE.BufferAttribute(normalsF32, 3))
        geometry.setAttribute('color', new THREE.BufferAttribute(colorF32, 3))
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvF32, 2))

        /////////////////////////////////////////


        const sabVertexCollide = new SharedArrayBuffer(COLLIDE_VERT_COUNT)
        const posF32Collide = new Float32Array(sabVertexCollide)
        
        const geomCollision = new THREE.BufferGeometry()
        geomCollision.setAttribute('position', new THREE.BufferAttribute(posF32Collide, 3))

        ////////////////////////////////////////

        this._worker = new Worker(new URL('./worker.ts', import.meta.url));
        this._worker.postMessage({ 
            keyMessage: 'init', 
            sabVertex, sabColor, sabNormals, VERT_COUNT,
            sabUv, UV_COUNT,
            sabVertexCollide, COLLIDE_VERT_COUNT,
            coordsLongWayPartsSAB,
            flagCompleteSAB
        })

        return { geometry, geomCollision }
    }

    private _updateMeshesWorker(startPoint: THREE.Vector3) {
        this.startPoint = startPoint.clone()
        this.centerPoint.set(this._coordsLongWayParts[3], this._coordsLongWayParts[4], this._coordsLongWayParts[5]).add(this.startPoint)
        this.endPoint.set(this._coordsLongWayParts[6], this._coordsLongWayParts[7], this._coordsLongWayParts[8]).add(this.startPoint)
        
        this._m.geometry.attributes.position.needsUpdate = true
        this._m.geometry.attributes.color.needsUpdate = true
        this._m.geometry.attributes.uv.needsUpdate = true
        this._m.geometry.attributes.normal.needsUpdate = true
        this._m.position.copy(this.startPoint)

        this._root.phisics.removeMeshFromCollision(this._mCollision.name)
        this._mCollision.name += '|_'
        this._mCollision.geometry.attributes.position.needsUpdate = true
        this._mCollision.position.copy(this.startPoint)
        this._root.phisics.addMeshToCollision(this._mCollision)
    }

    // @endregion

    // @region REAL

    _createGeometryReal () {
        ///////////////////////////

        const geometry = new THREE.BufferGeometry()

        const posF32 = new Float32Array(VERT_COUNT)
        const normalsF32 = new Float32Array(VERT_COUNT)
        const colorF32 = new Float32Array(VERT_COUNT)
        const uvF32 = new Float32Array(UV_COUNT)

        geometry.setAttribute('position', new THREE.BufferAttribute(posF32, 3))
        geometry.setAttribute('normal', new THREE.BufferAttribute(normalsF32, 3))
        geometry.setAttribute('color', new THREE.BufferAttribute(colorF32, 3))
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvF32, 2))

        //////////////////////////

        const geomCollision = new THREE.BufferGeometry()
        const posF32Collide = new Float32Array(6000 * 3)
        geomCollision.setAttribute('position', new THREE.BufferAttribute(posF32Collide, 3))

        //////////////////////////

        return { geometry, geomCollision }
    }

    async _updateGeometry(startPoint: THREE.Vector3) {
        const options = {
            p0: new THREE.Vector3(0, 0, 0),
            p1: new THREE.Vector3(400, 0, 0),
            dir0: new THREE.Vector3(1, 0, 0),
            dir1: new THREE.Vector3(1, 0, 0),
        }

        const { geomData: { v, c, uv, vCollide }, segments } = createLongWay(options)

        await pause(1)
        
        console.log('[MESSAGE:] verticies level n:', v.length / 3)
        console.log('[MESSAGE:] verticies collision n:', vCollide.length / 3)

        const firstSeg = segments[0]
        this.startPoint = startPoint.clone()
        const centerSeg = segments[Math.floor(segments.length / 2)]
        this.centerPoint = centerSeg.axisP1.clone().add(this.startPoint) 
        const lastSeg = segments[segments.length - 1]
        this.endPoint = lastSeg.axisP1.clone().add(this.startPoint)

        const geom = this._m.geometry        
        _M.fillStart(v, geom.attributes.position.array)
        _M.fillStart(c, geom.attributes.color.array)
        _M.fillStart(uv, geom.attributes.uv.array)
        const n = _M.computeNormalsV(v)
        _M.fillStart(n, geom.attributes.normal.array)


        this._m.geometry.attributes.position.needsUpdate = true
        this._m.geometry.attributes.color.needsUpdate = true
        this._m.geometry.attributes.uv.needsUpdate = true
        this._m.geometry.attributes.normal.needsUpdate = true
        this._m.position.copy(startPoint)

        this._root.phisics.removeMeshFromCollision(this._mCollision.name)
        this._mCollision.name += '|_'

        const geomCollide = this._mCollision.geometry
        _M.fillStartAndThousandLast(vCollide, geomCollide.attributes.position.array)

        this._mCollision.geometry.attributes.position.needsUpdate = true
        this._mCollision.position.copy(startPoint)
        this._root.phisics.addMeshToCollision(this._mCollision)
    } 

    // @endregion
}
