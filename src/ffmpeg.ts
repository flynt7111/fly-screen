import ffmpegPath from 'ffmpeg-static';

/**
 * Returns the absolute path to the static ffmpeg binary.
 * Can be used to spawn ffmpeg processes for recording/transcoding.
 */
export function getFFmpegPath(): string {
  if (!ffmpegPath) {
    throw new Error('ffmpeg-static binary not found');
  }
  return ffmpegPath;
}
