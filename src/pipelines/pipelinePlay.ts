import { Root } from '../index'
import * as THREE from 'three'

export const pipelinePlay = async (root: Root, currentIndexLevel = 0) => {
    console.log('[MESSAGE:] START PLAY')

    const {
        studio, lab, ticker, phisics
    } = root

    ticker.on(() => {
        if (studio.camera.position.y < -12) {
            const startPoint = lab.getCurrentStartPoint().clone().add(new THREE.Vector3(1, 2, 0))
            phisics.setPlayerPosition(...startPoint.toArray())
            studio.camera.rotation.y = Math.PI * 1.5
        }
    })
}
