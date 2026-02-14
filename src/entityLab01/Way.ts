import { Root } from "../index"
import { _M } from "../geometry/_m"
import * as THREE from "three"
import { T_ROOM } from "types/GeomTypes";

export class Way {
    static nameCol = 'col'
    static nameColCenterWay = 'collisionNextBuild'

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

    constructor(name: string, root: Root, y: number) {
        this._root = root
        
        this.name = name
        this.endPoint = new THREE.Vector3()
        this.startPoint = new THREE.Vector3()
        this.centerPoint = new THREE.Vector3()

        /////////////////////////////////////

        const flagCompleteSAB = new SharedArrayBuffer(4)
        this._flagComplete = new Int32Array(flagCompleteSAB)

        const coordsLongWayPartsSAB = new SharedArrayBuffer(4 * 9)
        this._coordsLongWayParts = new Float32Array(coordsLongWayPartsSAB)

        ////////////////////////////////////////

        const VERT_COUNT = 700000 * 3 * 4
        const UV_COUNT = 700000 * 2 * 4
        
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

        this._m = new THREE.Mesh(geometry, root.materials.materialLab)
        this._m.frustumCulled = false
        this._m.position.y = y
        this._root.studio.add(this._m)

        /////////////////////////////////////////

        const COLLIDE_VERT_COUNT = 5000 * 3 * 4
        const sabVertexCollide = new SharedArrayBuffer(COLLIDE_VERT_COUNT)
        const posF32Collide = new Float32Array(sabVertexCollide)
        
        const geomCollision = new THREE.BufferGeometry()
        geomCollision.setAttribute('position', new THREE.BufferAttribute(posF32Collide, 3))

        this._mCollision = new THREE.Mesh(geomCollision, root.materials.collision)
        this._mCollision.name = Way.nameCol
        this._mCollision.frustumCulled = false
        this._mCollision.position.y = y - .5
        this._root.studio.add(this._mCollision)

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
    }

    build (startPoint: THREE.Vector3) {
        this.startPoint = startPoint.clone()

        const date = Date.now()
        console.log('[MESSAGE:] START LAB')

        const tick = () => {
            if (Atomics.load(this._flagComplete, 0) === 1) {
                Atomics.store(this._flagComplete, 0, 0)
                
                this._recalcylateBuffers(this.startPoint)

                console.log('[TIME:] UPDATE LABYRINTH', ((Date.now() - date) / 1000).toFixed(2))
            } else {
                setTimeout(tick, 10)
            }
        }
        tick()

        this._worker.postMessage({ keyMessage: 'update' })

        /////////////////////////////////////
        
        //if (this._mLabCollision) {
            //this._root.phisics.removeMeshFromCollision(this._mCollision.name)
            //this._mCollision.geometry.dispose()
        //}
        //const geomCol = _M.createBufferGeometry({ v: vCollide })        
        //this._mCollision = new THREE.Mesh(geomCol, this._root.materials.collision)
        //this._mLabCollision = new THREE.Mesh(new THREE.BoxGeometry(7, 7, 7), this._root.materials.collision)
        //this._mLabCollision.name = Way.nameCol
        //Way.nameCol += '|_'
        //this._mCollision.position.copy(this.startPoint)
        //this._mLabCollision.position.copy(startPoint)
        //this._root.phisics.addMeshToCollision(this._mCollision)
        
        /////////////////////////////////////

        //this.endPoint = this.startPoint.clone().add(longWay.segments[longWay.segments.length - 1].p1)
        //this.segments = longWay.segments
        //const seg = this.segments[Math.floor(this.segments.length / 2)]
        //this.centerPoint = seg.axisP1.clone().sub(seg.axisP0).multiplyScalar(.5).add(seg.axisP0).add(this.startPoint)
    }

    private _recalcylateBuffers (startPoint: THREE.Vector3) {
        this._m.geometry.attributes.position.needsUpdate = true
        this._m.geometry.attributes.color.needsUpdate = true
        this._m.geometry.attributes.uv.needsUpdate = true
        this._m.geometry.attributes.normal.needsUpdate = true

        this._mCollision.geometry.attributes.position.needsUpdate = true

        this.centerPoint.set(this._coordsLongWayParts[3], this._coordsLongWayParts[4], this._coordsLongWayParts[5]).add(this.startPoint)
        this.endPoint.set(this._coordsLongWayParts[6], this._coordsLongWayParts[7], this._coordsLongWayParts[8]).add(this.startPoint)

        this._m.position.copy(startPoint)
        this._mCollision.position.copy(startPoint)
    }
    
}
