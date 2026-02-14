import { createLongWay } from "geometry/longWay/longWay"
import * as THREE from "three"
import { _M } from "geometry/_m"

let VERT_COUNT = 0
let sabVertex: Float32Array = null
let sabNormals: Float32Array = null
let sabColor: Float32Array = null
let sabUv: Float32Array = null
let sabVertexCollide: Float32Array = null
let flagCompleteSAB: Int32Array = null
let coordsLongWayPartsSAB: Float32Array = null

self.onmessage = (e) => {
    if (e.data.keyMessage === 'init') {
        VERT_COUNT = e.data.VERT_COUNT
        sabVertex = new Float32Array(e.data.sabVertex)
        sabNormals = new Float32Array(e.data.sabNormals)
        sabColor = new Float32Array(e.data.sabColor)
        sabUv = new Float32Array(e.data.sabUv)
        sabVertexCollide = new Float32Array(e.data.sabVertexCollide)
        flagCompleteSAB = new Int32Array(e.data.flagCompleteSAB)
        coordsLongWayPartsSAB = new Float32Array(e.data.coordsLongWayPartsSAB)
    }

    if (e.data.keyMessage === 'update') {
        const options = {
            p0: new THREE.Vector3(0, 0, 0),
            p1: new THREE.Vector3(400, 0, 0),
            dir0: new THREE.Vector3(1, 0, 0),
            dir1: new THREE.Vector3(1, 0, 0),
        }

        const { geomData: { v, c, uv, vCollide }, segments } = createLongWay(options)
        
        console.log('[MESSAGE:] verticies level n:', v.length / 3)
        console.log('[MESSAGE:] verticies collision n:', vCollide.length / 3)
        
        _M.fillStart(v, sabVertex)
        _M.fillStart(c, sabColor)
        _M.fillStart(uv, sabUv)
        const n = _M.computeNormalsV(v)
        _M.fillStart(n, sabNormals)
        _M.fillStart(vCollide, sabVertexCollide)

        const firstSeg = segments[0]
        coordsLongWayPartsSAB[0] = firstSeg.axisP0.x
        coordsLongWayPartsSAB[1] = firstSeg.axisP0.y
        coordsLongWayPartsSAB[2] = firstSeg.axisP0.z
        const centerSeg = segments[Math.floor(segments.length / 2)]
        coordsLongWayPartsSAB[3] = centerSeg.axisP1.x 
        coordsLongWayPartsSAB[4] = centerSeg.axisP1.y 
        coordsLongWayPartsSAB[5] = centerSeg.axisP1.z
        const lastSeg = segments[segments.length - 1]
        coordsLongWayPartsSAB[6] = lastSeg.axisP1.x
        coordsLongWayPartsSAB[7] = lastSeg.axisP1.y
        coordsLongWayPartsSAB[8] = lastSeg.axisP1.z

        Atomics.store(flagCompleteSAB, 0, 1)
        Atomics.notify(flagCompleteSAB, 0)
    }
}
