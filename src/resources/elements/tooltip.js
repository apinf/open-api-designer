import {bindable} from 'aurelia-framework'

export class Tooltip {
  @bindable text = ''

  mouseover() {
    // Make the tooltip popup visible.
    this.textbox.style.display = 'inline-block'

    const offsetTop = this.textbox.offsetTop
    const offsetLeft = this.textbox.offsetLeft
    const width = this.textbox.offsetWidth
    const documentWidth = document.documentElement.clientWidth
    const style = this.textbox.style

    // Place the tooltip popup below the info button so the right edges align.
    style.top = offsetTop + 'px'
    if (width > documentWidth) {
      style.width = '100%'
    }
    const distanceFromRightEdge = documentWidth - (offsetLeft + width)
    if (distanceFromRightEdge < 0) {
      // Popup doesn't fit if it's placed on the right side of the info button,

      // so place it below the info button
      style.top = (offsetTop + this.textbox.parentNode.offsetHeight) + 'px'
      // and to the left
      if (style.width !== '100%') {
        // There should be space on the left, so we can move it just enough.
        style.transform = 'translateX(' + distanceFromRightEdge + 'px)'
      } else {
        // There's not enough space, so put it to the left edge.
        style.transform = 'translateX(-' + offsetLeft + 'px)'
      }
    }
  }

  mouseout() {
    this.textbox.style.display = 'none'
    // Reset the top value so that the tooltip popup doesn't go lower each time
    // you hover over the box.
    this.textbox.style.top = 'auto'
    // Reset the transform so it isn't offset to the left if the user resizes the window.
    this.textbox.style.transform = 'none'
    // Reset the width so it doesn't stay too wide if the user resizes the window.
    this.textbox.style.width = '20rem'
  }
}
