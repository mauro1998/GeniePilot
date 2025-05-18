/**
 * Base configuration for all integration providers
 */
export interface BaseIntegrationConfig {
  name: string;
  description: string;
  icon?: string; // Optional path or URL to the icon
}

/**
 * Result of an import operation
 */
export interface ImportResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Generic interface for all integration providers
 */
export interface IntegrationProvider<TConfig extends BaseIntegrationConfig, TOptions = any> {
  /**
   * Unique identifier for this integration
   */
  id: string;

  /**
   * Display name for this integration
   */
  displayName: string;

  /**
   * Description of what this integration does
   */
  description: string;

  /**
   * Optional icon for the integration
   */
  iconUrl?: string;

  /**
   * Import Gherkin files using this integration
   */
  importGherkin: (
    config: TConfig,
    directoryPath: string,
    options: TOptions
  ) => Promise<ImportResult>;
}
