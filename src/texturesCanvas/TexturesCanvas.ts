import * as THREE from 'three' 
        
const S = 256

const show = (iron00Map: HTMLCanvasElement) => {
    document.body.appendChild(iron00Map)
    iron00Map.style.position = 'absolute'
    iron00Map.style.left = '0'
    iron00Map.style.top = '0'
    iron00Map.style.zIndex = '100'
    iron00Map.style.border = '1px solid red'
}

const ROAD_COLOR = "#234e6c"

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
            const texEmpty = createEmpty()
            const tex1 = create1()
            const texSide = createSide()
            const tex2 = createTex2()
            const tex3 = createTex3() 
            const tex4 = createTex4() 

            ///////////////////////////////

            const canMain = document.createElement('canvas')
            canMain.width = S * 4
            canMain.height = S * 4

            const ctx = canMain.getContext('2d')

            ctx.drawImage(texEmpty, 0, 0)
            ctx.drawImage(tex1, S, 0)
            ctx.drawImage(texSide, S * 2, 0)
            ctx.drawImage(tex2, S * 3, 0)
            ctx.drawImage(tex3, 0, S)
            ctx.drawImage(tex4, S, S)

            // show(canMain)

            this.iron00Map = new THREE.CanvasTexture(canMain) 
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

const create1 = () => { // треугольник светлый в центре, черные треугольники по бокам
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
    ctx.fillStyle = ROAD_COLOR
    ctx.moveTo(S * 0.1, S * 0.3)
    ctx.lineTo(S * 0.1, S * 0.9)
    ctx.lineTo(S * 0.4, S * 0.9)
    ctx.closePath()
    ctx.fill()

    ctx.beginPath()
    ctx.fillStyle = ROAD_COLOR
    ctx.moveTo(S * 0.9, S * 0.3)
    ctx.lineTo(S * 0.9, S * 0.9)
    ctx.lineTo(S * 0.6, S * 0.9)
    ctx.closePath()
    ctx.fill()

    return iron00Map
}

const createSide = () => { // решетка
    const iron00Map = document.createElement('canvas')
    iron00Map.width = S
    iron00Map.height = S

    const ctx = iron00Map.getContext('2d')
    ctx.fillStyle = "#ffffff"

    const offset1 = .01 * S
    const s = S - 2 * offset1
    ctx.fillRect(offset1, offset1, s, s)

    const offset = .1 * S
    const SIZE = S * .03
    const n = 10
    ctx.fillStyle = '#000000'
    const step = (S - 2 * offset) / (n - 1)
    for (let i = 0; i < n; i++) { 
        for (let j = 0; j < n; j++) {
            ctx.fillRect(
                offset + i * step - SIZE * .5,
                offset + j * step - SIZE * .5,
                SIZE, SIZE
            )
        }
    }

    return iron00Map
}


const createTex2 = () => { // решетка паралельная
    const iron00Map = document.createElement('canvas')
    iron00Map.width = S
    iron00Map.height = S

    const ctx = iron00Map.getContext('2d')
    ctx.fillStyle = "#484848"
    const offset1 = S * .01
    const s = S - 2 * offset1
    ctx.fillRect(offset1, offset1, s, s)

    ctx.fillStyle = "#000000"
    const offset2 = S * .03
    const s2 = S - 2 * offset2
    ctx.fillRect(offset2, offset2, s2, s2)

    const SIZE = S * .03
    const n = 10
    ctx.fillStyle = '#414141'
    const step = (S - 2 * offset2) / (n - 1)
    for (let i = 1; i < (n - 1); i++) { 
        ctx.fillRect(
            offset2 + i * step - SIZE * .5,
            offset2 + SIZE,
            SIZE,
            S - (offset2 * 2) - SIZE - SIZE
        )
    }

    return iron00Map
}

const createTex3 = () => { // решетка крестик
    const iron00Map = document.createElement('canvas')
    iron00Map.width = S
    iron00Map.height = S
    const ctx = iron00Map.getContext('2d')
    
    ctx.fillStyle = ROAD_COLOR
    const offset2 = 0
    const s2 = S - 2 * offset2
    ctx.fillRect(offset2, offset2, s2, s2)
    
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = S * .1
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(S, S)
    ctx.moveTo(0, S)
    ctx.lineTo(S, 0)
    ctx.stroke()

    const bolt = (x: number, y: number, r: number) => {
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = '#333333'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x, y, r * .93, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
    }

    bolt(0, 0, S * .15)
    bolt(S, 0, S * .15)
    bolt(S, S, S * .15)
    bolt(0, S, S * .15)

    return iron00Map
}
const createTex4 = () => { // решетка крестик + кружок
    const iron00Map = document.createElement('canvas')
    iron00Map.width = S
    iron00Map.height = S
    const ctx = iron00Map.getContext('2d')
    
    ctx.fillStyle = ROAD_COLOR
    const offset2 = 0
    const s2 = S - 2 * offset2
    ctx.fillRect(offset2, offset2, s2, s2)
    
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = S * .1
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(S, S)
    ctx.moveTo(0, S)
    ctx.lineTo(S, 0)
    ctx.stroke()

    const bolt = (x: number, y: number, r: number, hole: boolean) => {
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = '#333333'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x, y, r - 3, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()

        if (hole) {
            ctx.beginPath()
            ctx.arc(x, y, r * .45, 0, Math.PI * 2)
            ctx.fillStyle = '#610c4d'
            ctx.fill()
        }
    }

    bolt(0, 0, S * .15, false)
    bolt(S, 0, S * .15, false)
    bolt(S, S, S * .15, false)
    bolt(0, S, S * .15, false)
    bolt(S * .5, S * .5, S * .45, true)

    // show(iron00Map)

    return iron00Map
}
