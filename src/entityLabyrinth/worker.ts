import { calculateLevel } from "entityLabyrinth/GeomLab/geomLab";

let dataVertex: Float32Array = null
let dataColor: Float32Array = null
let dataUv: Float32Array = null
let flag: Int32Array = null
let W = 0
let H = 0
let N = 0

const fillBufferVertex = (vv: number[]) => {
    let idx = 0;
    for (let i = 0; i < N; i++) {
        const j = i * 3;
        dataVertex[idx++] = vv[j    ]
        dataVertex[idx++] = vv[j + 1]
        dataVertex[idx++] = vv[j + 2]
        dataVertex[idx++] = 1.0
    }
}

const fillBufferColor = (vv: number[]) => {
    let idx = 0;
    for (let i = 0; i < N; i++) {
        const j = i * 3;
        dataColor[idx++] = vv[j    ]
        dataColor[idx++] = vv[j + 1]
        dataColor[idx++] = vv[j + 2]
        dataColor[idx++] = 1.0
    }
}

const fillBufferUv = (vv: number[]) => {
    let idx = 0;
    for (let i = 0; i < N / 4 * 2; i++) {
        const j = i * 2;
        dataUv[idx++] = vv[j    ]
        dataUv[idx++] = vv[j + 1]
    }
}

self.onmessage = (e) => {
    const recalculateBuffers = () => {
        const { v, c, uv } = calculateLevel(N)
        fillBufferVertex(v)
        fillBufferColor(c)
        fillBufferUv(uv)
        Atomics.store(flag, 0, 1)
        Atomics.notify(flag, 0)
    }  
  
    if (e.data.keyMessage === 'init') {
        dataVertex = new Float32Array(e.data.sabVertex)
        dataColor = new Float32Array(e.data.sabColor)
        dataUv = new Float32Array(e.data.sabUv)
        flag = new Int32Array(e.data.flagSAB)
        W = e.data.w
        H = e.data.h
        N = W * H

        recalculateBuffers()
    }

    if (e.data.keyMessage === 'update') {
        recalculateBuffers()
    }
}
