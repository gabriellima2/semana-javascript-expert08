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
            if (!supported) throw new Error(`Video Decoder config not supported ${config}`)
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
  encode144p(encodeConfig) {}
  async start({ file, encoderConfig, renderFrame }) {
    const stream = file.stream()
    const fileName = file.name.split('/').pop().replace('.mp4', '')
    await this.mp4Decoder(stream)
      .pipeTo(new WritableStream({
        write: (frame) => renderFrame(frame),
      }))
  }
}