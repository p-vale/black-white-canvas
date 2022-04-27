import setCanvas from '../setCanvas'
const c_random = require('canvas-sketch-util/random')
const c_math = require('canvas-sketch-util/math')

let [canvas, context, canvasW, canvasH] = setCanvas()

const cols = 25
const rows = 25
const cellNum = cols * rows
const gridW = canvasW * 0.8
const gridH = canvasH * 0.8
const cellW = gridW / cols
const cellH = gridH / rows
const marginX = (canvasW - gridW) / 2
const marginY = (canvasH - gridH) / 2

let frame = 0

function noise () {
  window.requestAnimationFrame(noise)
  context.clearRect(0, 0, canvasW, canvasH)
  frame = frame + 5

  for (let i = 0; i < cellNum; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)

    const x = col * cellW
    const y = row * cellH
    const w = cellW * 0.8
    const h = cellH * 0.8

    const n = c_random.noise2D(x + frame, y, 0.001) // values of x and y too big by themselves, give lower frequency
    const angle = n * Math.PI * 0.3 //using this for the amplitude would mess the results of n (-1 to 1 now)
    //thus, it is moved in the angle
    const scale = c_math.mapRange(n, -1, 1, 0.5, cellW)

    context.save()
    context.translate(x, y) //cell space begin
    context.translate(cellW * 0.5, cellH * 0.5) // go to the center of the cell
    context.translate(marginX, marginY) //add canvas margin
    context.rotate(angle) //rotate context "equals" to rotating the lines
    
    context.lineWidth = scale

    context.beginPath()
    context.moveTo(w * -0.5, 0)
    context.lineTo(w * 0.5, 0)
    context.stroke()

    context.restore()    
  }
  return canvas
}

export default noise
