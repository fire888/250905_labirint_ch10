import { Root } from "../index"
import { _M, A3, A2 } from "../geometry/_m"
import * as THREE from "three"
import { IArrayForBuffers, SegmentType, IArea, ILevelConf, TSchemeElem, TLabData, T_ROOM } from "types/GeomTypes";
import { createColumn01 } from "geometry/column01/column01";
import { createLongWay } from "geometry/longWay/longWay"
import { pause } from 'helpers/htmlHelpers'
import { LEVELS, COLOR_FOG_PLAY } from '../constants/CONSTANTS'

class Way {
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
    _mCollisionNextBuild: THREE.Mesh

    constructor(name: string, root: Root, material: THREE.MeshStandardMaterial) {
        this.name = name
        this.endPoint = new THREE.Vector3()

        this._root = root

        this._m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material)
        this._root.studio.add(this._m)
    }

    build (startPoint: THREE.Vector3) {
        this.startPoint = startPoint.clone()

        const options = {
            p0: new THREE.Vector3(0, 0, 0),
            p1: new THREE.Vector3(400, 0, 0),
            dir0: new THREE.Vector3(1, 0, 0),
            dir1: new THREE.Vector3(1, 0, 0),
        }

        const longWay = createLongWay(options, this._root)
        const { v, uv, c, vCollide } = longWay.geomData

        const geom = _M.createBufferGeometry({ v, uv, c })
        this._m.geometry.dispose()
        this._m.geometry = geom
        this._m.position.copy(this.startPoint)

        /////////////////////////////////////
        
        if (this._mCollision) {
            this._root.phisics.removeMeshFromCollision(this._mCollision.name)
        }
        const geomCol = _M.createBufferGeometry({ v: vCollide })        
        this._mCollision = new THREE.Mesh(geomCol, this._root.materials.collision)
        this._mCollision.name = Way.nameCol
        this._mCollision.position.copy(this.startPoint)
        this._root.phisics.addMeshToCollision(this._mCollision)
        Way.nameCol += '|_'
        
        /////////////////////////////////////

        this.endPoint = this.startPoint.clone().add(longWay.segments[longWay.segments.length - 1].p1)
        this.segments = longWay.segments
        const seg = this.segments[Math.floor(this.segments.length / 2)]
        this.centerPoint = seg.axisP1.clone().sub(seg.axisP0).multiplyScalar(.5).add(seg.axisP0).add(this.startPoint)
    }
}

let NOT_BULD = false 

export class Labyrinth {
    _root: Root
    _material: THREE.MeshStandardMaterial

    _way1: Way
    _way2: Way

    _mCollisionNextBuild: THREE.Mesh 

    _currentWay: Way

    constructor() {}
    async init (root: Root) {
        this._root = root
        this._material = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            //roughness: .05,
            //metalness: .5,
            roughness: 0,
            metalness: .7,
            //metalnessMap : this._root.texturesCanvas.iron00Map,
            //map: this._root.loader.assets.el_0,
            map: this._root.texturesCanvas.iron00Map,
            //normalMap: this._root.loader.assets.el_0_norm,
            bumpMap: this._root.texturesCanvas.iron00Map,
            bumpScale: .5,
            //normalScale: new THREE.Vector2(3, 3),
            aoMap: this._root.texturesCanvas.iron00Map,
            aoMapIntensity: 1,
            //envMap: this._root.loader.assets.env,
            envMap: this._root.texturesCanvas.env,
            envMapIntensity: 1,
            vertexColors: true,
            // wireframe: true
        })

        this._way1 = new Way('way1', this._root, this._material)
        this._way2 = new Way('way2', this._root, this._material)

        this.createCollisionCenter()
    }

    async buildNext (conf: ILevelConf) {
        this._root.phisics.removeMeshFromCollision(this._mCollisionNextBuild.name)
        
        const startPoint = new THREE.Vector3()
        let nextWay = this._way1

        if (this._currentWay && this._currentWay.name === 'way1') {
            nextWay = this._way2
        }
        if (this._currentWay) { 
            startPoint.copy(this._currentWay.endPoint).add(new THREE.Vector3(0, -1, 0))
        }

        nextWay.build(startPoint)

        this._mCollisionNextBuild.position.copy(nextWay.centerPoint)
        this._root.phisics.addMeshToCollision(this._mCollisionNextBuild)

        this._root.phisics.onCollision('collisionNextBuild', () => {            
            this.buildNext(LEVELS[0])
        })

        this._currentWay = nextWay
    }

    createCollisionCenter() {
        const geomColT = new THREE.BoxGeometry(7, 7, 7)
        this._mCollisionNextBuild = new THREE.Mesh(geomColT, this._root.materials.collision)

        this._mCollisionNextBuild.name = 'collisionNextBuild'
        this._mCollisionNextBuild.visible = false
        this._root.studio.add(this._mCollisionNextBuild)
    }  
}
