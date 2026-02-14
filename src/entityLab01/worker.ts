//import { calculateLevel } from "entityLabyrinth/GeomLab/geomLab";
import { createLongWay } from "geometry/longWay/longWay"
import * as THREE from "three"
import { _M } from "geometry/_m"

let VERT_COUNT = 0
let vertexSAB: Float32Array = null
let normalsSAB: Float32Array = null
let colorSAB: Float32Array = null
let uvSAB: Float32Array = null
let flag: Int32Array = null


// const fillBuffer = (src: number[], target: Float32Array) => {
//     for (let i = 0; i < VERT_COUNT; ++i) {
//         target[i] = src[i]
//     }
// }



self.onmessage = (e) => {
    const recalculateBuffers = () => {
        const options = {
            p0: new THREE.Vector3(0, 0, 0),
            p1: new THREE.Vector3(400, 0, 0),
            dir0: new THREE.Vector3(1, 0, 0),
            dir1: new THREE.Vector3(1, 0, 0),
        }

        const { geomData: { v, c, uv }, segments } = createLongWay(options)
        
        console.log('[MESSAGE:] vertticies n:', v.length / 3)
        
        _M.fillStart(v, vertexSAB)
        
        const n = _M.computeNormalsV(v)
        _M.fillStart(n, normalsSAB)
        
        _M.fillStart(c, colorSAB)
        
        _M.fillStart(uv, uvSAB)
        
        Atomics.store(flag, 0, 1)
        Atomics.notify(flag, 0)
    }  
  
    if (e.data.keyMessage === 'init') {
        VERT_COUNT = e.data.VERT_COUNT
        vertexSAB = new Float32Array(e.data.sabVertex)
        normalsSAB = new Float32Array(e.data.sabNormals)
        colorSAB = new Float32Array(e.data.sabColor)
        uvSAB = new Float32Array(e.data.sabUv)
        flag = new Int32Array(e.data.flagCompleteSAB)
    }

    if (e.data.keyMessage === 'update') {
        recalculateBuffers()
    }
}
