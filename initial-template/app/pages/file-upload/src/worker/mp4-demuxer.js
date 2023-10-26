import { createFile } from "../deps/mp4box.0.5.2.js"

export class MP4Demuxer {
  #onConfig;
  #onChunk;
  #file;
  /**
   * 
   * @param {ReadableStream} stream 
   * @param {object} options 
   * @param {(config: object) => void} options.onConfig
   * 
   * @returns {Promise<void>}
   */
  async run(stream, { onConfig, onChunk }) {
    this.#onConfig = onConfig
    this.#onChunk = onChunk

    this.#file = createFile()
    this.#file.onReady = (args) => { }
    this.#file.onError = (error) => console.error('MP4Demuxer', error)

    this.#init(stream)
  }
  #init(stream) {
    console.log(stream)
  }
}