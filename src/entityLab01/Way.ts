import { Root } from "../index"
import { _M } from "../geometry/_m"
import * as THREE from "three"
import { T_ROOM } from "types/GeomTypes";
import { createLongWay } from "geometry/longWay/longWay"

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
    _geomCollision: THREE.BufferGeometry
    
    _worker: Worker
    _flagComplete: Int32Array

    constructor(name: string, root: Root) {
        this._root = root
        
        this.name = name
        this.endPoint = new THREE.Vector3()
        this.startPoint = new THREE.Vector3()
        this.centerPoint = new THREE.Vector3()

        /////////////////////////////////////

        const flagCompleteSAB = new SharedArrayBuffer(4)
        this._flagComplete = new Int32Array(flagCompleteSAB)

        ////////////////////////////////////////

        const VERT_COUNT = 4000000 * 3
        const UV_COUNT = 4000000 * 2
        
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

        const COLLIDE_VERT_COUNT = 10000 * 3
        const sabVertexCollide = new SharedArrayBuffer(COLLIDE_VERT_COUNT)
        const posF32Collide = new Float32Array(sabVertexCollide)
        
        this._geomCollision = new THREE.BufferGeometry()
        this._geomCollision.setAttribute('position', new THREE.BufferAttribute(posF32Collide, 3))

        ////////////////////////////////////////

        this._m = new THREE.Mesh(geometry, root.materials.materialLab)
        this._m.frustumCulled = false
        this._root.studio.add(this._m)

        //let date = Date.now()
        //console.log('[MESSAGE:] START CREATE WORKER')
        this._worker = new Worker(new URL('./worker.ts', import.meta.url));

        this._worker.postMessage({ 
            keyMessage: 'init', 
            sabVertex, sabColor, sabUv, sabNormals, 
            // sabVertexCollide, 
            flagCompleteSAB, 
            VERT_COUNT, UV_COUNT, COLLIDE_VERT_COUNT
        })
    }

    build (startPoint: THREE.Vector3) {
        this.startPoint = startPoint.clone()

        // const options = {
        //     p0: new THREE.Vector3(0, 0, 0),
        //     p1: new THREE.Vector3(400, 0, 0),
        //     dir0: new THREE.Vector3(1, 0, 0),
        //     dir1: new THREE.Vector3(1, 0, 0),
        // }

        //const longWay = createLongWay(options)
        //const { v, uv, c, vCollide } = longWay.geomData

        //console.log('YUYU v', v.length / 3)
        //console.log('YUYU uv', uv.length / 2)
        //console.log('YUYU c', c.length / 3)
        //console.log('YUYU vCollide', vCollide.length / 3)

        const date = Date.now()
        console.log('[MESSAGE:] START LAB')

        const tick = () => {
            if (Atomics.load(this._flagComplete, 0) === 1) {
                Atomics.store(this._flagComplete, 0, 0)
                
                this._m.geometry.attributes.position.needsUpdate = true
                this._m.geometry.attributes.color.needsUpdate = true
                this._m.geometry.attributes.uv.needsUpdate = true
                this._m.geometry.computeVertexNormals()
                
                console.log('[TIME:] UPDATE LABYRINTH', ((Date.now() - date) / 1000).toFixed(2))
            } else {
                setTimeout(tick, 5)
            }
        }
        tick()

        this._worker.postMessage({ keyMessage: 'update' })

        this._m.position.copy(this.startPoint)

        /////////////////////////////////////
        
        if (this._mCollision) {
            this._root.phisics.removeMeshFromCollision(this._mCollision.name)
            this._mCollision.geometry.dispose()
        }
        //const geomCol = _M.createBufferGeometry({ v: vCollide })        
        //this._mCollision = new THREE.Mesh(geomCol, this._root.materials.collision)
        this._mCollision = new THREE.Mesh(new THREE.BoxGeometry(7, 7, 7), this._root.materials.collision)
        this._mCollision.name = Way.nameCol
        Way.nameCol += '|_'
        //this._mCollision.position.copy(this.startPoint)
        this._mCollision.position.copy(new THREE.Vector3(100, 0, 0))
        this._root.phisics.addMeshToCollision(this._mCollision)
        
        /////////////////////////////////////

        //this.endPoint = this.startPoint.clone().add(longWay.segments[longWay.segments.length - 1].p1)
        //this.segments = longWay.segments
        //const seg = this.segments[Math.floor(this.segments.length / 2)]
        //this.centerPoint = seg.axisP1.clone().sub(seg.axisP0).multiplyScalar(.5).add(seg.axisP0).add(this.startPoint)
    }
}
