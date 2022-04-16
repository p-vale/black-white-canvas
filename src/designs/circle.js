const c_math = require('canvas-sketch-util/math')
const c_random = require('canvas-sketch-util/random')
import setCanvas from '../setCanvas'

let [canvas, context, canvasW, canvasH] = setCanvas()

    const cx = canvasW / 2
    const cy = canvasH / 2
    let x, y;
    const w = canvasW / 100
    const h = canvasH / 10

    const ticks = 12
    const radius = canvasW / 3

function circle() {
    for (let i = 0; i < ticks; i++) {
        const slice = c_math.degToRad(360 / ticks)
        const angle = slice * i

        x = cx + radius * Math.sin(angle)
        y = cy + radius * Math.cos(angle)

        context.save()
            context.translate(x, y)
            context.rotate(-angle)
            context.scale(c_random.range(0.5, 2), c_random.range(0.5, 2))
            
            context.fillStyle = "black"
            context.beginPath()
            context.rect(-w/2, -h/2, w, h)
            context.fill()
        context.restore()

        context.save()
            context.lineWidth = c_random.range(1, 10)
            context.translate(cx, cy)
            context.rotate(-angle)
            context.beginPath()
            context.arc(0, 0, radius * c_random.range(0.75, 1.25), slice * c_random.range(1, -8), slice * c_random.range(1, 2))
            context.stroke()
        context.restore()
    }
    return canvas
}

export default circle
