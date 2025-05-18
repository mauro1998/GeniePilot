import { ipcMain, desktopCapturer, BrowserWindow } from 'electron';

/**
 * Register screen capturer related IPC handlers
 */
export const registerScreenCapturerHandlers = () => {

// Screen capture IPC handlers
ipcMain.handle('screen-capturer:get-sources', async (_, sourceType: 'screen' | 'window' | null = null) => {
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
        width: 640,
        height: 360,
      },
      fetchWindowIcons: true,
    });

    // Convert NativeImage to data URLs for sending over IPC
    return sources.map((source) => {
      // Explicitly type the source type as a union type
      const sourceType: 'screen' | 'window' = source.id.includes('screen') ? 'screen' : 'window';

      // Make sure to convert NativeImage to data URL
      const thumbnailDataUrl = source.thumbnail ? source.thumbnail.toDataURL() : '';
      const appIconDataUrl = source.appIcon ? source.appIcon.toDataURL() : undefined;

      console.log(`Source: ${source.name}, Has thumbnail: ${!!source.thumbnail}, DataURL length: ${thumbnailDataUrl.length}`);

      return {
        id: source.id,
        name: source.name,
        thumbnailDataUrl: thumbnailDataUrl,
        display_id: source.display_id,
        appIconDataUrl: appIconDataUrl,
        type: sourceType,
      };
    });
  } catch (error) {
    console.error('Error getting capture sources:', error);
    throw error;
  }
});

// This handler would be implemented later for screenshot functionality
ipcMain.handle('screen-capturer:capture-screenshot', async (_, sourceId: string) => {
  try {
    console.log(`Capturing screenshot for source ID: ${sourceId}`);

    // First, get the source to capture
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: {
        width: 1920, // Higher resolution for the actual capture
        height: 1080,
      },
      fetchWindowIcons: true,
    });

    // Find the requested source
    const sourceToCapture = sources.find(source => source.id === sourceId);
    if (!sourceToCapture) {
      console.log(`Source not found for ID: ${sourceId}`);
      return {
        success: false,
        message: 'Source not found'
      };
    }

    console.log(`Source found: ${sourceToCapture.name}, capturing screenshot...`);

    // Return the high-resolution thumbnail as a data URL
    const dataUrl = sourceToCapture.thumbnail.toDataURL();
    console.log(`Screenshot captured, data URL length: ${dataUrl.length}`);

    return {
      success: true,
      data: dataUrl,
      name: sourceToCapture.name
    };
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
});
};
