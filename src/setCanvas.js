function setCanvas () {
  let canvas = document.createElement('canvas')
  let context = canvas.getContext('2d')
  let canvasW = 500
  let canvasH = 500
  let screenWidth = window.screen.width
  if (screenWidth < 600) {
    canvasW = 400
    canvasH = 400
  } else if (screenWidth < 400) {
    canvasW = 300
    canvasH = 300
  }
  canvas.width = canvasW
  canvas.height = canvasH

  return [canvas, context, canvasW, canvasH]
}

export default setCanvas
