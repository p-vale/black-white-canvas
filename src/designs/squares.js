import setCanvas from '../setCanvas'

let [canvas, context, canvasW, canvasH] = setCanvas()
    
const width = canvasW / 7.5
const height = canvasH / 7.5
const border = canvasW / 71
const gap = canvasW / 14.2
const off = canvasW / 45
const offD = off * 2
let x, y;
context.lineWidth = border

function squares () {
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      x = border * 2 + (width + gap) * i
      y = border * 2 + (height + gap) * j

      context.beginPath()
      context.rect(x, y, width, height)
      context.stroke()

      if (Math.random() > 0.5) {
        context.beginPath()
        context.rect(x +off, y +off, width -offD, height -offD)
        context.stroke()
      }
    }
  }
  return canvas
}

export default squares
