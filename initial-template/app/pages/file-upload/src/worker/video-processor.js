export class VideoProcessor {
  #mp4Demuxer;
  /**
   * 
   * @param {object} options 
   * @param {import('./mp4-demuxer.js').MP4Demuxer} options.mp4Demuxer
   */
  constructor({ mp4Demuxer }) {
    this.#mp4Demuxer = mp4Demuxer
  }
  /**
   * @returns {ReadableStream}
   */
  mp4Decoder(stream) {
    return new ReadableStream({
      start: async (controller) => { // Controller send data
        const decoder = new VideoDecoder({
          /**
           * @param {VideoFrame} frame 
           */
          output: (frame) => controller.enqueue(frame),
          error: (error) => {
            console.error('MP4Decoder', error)
            controller.error(error)
          },
        })
        return this.#mp4Demuxer.run(stream, {
          onConfig: async (config) => {
            const { supported } = await VideoDecoder.isConfigSupported(config)
            if (!supported) {
              const message = 'MP4Decoder, Video Decoder config not supported'
              console.error(message, config)
              controller.error(message)
              return;
            }
            decoder.configure(config)
          },
          /**
           * @param {EncodedVideoChunk} chunk 
           */
          onChunk: (chunk) => {
            decoder.decode(chunk) // When processed call the ouput function
          } // Called when onSamples is executed
        }).then(() => {
          setTimeout(() => controller.close(), 1000)
        })
      },
    })
  }
  encode144p(encoderConfig) {
    let encoder;
    const readable = new ReadableStream({
      start: async (controller) => {
        const { supported } = await VideoEncoder.isConfigSupported(encoderConfig)
        if (!supported) {
          const message = 'Encode144p, config not supported'
          console.error(message, encoderConfig)
          controller.error(message)
          return;
        }
        encoder = new VideoEncoder({
          /**
           * @param {EncodedVideoChunk} frame 
           * @param {EncodedVideoChunkMetadata} config 
           */
          output: (frame, config) => {
            if (config.decoderConfig) {
              const decoderConfig = { type: 'config', config: config.decoderConfig }
              controller.enqueue(decoderConfig)
            }
            controller.enqueue(frame)
          },
          error: (error) => {
            console.error('Encode144p', error)
            controller.error(error)
          }
        })
        await encoder.configure(encoderConfig)
      },
    })
    const writable = new WritableStream({
      write: async (frame) => {
        encoder.encode(frame) // When data is ready, this is passed to readable
      }
    })
    return { readable, writable }
  }
  async start({ file, encoderConfig, renderFrame }) {
    const stream = file.stream()
    const fileName = file.name.split('/').pop().replace('.mp4', '')
    await this.mp4Decoder(stream)
      .pipeThrough(this.encode144p(encoderConfig))
      .pipeTo(new WritableStream({
        write: (frame) => { } //renderFrame(frame),
      }))
  }
}