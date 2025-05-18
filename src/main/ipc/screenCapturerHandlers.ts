import { ipcMain, desktopCapturer, BrowserWindow } from 'electron';

/**
 * Register screen capturer related IPC handlers
 */
export const registerScreenCapturerHandlers = () => {
  // Handler for getting available screen/window sources
  ipcMain.handle('screen-capturer:get-sources', async (_, sourceType: 'screen' | 'window' | null) => {
    try {
      // Set types to capture based on the requested source type
      const types: ('screen' | 'window')[] = sourceType
        ? [sourceType]
        : ['screen', 'window'];

      // Get all available sources
      const sources = await desktopCapturer.getSources({
        types,
        thumbnailSize: { width: 300, height: 300 },
        fetchWindowIcons: true
      });

      // Map sources to a simpler format for the renderer
      return sources.map(source => ({
        id: source.id,
        name: source.name,
        thumbnailDataUrl: source.thumbnail.toDataURL(),
        display_id: source.display_id,
        appIconDataUrl: source.appIcon?.toDataURL(),
        type: types.length === 1 ? types[0] : (source.display_id ? 'screen' : 'window')
      }));
    } catch (error) {
      console.error('Error getting screen capture sources:', error);
      throw error;
    }
  });

  // Handler for capturing a screenshot of a specific source
  ipcMain.handle('screen-capturer:capture-screenshot', async (_, sourceId: string) => {
    try {
      // Get the source with the requested ID
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 1920, height: 1080 }, // Higher resolution for actual capture
        fetchWindowIcons: false
      });

      // Find the requested source
      const source = sources.find(s => s.id === sourceId);

      if (!source) {
        throw new Error(`Source with ID ${sourceId} not found`);
      }

      // Return the high-resolution thumbnail as a data URL
      return {
        dataUrl: source.thumbnail.toDataURL(),
        name: source.name,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      throw error;
    }
  });
};
