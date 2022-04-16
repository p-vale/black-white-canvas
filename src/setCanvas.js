function setCanvas() {
    let canvas = document.createElement("canvas")
    let context = canvas.getContext("2d")
    const canvasW = 500
    const canvasH = 500
    canvas.width = canvasW
    canvas.height = canvasH

    return [canvas, context, canvasW, canvasH]
}

export default setCanvas