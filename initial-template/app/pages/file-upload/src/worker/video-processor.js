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
    await this.#mp4Demuxer.run(stream, {
      onConfig: (config) => {},
      onChunk: (chunk) => {}
    })
  }
  async start({ file, encoderConfig, sendMessage }) {
    const stream = file.stream()
    const fileName = file.name.split('/').pop().replace('.mp4', '')
    await this.mp4Decoder(encoderConfig, stream)
  }
}