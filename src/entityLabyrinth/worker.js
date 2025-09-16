// src/worker.js


let data = null;
let flag = null;
let w = 0;
let h = 0;
let t = 0;
let N = 0;


function writeFrame(d) {

  let idx = 0;
  for (let i = 0; i < N; i++) {
    const xIdx = i % w;
    const yIdx = (i / w) | 0;

    const u = xIdx / (w - 1);
    const v = yIdx / (h - 1);

    // координаты плоскости [-1,1]
    const x = (u - 0.5) * 2.0;
    const y = (v - 0.5) * 2.0;

    // волнистая z, меняется по t
    const z = Math.sin(u * Math.PI * 6.0 + t) * Math.cos(v * Math.PI * 6.0 - t) * 0.25;

    data[idx++] = x * d;
    data[idx++] = y * d;
    data[idx++] = z * d;
    data[idx++] = 1.0; // w-компонента (можете использовать под что-то своё)
  }

  t = Math.random() * 100

  // Сигнал "кадр готов"
  Atomics.store(flag, 0, 1);
  Atomics.notify(flag, 0);

  console.log('complete calculate')

  // Максимально дёшево планируем следующий апдейт
  // Можно setTimeout(0), MessageChannel и т.п. — подберите, что лучше по нагрузке
  // setTimeout(writeFrame, 0);
}


self.onmessage = (e) => {
  if (e.data.keyMessage === 'init') {
    console.log('INIT')
    data = new Float32Array(e.data.sab)
    flag = new Int32Array(e.data.flagSAB)
    w = e.data.w;
    h = e.data.h;

    N = w * h;

    writeFrame(Math.random() * 50);
  }

  if (e.data.keyMessage === 'update') {
    console.log('UPDATE')
    writeFrame(Math.random() * 50);
  }
}
