import { v4 as uuidv4 } from 'uuid';
import notificationService from './notification_service';

export interface ServerConfig {
  fileServerUrl: string;
  agentServerUrl: string;
}

const DEFAULT_CONFIG: ServerConfig = {
  fileServerUrl: 'https://file-server.localhost:3000',
  agentServerUrl: 'https://agents.localhost:3000',
};

/**
 * Service for managing application configuration
 */
class ConfigurationService {
  private readonly CONFIG_KEY = 'app_configuration';

  /**
   * Get the application configuration from localStorage
   * If not found, returns the default configuration
   */
  getConfig(): ServerConfig {
    try {
      const configJson = localStorage.getItem(this.CONFIG_KEY);
      if (configJson) {
        return JSON.parse(configJson);
      }
      return DEFAULT_CONFIG;
    } catch (error) {
      console.error('Error loading configuration:', error);
      notificationService.handleError(
        error,
        'Error loading configuration. Default values will be used.',
      );
      return DEFAULT_CONFIG;
    }
  }

  /**
   * Save configuration to localStorage
   * @param config The configuration to save
   */
  saveConfig(config: ServerConfig): void {
    try {
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
      notificationService.notify('success', 'Configuration saved successfully');
    } catch (error) {
      console.error('Error saving configuration:', error);
      notificationService.handleError(
        error,
        'Error saving configuration. Please try again.',
      );
      throw error;
    }
  }

  /**
   * Reset configuration to default values
   */
  resetConfig(): void {
    try {
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
      notificationService.notify('success', 'Configuration reset to defaults');
    } catch (error) {
      console.error('Error resetting configuration:', error);
      notificationService.handleError(
        error,
        'Error resetting configuration. Please try again.',
      );
      throw error;
    }
  }

  /**
   * Update specific configuration fields
   * @param partialConfig Partial configuration object with fields to update
   */
  updateConfig(partialConfig: Partial<ServerConfig>): void {
    try {
      const currentConfig = this.getConfig();
      const updatedConfig = { ...currentConfig, ...partialConfig };
      this.saveConfig(updatedConfig);
    } catch (error) {
      console.error('Error updating configuration:', error);
      notificationService.handleError(
        error,
        'Error updating configuration. Please try again.',
      );
      throw error;
    }
  }
}

const configurationService = new ConfigurationService();
export default configurationService;
