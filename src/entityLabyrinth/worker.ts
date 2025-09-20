import { calculateLevel } from "entityLabyrinth/GeomLab/geomLab";

let data: Float32Array = null
let flag: Int32Array = null
let W = 0
let H = 0
let N = 0

const fillBuffer = (vv: number[]) => {
    let idx = 0;
    for (let i = 0; i < N; i++) {
        const j = i * 3;
        data[idx++] = vv[j    ]
        data[idx++] = vv[j + 1]
        data[idx++] = vv[j + 2]
        data[idx++] = 1.0
    }
}

self.onmessage = (e) => {
    const recalculateBuffers = () => {
        const { v } = calculateLevel(N)
        fillBuffer(v)
        Atomics.store(flag, 0, 1)
        Atomics.notify(flag, 0)
    }  
  
    if (e.data.keyMessage === 'init') {
        data = new Float32Array(e.data.sab)
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
