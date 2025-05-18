import { BaseIntegrationConfig, ImportResult, IntegrationProvider } from './IntegrationProvider';
import integrationRegistry from './IntegrationRegistry';

/**
 * Azure DevOps integration configuration
 */
export interface AzureDevOpsConfig extends BaseIntegrationConfig {
  orgName: string;
  projectName: string;
  personalAccessToken: string;
  apiVersion?: string;
}

/**
 * Azure DevOps import options
 */
export interface AzureDevOpsImportOptions {
  planId?: number;
  planName?: string;
  suiteId?: number;
  suiteName?: string;
}

/**
 * Integration provider for Azure DevOps
 */
class AzureDevOpsIntegrationProvider implements IntegrationProvider<AzureDevOpsConfig, AzureDevOpsImportOptions> {
  id = 'azure-devops';
  displayName = 'Azure DevOps';
  description = 'Import Gherkin files as test cases in Azure DevOps';
  iconUrl = '/assets/icons/azure-devops-logo.svg'; // Path to your icon

  async importGherkin(
    config: AzureDevOpsConfig,
    directoryPath: string,
    options: AzureDevOpsImportOptions
  ): Promise<ImportResult> {

      // Use the IPC channel to perform the import in the main process
    return await window.electron.gherkin.importToAzure(config, directoryPath, options);
  }
}

// Create and register the provider
const azureDevOpsProvider = new AzureDevOpsIntegrationProvider();
integrationRegistry.register(azureDevOpsProvider);

export default azureDevOpsProvider;
