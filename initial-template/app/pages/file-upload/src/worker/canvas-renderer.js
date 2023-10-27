/**
 * @type {HTMLCanvasElement} canvas
 */
let _canvas = {}
let _context = {}

export class CanvasRenderer {
  /**
   * @param {VideoFrame} frame 
   */
  static draw(frame) {
    const { displayWidth, displayHeight } = frame
    _canvas.width = displayWidth
    _canvas.height = displayHeight
    _context.drawImage(frame, 0, 0, displayWidth, displayHeight)
    frame.close()
  }
  static getRenderer(canvas) {
    _canvas = canvas
    _context = canvas.getContext('2d')
    const renderer = this
    let pendingFrame = null
    return (frame) => {
      const renderAnimationFrame = () => {
        renderer.draw(pendingFrame)
        pendingFrame = null
      }
      if (!pendingFrame) {
        requestAnimationFrame(renderAnimationFrame)
      } else {
        pendingFrame.close()
      }
      pendingFrame = frame
    }
  }
}