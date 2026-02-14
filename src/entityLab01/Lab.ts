import { Root } from "../index"
import { _M } from "../geometry/_m"
import * as THREE from "three"
import { ILevelConf, T_ROOM } from "types/GeomTypes";
import { LEVELS } from '../constants/CONSTANTS'
import { Way } from "./Way"

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

        this._way1 = new Way('way1', this._root, 0)
        this._way2 = new Way('way2', this._root, 0)

        this._createCollisionCenter()
    }

    async buildNext (conf: ILevelConf) {
        const startPoint = new THREE.Vector3()
        this._currentWay && startPoint.copy(this._currentWay.endPoint).add(new THREE.Vector3(0, -1, 0))

        const nextWay = this._currentWay && this._currentWay.name === 'way1' 
            ? this._way2
            : this._way1

        nextWay.build(startPoint)

        //this._mCollisionNextBuild.position.copy(nextWay.centerPoint)
        //this._mCollisionNextBuild.position.copy(new THREE.Vector3(-100, 0, 0))
        //this._root.phisics.addMeshToCollision(this._mCollisionNextBuild)
        //this._root.phisics.onCollision('collisionNextBuild', () => {
        //    this._root.phisics.removeMeshFromCollision(this._mCollisionNextBuild.name)          
        //    this.buildNext(LEVELS[0])
        //})

        this._currentWay = nextWay

        setTimeout(() => {
            this.buildNext(LEVELS[0])
        }, 15000)
    }

    private _createCollisionCenter() {
        const geomColT = new THREE.BoxGeometry(7, 7, 7)
        this._mCollisionNextBuild = new THREE.Mesh(geomColT, this._root.materials.collision)
        this._mCollisionNextBuild.name = 'collisionNextBuild'
    }  
}
