import { Root } from '../index'

export const pipelinePlay = async (root: Root, currentIndexLevel = 0) => {
    console.log('[MESSAGE:] START PLAY')

    const {
        studio,
        controls,
        lab,
        ticker,
        phisics
    } = root


    ticker.on(() => {
        if (studio.camera.position.y < -12) {
            phisics.setPlayerPosition(
                lab._currentWay.startPoint.x, 
                lab._currentWay.startPoint.y + 2, 
                lab._currentWay.startPoint.z
            )
        }
    })

}
