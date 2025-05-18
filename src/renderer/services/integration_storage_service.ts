import { v4 as uuidv4 } from 'uuid';

/**
 * Service specifically for managing integration configurations
 */
class IntegrationStorageService {
  // Integration configuration keys
  private readonly INTEGRATION_CONFIG_KEY = 'gherkin_integrations_config';
  private readonly AZURE_DEVOPS_PROJECTS_KEY = 'azureDevOpsProjects';

  // Integration configuration methods
  getIntegrationConfigs(): Record<string, any> {
    const configsJson = localStorage.getItem(this.INTEGRATION_CONFIG_KEY);
    return configsJson ? JSON.parse(configsJson) : {};
  }

  saveIntegrationConfig(providerId: string, config: any): void {
    try {
      const configs = this.getIntegrationConfigs();
      configs[providerId] = config;
      localStorage.setItem(this.INTEGRATION_CONFIG_KEY, JSON.stringify(configs));
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
        localStorage.setItem(this.INTEGRATION_CONFIG_KEY, JSON.stringify(configs));
      }
    } catch (error) {
      console.error(`Error deleting integration config for provider ${providerId}:`, error);
      throw error;
    }
  }

  // Azure DevOps Projects methods
  getAzureDevOpsProjects(): any[] {
    const projectsJson = localStorage.getItem(this.AZURE_DEVOPS_PROJECTS_KEY);
    return projectsJson ? JSON.parse(projectsJson) : [];
  }

  saveAzureDevOpsProjects(projects: any[]): void {
    try {
      localStorage.setItem(this.AZURE_DEVOPS_PROJECTS_KEY, JSON.stringify(projects));
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

export default new IntegrationStorageService();
