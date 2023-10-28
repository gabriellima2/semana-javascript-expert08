import { encoderConfig } from "./encoder-config.js";

export const webMWriterConfig = {
  codec: 'VP9',
  width: encoderConfig.width,
  height: encoderConfig.height,
  bitrate: encoderConfig.bitrate,
}