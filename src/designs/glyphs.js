import setCanvas from '../setCanvas'
const c_random = require('canvas-sketch-util/random')

let fontSize
let fontFamily = 'serif'

let [canvas, context, canvasW, canvasH] = setCanvas()

const typeCanvas = document.createElement('canvas')
const typeContext = typeCanvas.getContext('2d')
const cell = 10
const cols = Math.floor(canvasW / cell)
const rows = Math.floor(canvasH / cell)
const numCells = cols * rows
typeCanvas.width = cols
typeCanvas.height = rows

const getGlyph = (v) => {
  if (v < 50) return '';
  if (v < 100) return '.';
  if (v < 150) return '-';
  if (v < 200) return '+';
  const els = ['_', '=', ' ', '/']

  return c_random.pick(els)
}

function glyphs (text) {
  if (text === '') text = 'A'

  typeContext.fillStyle = 'black'
  typeContext.fillRect(0, 0, cols, rows)

  typeContext.fillStyle = 'white'
  fontSize = cols * 1.2
  typeContext.font = `${fontSize}px ${fontFamily}`
  typeContext.textBaseline = 'top'

  const metrics = typeContext.measureText(text)
  const mX = metrics.actualBoundingBoxLeft * -1
  const mY = metrics.actualBoundingBoxAscent * -1
  const mW = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight
  const mH = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent

  const typeX = (cols - mW) * 0.5 - mX
  const typeY = (rows - mH) * 0.5 - mY

  typeContext.save()
  typeContext.translate(typeX, typeY)
  typeContext.fillText(text, 0, 0)
  typeContext.restore()

  const typeData = typeContext.getImageData(0, 0, cols, rows).data

  // canvas
  context.textBaseline = 'middle'
  context.textAlign = 'center'

  for (let i = 0; i < numCells; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)

    const canvasX = col * cell
    const canvasY = row * cell

    const r = typeData[i * 4 + 0]
    const g = typeData[i * 4 + 1]
    const b = typeData[i * 4 + 2]
    const a = typeData[i * 4 + 3]

    const glyph = getGlyph(r) // b&w can get brightness from any channel
    context.font = `${cell}px ${fontFamily}`
    if (Math.random() < 0.15) context.font = `${cell * 3}px ${fontFamily}`
    context.save()
    context.translate(canvasX, canvasY)
    context.translate(cell / 2, cell / 2) // draw circle from center
    context.fillText(glyph, 0, 0)
    context.restore()
  }
  return canvas
}

export default glyphs
