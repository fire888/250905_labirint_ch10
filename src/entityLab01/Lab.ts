import { Root } from "../index"
import { _M } from "../geometry/_m"
import * as THREE from "three"
import { Way } from "./Way"

export class Labyrinth {
    static isCanBuild = true 

    _countBuild = -1
    _root: Root

    _way1: Way
    _way2: Way

    _mCollisionNextBuild: THREE.Mesh 

    _currentWay: Way

    constructor() {}
    async init (root: Root) {
        this._root = root

        this._way1 = new Way('way1', this._root)
        this._way2 = new Way('way2', this._root)

        this._mCollisionNextBuild = this._createCollisionCenter()
    }

    async buildNext () {
        if (Labyrinth.isCanBuild === false) { return }
        Labyrinth.isCanBuild = false
        setTimeout(() => { Labyrinth.isCanBuild = true }, 5000)

        ++this._countBuild

        const date = Date.now()
        console.log('[MESSAGE:] START BUILD LEVEL:', this._countBuild)

        const startPoint = new THREE.Vector3()
        this._currentWay && startPoint.copy(this._currentWay.endPoint).add(new THREE.Vector3(0, -1, 0))

        const nextWay = this._currentWay && this._currentWay.name === 'way1' 
            ? this._way2
            : this._way1

        await nextWay.build(startPoint)

        this._mCollisionNextBuild.name += '|_'
        this._mCollisionNextBuild.position.copy(nextWay.centerPoint)
        this._root.phisics.addMeshToCollision(this._mCollisionNextBuild)
        this._root.phisics.onCollision('collisionNextBuild', () => {
            this._root.phisics.removeMeshFromCollision(this._mCollisionNextBuild.name)          
            this.buildNext()
        })

        this._currentWay = nextWay

        console.log('[MESSAGE:] COMPLETE BUILD LEVEL:', ((Date.now() - date) / 1000).toFixed(2), 'sec')
    }

    private _createCollisionCenter() {
        const geomColT = new THREE.BoxGeometry(7, 7, 7)
        const m = new THREE.Mesh(geomColT, this._root.materials.collision)
        m.name = 'collisionNextBuild'
        return m
    }  
}
