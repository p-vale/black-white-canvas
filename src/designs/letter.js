import setCanvas from '../setCanvas'

let fontSize = 400
let fontFamily = 'serif'

function bitmap (text) {
  if (text === '') text = 'A'
  let [canvas, context, canvasW, canvasH] = setCanvas()

  context.fillStyle = 'black'
  context.font = `${fontSize}px ${fontFamily}`
  context.textBaseline = 'top'

  const metrics = context.measureText(text)
  const txtX = metrics.actualBoundingBoxLeft * -1
  const txtY = metrics.actualBoundingBoxAscent * -1
  const txtW = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight
  const txtH = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent

  const x = (canvasW - txtW) * 0.5 - txtX
  const y = (canvasH - txtH) * 0.5 - txtY

  context.save()
  context.translate(x, y)
  context.beginPath()
  context.rect(txtX, txtY, txtW, txtH)
  context.stroke()
  context.fillText(text, 0, 0)
  context.restore()

  return canvas
}

export default bitmap
