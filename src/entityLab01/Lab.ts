import { Root } from "../index"
import { _M } from "../geometry/_m"
import * as THREE from "three"
import { Way } from "./Way"
import { createHelix00 } from "geometry/helix00/helix00"
import { createColumn01 } from "geometry/column01/column01"
import { createColumn02 } from "geometry/column02/column02"
import { createFloor00 } from "geometry/floor00/floor00"
import { createPlatform00 } from "geometry/platform00/platform00"
import { createPlatform01Round } from "geometry/platform01Round/platfotm01Round"

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

        this._buildTest()
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

        this._root.backTower.setPositionX(nextWay.endPoint.x + 100)

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
    
    private _buildTest() {
        //const { v, c, uv, vCollide } = createPlatform01Round()

        //const m = _M.createMesh({ v, c, uv, material: this._root.materials.materialLab })
        //m.position.set(0, 5, 0)

        //this._root.studio.add(m)
    }
}
