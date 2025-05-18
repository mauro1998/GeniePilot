import { IntegrationProvider } from './IntegrationProvider';

/**
 * Registry for all available integration providers
 */
class IntegrationRegistry {
  private providers: Map<string, IntegrationProvider<any, any>> = new Map();

  /**
   * Register a new integration provider
   */
  register(provider: IntegrationProvider<any, any>): void {
    if (this.providers.has(provider.id)) {
      console.warn(`Integration provider with ID ${provider.id} already exists. It will be overwritten.`);
    }
    this.providers.set(provider.id, provider);
  }

  /**
   * Get an integration provider by ID
   */
  getProvider(id: string): IntegrationProvider<any, any> | undefined {
    return this.providers.get(id);
  }

  /**
   * Get all registered integration providers
   */
  getAllProviders(): IntegrationProvider<any, any>[] {
    return Array.from(this.providers.values());
  }
}

// Export a singleton instance
const integrationRegistry = new IntegrationRegistry();
export default integrationRegistry;
