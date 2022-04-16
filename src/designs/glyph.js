import setCanvas from '../setCanvas'

let fontSize = 0
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

function glyph(text) {
    if (text == '') text = 'A'

    typeContext.fillStyle = 'white'
    typeContext.fillRect(0, 0, cols, rows)

    typeContext.fillStyle = 'black'
    fontSize = cols * 1.3
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

    const typeData = typeContext.getImageData(0, 0, cols, rows).data // only the data array of the Image data object

    // canvas
    for (let i = 0; i< numCells; i++) {
        const col = i % cols
        const row = Math.floor(i / cols)

        const canvasX = col * cell
        const canvasY = row * cell

        // color = typeData[n]
        // to invert color use 255 - typeData [i]
        const r = typeData[i * 4 + 0]
        const g = typeData[i * 4 + 1]
        const b = typeData[i * 4 + 2]
        const a = typeData[i * 4 + 3]


        context.fillStyle = `rgb(${r}, ${g}, ${b})`
        context.save()
        context.translate(canvasX, canvasY)
        context.translate(cell / 2, cell / 2) // draw circle from center
        context.fillText(text, 0, 0)
        context.restore()
    }



    return canvas
}

export default glyph
