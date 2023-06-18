import './style.css'
import wrapper from './wrapper'
import squares from './designs/squares'
import circle from './designs/circle'
import pois from './designs/pois'
import netpoints from './designs/netpoints'
import noise from './designs/noise'
import bitmap from './designs/bitmap'
import glyph from './designs/glyph'
import glyphs from './designs/glyphs'

// title
const title = document.createElement('h1')
title.innerHTML = 'Javascript cerative coding examples'

// exercices
let text = ''
const squaresDescr = 'Grid of squares with random smaller squares.'
const circleDescr = 'Random arch and graduations.'
const poisDescr = 'Bouncing pois.'
const netpointsDescr = 'Bouncing pois with connectors.'
const noiseDescr = 'Angle and height noise animation.'
const bitmapDescr = 'Click on a keyboard letter to change bitmap.'
const glyphDescr = 'Static glyph brightness map.'
const glyphsDescr = 'Static glyphs brightness map.'

const animateBitmap = (p) => {
  const ref = 'bitmap'
  let prevRefs = document.querySelectorAll(`.${ref}`)
  if (prevRefs) {
    prevRefs.forEach(prevRef => prevRef.remove())
  }
  wrapper(p, bitmap(text), bitmapDescr, ref, 9)
}

function component () {
  const el = document.createElement('div')
  el.setAttribute('id', 'container')

  wrapper(el, squares(), squaresDescr)
  wrapper(el, circle(), circleDescr)
  wrapper(el, pois(), poisDescr)
  wrapper(el, netpoints(), netpointsDescr)
  wrapper(el, noise(), noiseDescr)
  animateBitmap(el)
  wrapper(el, glyph('B'), glyphDescr)
  wrapper(el, glyphs('C'), glyphsDescr)


  document.addEventListener('keyup', (e) => {
    text = e.key
    text = text.toUpperCase()
    animateBitmap(el)
  })
  
  return el;
}

// credits
const footer = document.createElement('div')
footer.setAttribute('id', 'footer')

const profile = document.createElement('a')
const link = document.createTextNode('p-vale') // can't use innerHTML or title with <a>
profile.appendChild(link)
profile.href = 'https://github.com/p-vale/black-white-canvas'
const credits = document.createElement('p')
credits.innerHTML = 'made by '
credits. appendChild(profile)

footer.appendChild(credits)

// render
document.body.appendChild(title)
document.body.appendChild(component())
document.body.appendChild(footer)
