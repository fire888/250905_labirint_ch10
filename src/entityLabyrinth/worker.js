// src/worker.js
import { _M } from "geometry/_m";

let data = null;
let flag = null;
let W = 0;
let H = 0;
let N = 0;

const calculateLevel = () => {
    const v = []

    while (true) { 
        const p0 = [Math.random() * 100, Math.random() * 100, Math.random() * 100]
        const p1 = [p0[0] + 2, p0[1], p0[2]]

        const r = _M.createPolygon(
          p0,
          p1,
          [p1[0], p1[1] + 1, p1[2]],
          [p0[0], p0[1] + 1, p0[2]],
        )

        if ((v.length + r.length) / 3 < N) {
            v.push(...r)
        } else {
           break
        }
    }

    // дозаливаем нулями
    while (v.length / 3 < N) {
      v.push(0)
    }

    return v
}

const fillBuffer = (vv) => {
  let idx = 0;
  for (let i = 0; i < N; i++) {
    const j = i * 3;
    data[idx++] = vv[j    ];
    data[idx++] = vv[j + 1];
    data[idx++] = vv[j + 2];
    data[idx++] = 1.0;
  }
  Atomics.store(flag, 0, 1);
  Atomics.notify(flag, 0);
}

self.onmessage = (e) => {
  if (e.data.keyMessage === 'init') {
    data = new Float32Array(e.data.sab)
    flag = new Int32Array(e.data.flagSAB)
    W = e.data.w
    H = e.data.h
    N = W * H

    const v = calculateLevel()
    fillBuffer(v)
  }

  if (e.data.keyMessage === 'update') {
    console.log('UPDATE')
    const v = calculateLevel()
    fillBuffer(v)
  }
}
