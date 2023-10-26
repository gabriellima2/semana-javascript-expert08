import { resolutions } from '../../helpers/resolutions.js';

export const encoderConfig = {
  ...resolutions.qvga,
  bitrate: 10e6, // Read 1MB per sec
  // WebM
  codec: 'vp09.00.10.08',
  pt: 4,
  hardwareAcceleration: 'prefer-software',

  // MP4
  /*codec: 'avc1.42002A',
  pt: 1,
  hardwareAcceleration: 'prefer-hardware',
  avc: { format: 'annexb' }*/
}
