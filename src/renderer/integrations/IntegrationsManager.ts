import { v4 as uuidv4 } from 'uuid';
import storageService from '../services/storage_service';

/**
 * Manager for handling integration configurations and projects
 */
class IntegrationsManager {
  // Storage keys for localStorage
  private readonly INTEGRATION_CONFIG_KEY = 'gherkin_integrations_config';
  private readonly AZURE_DEVOPS_PROJECTS_KEY = 'azureDevOpsProjects';

  /**
   * Generic method to save data using storage service's localStorage pattern
   * @param key Storage key
   * @param data Data to store
   */
  private saveData<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  /**
   * Generic method to retrieve data using storage service's localStorage pattern
   * @param key Storage key
   * @returns Retrieved data or default value if not found
   */
  private getData<T>(key: string, defaultValue: T): T {
    const dataJson = localStorage.getItem(key);
    return dataJson ? JSON.parse(dataJson) : defaultValue;
  }

  // Integration configuration methods
  getIntegrationConfigs(): Record<string, any> {
    return this.getData<Record<string, any>>(this.INTEGRATION_CONFIG_KEY, {});
  }

  saveIntegrationConfig(providerId: string, config: any): void {
    try {
      const configs = this.getIntegrationConfigs();
      configs[providerId] = config;
      this.saveData(this.INTEGRATION_CONFIG_KEY, configs);
    } catch (error) {
      console.error(`Error saving integration config for provider ${providerId}:`, error);
      throw error;
    }
  }

  getIntegrationConfig(providerId: string): any {
    const configs = this.getIntegrationConfigs();
    return configs[providerId];
  }

  deleteIntegrationConfig(providerId: string): void {
    try {
      const configs = this.getIntegrationConfigs();
      if (configs[providerId]) {
        delete configs[providerId];
        this.saveData(this.INTEGRATION_CONFIG_KEY, configs);
      }
    } catch (error) {
      console.error(`Error deleting integration config for provider ${providerId}:`, error);
      throw error;
    }
  }

  // Azure DevOps Projects methods
  getAzureDevOpsProjects(): any[] {
    return this.getData<any[]>(this.AZURE_DEVOPS_PROJECTS_KEY, []);
  }

  saveAzureDevOpsProjects(projects: any[]): void {
    try {
      this.saveData(this.AZURE_DEVOPS_PROJECTS_KEY, projects);
    } catch (error) {
      console.error('Error saving Azure DevOps projects:', error);
      throw error;
    }
  }

  addAzureDevOpsProject(project: any): any {
    try {
      const projects = this.getAzureDevOpsProjects();
      const newProject = {
        ...project,
        id: project.id ?? uuidv4()
      };
      projects.push(newProject);
      this.saveAzureDevOpsProjects(projects);
      return newProject;
    } catch (error) {
      console.error('Error adding Azure DevOps project:', error);
      throw error;
    }
  }

  updateAzureDevOpsProject(project: any): void {
    try {
      const projects = this.getAzureDevOpsProjects();
      const index = projects.findIndex((p: any) => p.id === project.id);
      if (index !== -1) {
        projects[index] = project;
        this.saveAzureDevOpsProjects(projects);
      }
    } catch (error) {
      console.error(`Error updating Azure DevOps project with ID ${project.id}:`, error);
      throw error;
    }
  }

  deleteAzureDevOpsProject(id: string): void {
    try {
      const projects = this.getAzureDevOpsProjects();
      const filteredProjects = projects.filter((p: any) => p.id !== id);
      this.saveAzureDevOpsProjects(filteredProjects);
    } catch (error) {
      console.error(`Error deleting Azure DevOps project with ID ${id}:`, error);
      throw error;
    }
  }
}

export default new IntegrationsManager();
