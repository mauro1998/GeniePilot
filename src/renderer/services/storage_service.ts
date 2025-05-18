import { v4 as uuidv4 } from 'uuid';
import { Project, Flow, Step } from './models';
import notificationService from './notification_service';

class StorageService {
  private readonly PROJECT_KEY = 'genie_pilot_projects';

  private readonly FLOW_KEY = 'genie_pilot_flows';

  private readonly STEP_KEY = 'genie_pilot_steps';

  // Project methods
  getProjects(): Project[] {
    const projectsJson = localStorage.getItem(this.PROJECT_KEY);
    return projectsJson ? JSON.parse(projectsJson) : [];
  }

  getProject(id: string): Project | undefined {
    return this.getProjects().find((project) => project.id === id);
  }

  saveProject(project: Omit<Project, 'id' | 'createdAt'>): Project {
    const projects = this.getProjects();
    const newProject = {
      ...project,
      id: uuidv4(),
      createdAt: Date.now(),
    };

    localStorage.setItem(
      this.PROJECT_KEY,
      JSON.stringify([...projects, newProject]),
    );
    return newProject;
  }

  updateProject(project: Project): void {
    const projects = this.getProjects();
    const index = projects.findIndex((p) => p.id === project.id);

    if (index !== -1) {
      projects[index] = project;
      localStorage.setItem(this.PROJECT_KEY, JSON.stringify(projects));
    }
  }

  /**
   * Delete a project and all associated flows and steps (cascade delete)
   */
  deleteProject(id: string): void {
    try {
      // Get flows to delete for step cascade
      const projectFlows = this.getFlowsByProject(id);

      // Delete flows and their steps
      projectFlows.forEach((flow) => {
        this.deleteStepsByFlow(flow.id);
      });
      this.deleteFlowsByProject(id);

      // Finally delete the project
      const projects = this.getProjects().filter(
        (project) => project.id !== id,
      );
      localStorage.setItem(this.PROJECT_KEY, JSON.stringify(projects));
    } catch (error) {
      notificationService.handleError(
        error,
        'Error deleting project. Some data may not have been completely removed.',
      );
      throw error;
    }
  }

  // Flow methods
  getFlows(): Flow[] {
    const flowsJson = localStorage.getItem(this.FLOW_KEY);
    return flowsJson ? JSON.parse(flowsJson) : [];
  }

  getFlowsByProject(projectId: string): Flow[] {
    return this.getFlows().filter((flow) => flow.projectId === projectId);
  }

  saveFlow(flow: Omit<Flow, 'id' | 'createdAt'>): Flow {
    const flows = this.getFlows();
    const newFlow = {
      ...flow,
      id: uuidv4(),
      createdAt: Date.now(),
    };

    localStorage.setItem(this.FLOW_KEY, JSON.stringify([...flows, newFlow]));
    return newFlow;
  }

  updateFlow(flow: Flow): void {
    const flows = this.getFlows();
    const index = flows.findIndex((f) => f.id === flow.id);

    if (index !== -1) {
      flows[index] = flow;
      localStorage.setItem(this.FLOW_KEY, JSON.stringify(flows));
    }
  }

  /**
   * Delete a flow and all its steps (cascade delete)
   */
  deleteFlow(id: string): void {
    try {
      // Delete all steps in the flow first
      this.deleteStepsByFlow(id);

      // Then delete the flow
      const flows = this.getFlows().filter((flow) => flow.id !== id);
      localStorage.setItem(this.FLOW_KEY, JSON.stringify(flows));
    } catch (error) {
      notificationService.handleError(
        error,
        'Error deleting flow. Some data may not have been completely removed.',
      );
      throw error;
    }
  }

  deleteFlowsByProject(projectId: string): void {
    const flows = this.getFlows().filter(
      (flow) => flow.projectId !== projectId,
    );
    localStorage.setItem(this.FLOW_KEY, JSON.stringify(flows));
  }

  // Step methods
  getSteps(): Step[] {
    const stepsJson = localStorage.getItem(this.STEP_KEY);
    return stepsJson ? JSON.parse(stepsJson) : [];
  }

  getStepsByFlow(flowId: string): Step[] {
    return this.getSteps().filter((step) => step.flowId === flowId);
  }

  saveStep(step: Omit<Step, 'id'>): Step {
    const steps = this.getSteps();
    const newStep = {
      ...step,
      id: uuidv4(),
    };

    localStorage.setItem(this.STEP_KEY, JSON.stringify([...steps, newStep]));
    return newStep;
  }

  updateStep(step: Step): void {
    const steps = this.getSteps();
    const index = steps.findIndex((s) => s.id === step.id);

    if (index !== -1) {
      steps[index] = step;
      localStorage.setItem(this.STEP_KEY, JSON.stringify(steps));
    }
  }

  deleteStep(id: string): void {
    const steps = this.getSteps().filter((step) => step.id !== id);
    localStorage.setItem(this.STEP_KEY, JSON.stringify(steps));
  }

  deleteStepsByFlow(flowId: string): void {
    const steps = this.getSteps().filter((step) => step.flowId !== flowId);
    localStorage.setItem(this.STEP_KEY, JSON.stringify(steps));
  }

  // Recent projects (last 5)
  getRecentProjects(limit = 5): Project[] {
    return this.getProjects()
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  /**
   * Creates a default project with a default flow and step
   * @returns The created project
   */
  createDefaultFlow(blobUrl: string): Flow {
    // Create project
    const project = this.saveProject({
      name: 'New Project',
      description: '',
    });

    // Create flow
    const flow = this.saveFlow({
      projectId: project.id,
      name: 'Main Flow',
      steps: [],
    });

    // Create step
    this.saveStep({
      flowId: flow.id,
      name: 'Initial Step',
      context: '',
      imageUrl: blobUrl,
    });

    return flow;
  }
}

export default new StorageService();
