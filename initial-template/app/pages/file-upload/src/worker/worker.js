import { VideoProcessor } from './video-processor.js'
import { CanvasRenderer } from './canvas-renderer.js'
import { MP4Demuxer } from './mp4-demuxer.js'

import { encoderConfig } from './config/encoder-config.js'


const mp4Demuxer = new MP4Demuxer()
const videoProcessor = new VideoProcessor({ mp4Demuxer })

onmessage = async ({ data }) => {
  const renderFrame = CanvasRenderer.getRenderer(data.canvas)
  await videoProcessor.start({
    file: data.file,
    encoderConfig,
    renderFrame,
  })
  self.postMessage({ status: 'done' }) // self === window
}
