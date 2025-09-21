import { _M, A3 } from "geometry/_m";
import { buildHouse01 } from "geometry/house01/buildHouse01";
import { IPerimeter } from "types/GeomTypes";

export const calculateLevel = (N: number) => {
    const v = []
    const c = []
    const uv = []

    let xN = 0
    let zN = 0

    while (true) {
        const perimeter: IPerimeter = [
            [3, 13],
            [13, 13],
            [13, 3],
            [3, 3],
            [3, 13],
        ] 

        const house = buildHouse01(perimeter)
        const n = _M.computeNormals(house.v)

        if ((v.length + house.v.length) / 3 < N) {

            _M.translateVertices(house.v, xN * 15, 0, zN * 15)

            for (let i = 0; i < house.v.length; ++i) {
                v.push(house.v[i])
                c.push(n[i] * 0.5 + 0.5)
            }
            for (let i = 0; i < house.uv.length; ++i) {
                uv.push(house.uv[i])
            }

            ++xN
            if (xN > 10) { 
                xN = 0
                ++zN 
            } 

        } else {
            break
        }
    }

    return { v, c, uv }
}