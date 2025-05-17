import { desktopCapturer, DesktopCapturerSource } from 'electron';

/**
 * Interface representing a captured media source
 */
interface CaptureSource {
  id: string;
  name: string;
  thumbnail: Electron.NativeImage;
  display_id?: string;
  appIcon?: Electron.NativeImage;
  type: 'screen' | 'window';
}

/**
 * ScreenCapturer class for capturing screens and application windows
 */
export class ScreenCapturer {
  /**
   * Get available screen and window sources with optional type filtering
   * @param sourceType Optional filter for source type ('screen', 'window', or null for both)
   * @returns Promise resolving to an array of capture sources
   */
  async getSources(sourceType: 'screen' | 'window' | null = null): Promise<CaptureSource[]> {
    try {
      // Determine which types to request based on the sourceType parameter
      const types: Array<'window' | 'screen'> = [];

      if (sourceType === null || sourceType === 'window') {
        types.push('window');
      }

      if (sourceType === null || sourceType === 'screen') {
        types.push('screen');
      }

      const sources = await desktopCapturer.getSources({
        types,
        thumbnailSize: {
          width: 320,
          height: 180,
        },
        fetchWindowIcons: true,
      });

      const mappedSources = sources.map((source: DesktopCapturerSource) => {
        // Explicitly type the source type as a union type
        const sourceType: 'screen' | 'window' = source.id.includes('screen') ? 'screen' : 'window';

        return {
          id: source.id,
          name: source.name,
          thumbnail: source.thumbnail,
          display_id: source.display_id,
          appIcon: source.appIcon,
          type: sourceType,
        };
      });

      // If sourceType is specified, apply additional filtering to ensure accuracy
      if (sourceType) {
        return mappedSources.filter(source => source.type === sourceType);
      }

      return mappedSources;
    } catch (error) {
      console.error('Error getting capture sources:', error);
      throw error;
    }
  }

  /**
   * Capture a specific screen or window by ID
   * @param sourceId The ID of the screen or window to capture
   * @returns Promise resolving to a MediaStream
   */
  async captureSource(sourceId: string): Promise<MediaStream> {
    try {
      const constraints = {
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId,
          }
        },
      };

      // Cast constraints to any to handle Electron's specific constraints structure
      const stream = await navigator.mediaDevices.getUserMedia(constraints as any);
      return stream;
    } catch (error) {
      console.error('Error capturing source:', error);
      throw error;
    }
  }

  /**
   * Capture a screenshot from a specific source
   * @param sourceId The ID of the screen or window to capture
   * @returns Promise resolving to a base64 encoded image
   */
  /**
   * Process video frame to create a screenshot
   * @private
   */
  private async processVideoFrame(
    video: HTMLVideoElement,
    stream: MediaStream
  ): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Stop all tracks
    stream.getTracks().forEach(track => track.stop());

    // Return the base64 image data
    return canvas.toDataURL('image/png');
  }

  /**
   * Capture a screenshot from a specific source
   * @param sourceId The ID of the screen or window to capture
   * @returns Promise resolving to a base64 encoded image
   */
  async captureScreenshot(sourceId: string): Promise<string> {
    try {
      const stream = await this.captureSource(sourceId);

      // Create a video element to capture the frame
      const video = document.createElement('video');
      video.srcObject = stream;

      return new Promise<string>((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.play();

          // Slight delay to ensure frame is ready
          setTimeout(async () => {
            try {
              const screenshot = await this.processVideoFrame(video, stream);
              resolve(screenshot);
            } catch (err) {
              reject(err instanceof Error ? err : new Error(String(err)));
            }
          }, 100);
        };

        video.onerror = () => {
          reject(new Error('Error loading video'));
        };
      });
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      throw error;
    }
  }

  /**
   * Find a source by name (partial match)
   * @param name The name to search for
   * @returns Promise resolving to the found source or undefined
   */
  async findSourceByName(name: string): Promise<CaptureSource | undefined> {
    const sources = await this.getSources();
    return sources.find(source =>
      source.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  /**
   * Get all screen sources (excluding windows)
   * @returns Promise resolving to screen sources
   */
  async getScreenSources(): Promise<CaptureSource[]> {
    return this.getSources('screen');
  }

  /**
   * Get all window sources (excluding screens)
   * @returns Promise resolving to window sources
   */
  async getWindowSources(): Promise<CaptureSource[]> {
    return this.getSources('window');
  }
}

export default ScreenCapturer;
