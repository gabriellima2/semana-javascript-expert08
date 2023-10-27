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
  async mp4Decoder(encoderConfig, stream) {
    const decoder = new VideoDecoder({
      output: (frame) => {},
      error: (error) => console.error('MP4Decoder', error),
    })
    await this.#mp4Demuxer.run(stream, {
      onConfig: (config) => decoder.configure(config),
      /**
       * @param {EncodedVideoChunk} chunk 
       */
      onChunk: (chunk) => {
        decoder.decode(chunk) // When processed call the ouput function
      } // Called when onSamples is executed
    })
  }
  async start({ file, encoderConfig, sendMessage }) {
    const stream = file.stream()
    const fileName = file.name.split('/').pop().replace('.mp4', '')
    await this.mp4Decoder(encoderConfig, stream)
  }
}