import { _M, A3 } from "geometry/_m";

export const calculateLevel = (N: number) => {
    const v = []
    const c = []
    const uv = []

    while (true) { 
        const p0: A3 = [Math.random() * 100, Math.random() * 100, Math.random() * 100]
        const p1: A3 = [p0[0] + 2, p0[1], p0[2]]

        const _v = _M.createPolygon(
            p0,
            p1,
            [p1[0], p1[1] + 1, p1[2]],
            [p0[0], p0[1] + 1, p0[2]],
        )

        const angleX = Math.random() * Math.PI * 2
        const angleY = Math.random() * Math.PI * 2
        const angleZ = Math.random() * Math.PI * 2

        _M.rotateVerticesX(_v, angleX)
        _M.rotateVerticesY(_v, angleY)
        _M.rotateVerticesZ(_v, angleZ)

        //const rN = _M.computeNormals(r)
        const _c = _M.fillColorFace([Math.random(), Math.random(), Math.random()])
        const _uv = _M.createUv([0, 0], [1, 0], [1, 1], [0, 1])

        if ((v.length + _v.length) / 3 < N) {
            v.push(..._v)
            c.push(..._c)
            uv.push(..._uv)
        } else {
            break
        }
    }

    // дозаливаем нулями
    while (v.length / 3 < N) {
        v.push(0)
        c.push(0)
    }

    return { v, c, uv }
}