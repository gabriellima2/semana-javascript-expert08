import { VideoProcessor } from './video-processor.js'
import { encoderConfig } from './config/encoder-config.js'
import { MP4Demuxer } from './mp4-demuxer.js'

const mp4Demuxer = new MP4Demuxer()
const videoProcessor = new VideoProcessor({ mp4Demuxer })

onmessage = async ({ data }) => {
  await videoProcessor.start({
    file: data.file,
    encoderConfig,
    sendMessage: () => {
      self.postMessage({ status: 'done' }) // self === window
    }
  })
}
