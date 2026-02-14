import * as THREE from 'three'
import { Root } from 'index'

export class Materials {
    //walls00: THREE.MeshPhongMaterial | THREE.MeshStandardMaterial
    // road: THREE.MeshStandardMaterial
    // desert: THREE.MeshPhongMaterial | THREE.MeshStandardMaterial
    collision: THREE.MeshBasicMaterial
    materialLab: THREE.MeshStandardMaterial
    
    init (root: Root) {
        this.materialLab = new THREE.MeshStandardMaterial({
            // color: 0xffffff,
            // //roughness: .05,
            // //metalness: .5,
            // roughness: 0,
            // metalness: .7,
            // //metalnessMap : this._root.texturesCanvas.iron00Map,
            // //map: this._root.loader.assets.el_0,
            // map: root.texturesCanvas.iron00Map,
            // //normalMap: this._root.loader.assets.el_0_norm,
            // bumpMap: root.texturesCanvas.iron00Map,
            // bumpScale: .5,
            // //normalScale: new THREE.Vector2(3, 3),
            // aoMap: root.texturesCanvas.iron00Map,
            // aoMapIntensity: 1,
            // //envMap: this._root.loader.assets.env,
            // envMap: root.texturesCanvas.env,
            // envMapIntensity: 1,
            // //vertexColors: true,
            // // wireframe: true




            // DO NOT DELETE ////////////////
            color: 0xffffff,
            roughness: 0,
            metalness: .7,
            map: root.texturesCanvas.iron00Map,
            bumpMap: root.texturesCanvas.iron00Map,
            bumpScale: .5,
            aoMap: root.texturesCanvas.iron00Map,
            aoMapIntensity: 1,
            envMap: root.texturesCanvas.env,
            envMapIntensity: 1,
            vertexColors: true,




            //color: 0xffffff,
        })
        this.collision = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    }

    changeWallMaterial(data: { color: number[], emissive: number[], specular: number[] }) {
        // this.walls00.color.fromArray(data.color)
        // this.walls00.emissive.fromArray(data.emissive)
        // this.walls00.needsUpdate = true
    }

    changeRoadMaterial(data: { color: number[], emissive: number[] }) {
        // this.road.color.fromArray(data.color)
        // this.road.emissive.fromArray(data.emissive)
        // this.road.needsUpdate = true
    }

    changeDesertMaterial(data: { color: number[], emissive: number[], specular: number[] }) {
        // this.desert.color.fromArray(data.color)
        // this.desert.emissive.fromArray(data.emissive)
        // this.desert.needsUpdate = true
    }
}