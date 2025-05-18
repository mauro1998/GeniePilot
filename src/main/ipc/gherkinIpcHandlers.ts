import { ipcMain } from 'electron';
import GherkinService, { ImportResult } from '../services/GherkinService';

/**
 * Register all Gherkin-related IPC handlers
 */
export function registerGherkinIpcHandlers() {
  // Scan directory for Gherkin files
  ipcMain.handle('gherkin:scan-directory', async (_event, directoryPath: string) => {
    try {
      return await GherkinService.scanDirectory(directoryPath);
    } catch (error: any) {
      console.error('Error in gherkin:scan-directory IPC handler:', error);
      throw new Error(error.message || 'Failed to scan directory');
    }
  });

  // Parse a single Gherkin file
  ipcMain.handle('gherkin:parse-file', async (_event, filePath: string) => {
    try {
      return await GherkinService.parseFile(filePath);
    } catch (error: any) {
      console.error('Error in gherkin:parse-file IPC handler:', error);
      throw new Error(error.message || 'Failed to parse file');
    }
  });

  // Import Gherkin files to Azure DevOps
  ipcMain.handle(
    'gherkin:import-to-azure',
    async (_event, config: any, directoryPath: string, options: any) => {
      try {
        return await GherkinService.importToAzureDevOps(config, directoryPath, options);
      } catch (error: any) {
        console.error('Error in gherkin:import-to-azure IPC handler:', error);
        return {
          success: false,
          message: error.message || 'Failed to import to Azure DevOps',
          details: error,
          stack: error.stack,
         } as ImportResult;
      }
    }
  );

  console.log('Gherkin IPC handlers registered');
}
