// src/worker.js
self.onmessage = (e) => {
  const { sab, flagSAB, w, h } = e.data;

  const data = new Float32Array(sab);
  const flag = new Int32Array(flagSAB);

  let t = 0;

  const N = w * h;
  function writeFrame() {
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

      data[idx++] = x;
      data[idx++] = y;
      data[idx++] = z;
      data[idx++] = 1.0; // w-компонента (можете использовать под что-то своё)
    }

    t += 0.02;

    // Сигнал "кадр готов"
    Atomics.store(flag, 0, 1);
    Atomics.notify(flag, 0);

    // Максимально дёшево планируем следующий апдейт
    // Можно setTimeout(0), MessageChannel и т.п. — подберите, что лучше по нагрузке
    setTimeout(writeFrame, 0);
  }

  writeFrame();
}
