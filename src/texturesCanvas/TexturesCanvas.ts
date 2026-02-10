import * as THREE from 'three' 
        
const S = 256

export class TexturesCanvas {
    iron00Map: THREE.CanvasTexture
    //iron00AO: HTMLCanvasElement

    constructor() {}

    async init() {
        // { // empty 
        //     const t = createEmpty()
        //     this.iron00Map = new THREE.CanvasTexture(t)
        //     this.iron00Map.minFilter = THREE.NearestFilter
        // }

        { // 1
            const t = create1()
            this.iron00Map = new THREE.CanvasTexture(t) 
            this.iron00Map.minFilter = THREE.LinearMipmapLinearFilter
            //NearestFilter | NearestMipmapNearestFilter | NearestMipmapLinearFilter | LinearFilter | LinearMipmapNearestFilter | LinearMipmapLinearFilter
        }
    }
}

const createEmpty = () => {
    const iron00Map = document.createElement('canvas')
    iron00Map.width = S
    iron00Map.height = S

    const ctx = iron00Map.getContext('2d')
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, S, S)

    const offset = .02 * S
    const s = S - 2 * offset
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(offset, offset, s, s)

    return iron00Map
}

const create1 = () => {
    const iron00Map = document.createElement('canvas')
    iron00Map.width = S
    iron00Map.height = S

    const ctx = iron00Map.getContext('2d')

    const offset = .01 * S
    const s = S - 2 * offset
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(offset, offset, s, s)

    ctx.beginPath()
    ctx.strokeStyle = "#000000"
    ctx.fillStyle = "#4b4b4b"
    ctx.lineWidth = S * .05
    ctx.moveTo(S * 0.2, S * 0.2)
    ctx.lineTo(S * 0.5, S * 0.8)
    ctx.lineTo(S * 0.8, S * 0.2)
    ctx.closePath()
    ctx.stroke()

    ctx.beginPath()
    ctx.fillStyle = "#000000"
    ctx.moveTo(S * 0.1, S * 0.3)
    ctx.lineTo(S * 0.1, S * 0.9)
    ctx.lineTo(S * 0.4, S * 0.9)
    ctx.closePath()
    ctx.fill()

    ctx.beginPath()
    ctx.fillStyle = "#000000"
    ctx.moveTo(S * 0.9, S * 0.3)
    ctx.lineTo(S * 0.9, S * 0.9)
    ctx.lineTo(S * 0.6, S * 0.9)
    ctx.closePath()
    ctx.fill()

    return iron00Map
}