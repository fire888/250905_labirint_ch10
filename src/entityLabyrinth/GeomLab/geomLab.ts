import { _M, A3 } from "geometry/_m";

export const calculateLevel = (N: number) => {
    const v = []
    const n = []

    while (true) { 
        const p0: A3 = [Math.random() * 100, Math.random() * 100, Math.random() * 100]
        const p1: A3 = [p0[0] + 2, p0[1], p0[2]]

        const r = _M.createPolygon(
            p0,
            p1,
            [p1[0], p1[1] + 1, p1[2]],
            [p0[0], p0[1] + 1, p0[2]],
        )

        const angleX = Math.random() * Math.PI * 2
        const angleY = Math.random() * Math.PI * 2
        const angleZ = Math.random() * Math.PI * 2

        _M.rotateVerticesX(r, angleX)
        _M.rotateVerticesY(r, angleY)
        _M.rotateVerticesZ(r, angleZ)

        const rN = _M.computeNormals(r)

        if ((v.length + r.length) / 3 < N) {
            v.push(...r)
            n.push(...rN)
        } else {
            break
        }
    }

    // дозаливаем нулями
    while (v.length / 3 < N) {
        v.push(0)
        n.push(0)
    }

    return { v, n }
}