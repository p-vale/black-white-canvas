const c_random = require('canvas-sketch-util/random')
import setCanvas from '../setCanvas'

let [canvas, context, canvasW, canvasH] = setCanvas()

function pois() {
    class Vector {
        constructor(x, y) {
            this.x = x
            this.y = y
        }
    }
    
    class Agent {
        constructor(x, y) {
            this.pos = new Vector(x, y)
            this.vel = new Vector(c_random.range(-1, 1), c_random.range(-1, 1))
            this.radius = c_random.range(2, 8)
        }
    
        update() {
            this.pos.x += this.vel.x
            this.pos.y += this.vel.y
        }
    
        bounce(w, h) {
            if (this.pos.x <= 0 || this.pos.x >= w) this.vel.x *= -1
            if (this.pos.y <= 0 || this.pos.y >= h) this.vel.y *= -1
        }
    
        draw(context) {
            context.save()
            context.translate(this.pos.x, this.pos.y)
    
            context.beginPath()
            context.arc(0, 0, this.radius, 0, Math.PI *2)
            context.fill()
            context.stroke()
    
            context.restore()
        }
    }
    
    const agents = []
    context.fillStyle = "white"
    context.lineWidth = 2
    
    for (let i = 0; i < 50; i++) {
        const x = c_random.range(0, canvasW)
        const y = c_random.range(0, canvasH)
        agents.push(new Agent(x, y))
    }
    
    function animate() {
        window.requestAnimationFrame(animate)
        context.clearRect(0, 0, canvasW, canvasH)
        agents.forEach(point => {
            point.update()
            point.bounce(canvasW, canvasH)
            point.draw(context)
            }
        )
    
    }
    animate()

    return canvas
}

export default pois
