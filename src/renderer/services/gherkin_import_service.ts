import {
  BaseIntegrationConfig,
  ImportResult,
} from '../integrations/IntegrationProvider';
import integrationRegistry from '../integrations/IntegrationRegistry';

// Import all available integrations
import '../integrations/AzureDevOpsIntegration';
// Add additional integration imports here

export interface GherkinSummary {
  fileName: string;
  path: string;
  scenarios: number;
  tags: string[];
}

/**
 * Service for managing Gherkin files and imports
 * Uses Electron IPC to communicate with the main process
 * where Node.js native APIs can be used
 */
class GherkinImportService {
  /**
   * Scan a directory for Gherkin files and return summaries
   * @param directoryPath Directory path to scan
   * @returns Array of Gherkin file summaries
   */
  async scanDirectory(directoryPath: string): Promise<GherkinSummary[]> {
    try {
      // Use IPC to invoke the main process handler
      return await window.electron.gherkin.scanDirectory(directoryPath);
    } catch (error) {
      console.error('Error scanning directory for Gherkin files:', error);
      throw error;
    }
  }

  /**
   * Get all available integration providers
   * @returns Array of integration providers
   */
  getAvailableIntegrations() {
    return integrationRegistry.getAllProviders();
  }

  /**
   * Import Gherkin files using the specified integration provider
   * @param providerId ID of the integration provider to use
   * @param config Provider-specific configuration
   * @param directoryPath Directory containing Gherkin files
   * @param options Provider-specific import options
   * @returns Import results
   */
  async importWithProvider(
    providerId: string,
    config: BaseIntegrationConfig,
    directoryPath: string,
    options: any,
  ): Promise<ImportResult> {
    try {
      const provider = integrationRegistry.getProvider(providerId);

      if (!provider) {
        throw new Error(
          `Integration provider with ID '${providerId}' not found`,
        );
      }

      return await provider.importGherkin(config, directoryPath, options);
    } catch (error) {
      console.error(
        `Error importing Gherkin files with provider '${providerId}':`,
        error,
      );
      throw error;
    }
  }
}

export default new GherkinImportService();
