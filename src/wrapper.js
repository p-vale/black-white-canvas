function wrapper (parent, child, descr, ref, prevBro) {
  child.style.backgroundColor = 'white'
  child.style.filter = 'drop-shadow(0 0 10px rgb(200, 200, 200))'
  
  const box = document.createElement('div')
  box.classList.add('box')

  const description = document.createElement('p')
  description.innerHTML = descr

  if (ref) { //delete previous animateBitmap
    box.classList.add(ref)
    description.classList.add(ref)
  }

  box.appendChild(child)

  if (prevBro !== undefined) { //keep animateBitmap in the same place
    const before = parent.children[prevBro]
    before.insertAdjacentElement('afterend', box)
    box.insertAdjacentElement('afterend', description)
    return
  }

  parent.appendChild(box)
  parent.appendChild(description)
}

export default wrapper
