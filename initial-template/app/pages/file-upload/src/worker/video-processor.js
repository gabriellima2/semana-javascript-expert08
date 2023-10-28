export class VideoProcessor {
  #mp4Demuxer;
  #webMWriter;
  #service;
  /**
   * 
   * @param {object} options 
   * @param {import('./mp4-demuxer.js').MP4Demuxer} options.mp4Demuxer
   * @param {import('../deps/webm-writer2.js').default} options.webMWriter
   * @param {import('./service.js').Service} options.service
   */
  constructor({ mp4Demuxer, webMWriter, service }) {
    this.#mp4Demuxer = mp4Demuxer
    this.#webMWriter = webMWriter
    this.#service = service
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
        encoder.configure(encoderConfig)
      },
    })
    const writable = new WritableStream({
      write: async (frame) => {
        encoder.encode(frame) // When data is ready, this is passed to readable
        frame.close()
      }
    })
    return { readable, writable }
  }
  renderDecodedFramesAndGetEncodedChunks(renderFrame) {
    let decoder;
    return new TransformStream({
      start: async (controller) => {
        decoder = new VideoDecoder({
          output: (frame) => renderFrame(frame),
          error: (error) => {
            console.error('RenderFrames', error)
            controller.error(error)
          },
        })
      },
      /**
       * @param {EncodedVideoChunk} encodedChunk 
       * @param {TransformStreamDefaultController} controller 
       */
      transform: async (encodedChunk, controller) => {
        if (encodedChunk.type === 'config') {
          await decoder.configure(encodedChunk.config)
          return;
        }
        decoder.decode(encodedChunk)
        controller.enqueue(encodedChunk) // Need the encoded version to use WebM
      },
    })
  }
  transformIntoWebM() {
    return {
      readable: this.#webMWriter.getStream(),
      writable: new WritableStream({
        write: (frame) => this.#webMWriter.addFrame(frame),
        close: () => {},
      })
    }
  }
  upload(fileName, resolution, type) {
    const TEN_MB = 10e6
    const chunks = []
    let byteCount = 0
    let segmentCount = 0
    const triggerUpload = async (chunks) => {
      const blob = new Blob(chunks, { type: `video/${type}` })
      await this.#service.uploadFile({
        fileName: `${fileName}-${resolution}.${++segmentCount}.${type}`,
        fileBuffer: blob,
      })
      chunks.length = 0 // Clear array
      byteCount = 0
    }
    return new WritableStream({
      /**
       * @param {object} options
       * @param {Uint8Array} options.data
       */
      write: async ({ data }) => {
        chunks.push(data)
        byteCount += data.byteLength
        if (byteCount <= TEN_MB) return;
        await triggerUpload(chunks)
      },
      close: async () => { // Proccess last chunks before close
        if (!chunks.length) return;
        await triggerUpload(chunks)
      }
    })
  }
  async start({ file, encoderConfig, renderFrame, sendMessage }) {
    const stream = file.stream()
    const fileName = file.name.split('/').pop().replace('.mp4', '')
    await this.mp4Decoder(stream)
      .pipeThrough(this.encode144p(encoderConfig))
      .pipeThrough(this.renderDecodedFramesAndGetEncodedChunks(renderFrame))
      .pipeThrough(this.transformIntoWebM())
      .pipeTo(this.upload(fileName, '144p', 'webm'))
    sendMessage({ status: 'done' })
  }
}