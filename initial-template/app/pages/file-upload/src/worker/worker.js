import WebMWriter from '../deps/webm-writer2.js'

import { VideoProcessor } from './video-processor.js'
import { CanvasRenderer } from './canvas-renderer.js'
import { MP4Demuxer } from './mp4-demuxer.js'
import { Service } from './service.js'

import { encoderConfig } from './config/encoder-config.js'
import { webMWriterConfig } from './config/webm-writer-config.js'

const mp4Demuxer = new MP4Demuxer()
const webMWriter = new WebMWriter(webMWriterConfig)
const service = new Service('http://localhost:3000')
const videoProcessor = new VideoProcessor({ mp4Demuxer, webMWriter, service })

onmessage = async ({ data }) => {
  const renderFrame = CanvasRenderer.getRenderer(data.canvas)
  await videoProcessor.start({
    file: data.file,
    encoderConfig,
    renderFrame,
    sendMessage: (message) => self.postMessage(message) // self === window
  })
}
