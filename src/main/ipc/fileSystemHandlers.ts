import { ipcMain, dialog, BrowserWindow } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Register file system related IPC handlers
 */
export const registerFileSystemHandlers = () => {
  // Handler for directory selection
  ipcMain.handle('file-system:select-directory', async () => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    if (!mainWindow) {
      throw new Error('No active window found');
    }

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Directory with Gherkin Files'
    });

    return result;
  });

  // Handler for reading directory contents
  ipcMain.handle('file-system:read-directory', async (_, dirPath) => {
    try {
      const files = fs.readdirSync(dirPath);
      const fileDetails = files.map(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          extension: path.extname(file)
        };
      });

      return fileDetails;
    } catch (error) {
      console.error('Error reading directory:', error);
      throw error;
    }
  });
};
