import { EventEmitter } from 'events';
import notificationService from './notification_service';
import { HttpFileService } from './HttpFileService';
import StorageService from './storage_service';
import configurationService from './configuration_service';
import { Flow } from './models';

export type TestSuiteState = 'idle' | 'generating' | 'completed' | 'error';

export interface TestSuiteData {
  generatedContent?: string;
  error?: string;
}

interface TestStep {
  order: number;
  context?: string;
  image: string;
}

interface TestScenario {
  id: string;
  name: string;
  parentId?: string;
  description?: string;
  steps: TestStep[];
}

interface TestSuitePayload {
  project: string;
  description: string;
  scenarios: TestScenario[];
}

class TestSuiteService extends EventEmitter {
  private stateByFlowId: Record<string, TestSuiteState> = {};
  private dataByFlowId: Record<string, TestSuiteData> = {};

  /**
   * Get the current state of test suite generation for a flow
   */
  getState(flowId: string): TestSuiteState {
    return this.stateByFlowId[flowId] || 'idle';
  }

  /**
   * Get the test suite data for a flow
   */
  getData(flowId: string): TestSuiteData {
    return this.dataByFlowId[flowId] || {};
  }

  /**
   * Start the test suite generation process
   * Currently mocks the API call with a timeout
   */
  async generateTestSuite(flow: Flow): Promise<void> {
    const { id: flowId, projectId } = flow;
    if (this.stateByFlowId[flowId] === 'generating') {
      notificationService.notify(
        'info',
        'Test suite generation already in progress',
      );
      return;
    }

    // Update state to generating
    this.stateByFlowId[flowId] = 'generating';
    this.dataByFlowId[flowId] = {};

    // Emit state change event
    this.emit('stateChange', flowId, this.stateByFlowId[flowId]);

    // Notify user
    notificationService.notify('info', 'Test suite generation started', {
      description:
        'This process may take a while to complete. You can continue working in the meantime.',
    });

    try {
      // Get configuration from the configuration service
      const config = configurationService.getConfig();
      const fileService = new HttpFileService(config.fileServerUrl);

      const project = StorageService.getProject(projectId);

      const steps = StorageService.getStepsByFlow(flowId);

      const scenario: TestScenario = {
        id: flowId || '',
        name: flow?.name || '',
        steps: [],
      };

      const payload: TestSuitePayload = {
        project: project?.name || '',
        description: project?.description || '',
        scenarios: [scenario],
      };

      try {
        let stepIndex = 1;
        for (const step of steps) {
          if (!step.imageUrl) {
            throw new Error('Step image URL is missing');
          }
          const blob = await fetch(new URL(step.imageUrl)).then((r) =>
            r.blob(),
          );
          const fileUrl = await fileService.uploadFile(blob, step.id);
          console.log(`Uploaded file for step ${step.id}, URL: ${fileUrl}`);

          scenario.steps.push({
            order: stepIndex,
            context: step.context,
            image: fileUrl,
          });

          stepIndex++;
        }
      } catch (error) {
        console.error('Error during test suite generation:', error);
        notificationService.notify('error', 'Test suite generation failed', {
          description: error instanceof Error ? error.message : String(error),
        });

        this.stateByFlowId[flowId] = 'error';

        // Emit state change event
        this.emit('stateChange', flowId, this.stateByFlowId[flowId]);
        return;
      }

      // Get agent URL from configuration service
      const { agentServerUrl } = configurationService.getConfig();
      var request = await fetch(config.fileServerUrl + '/api/Orchestrator/generate-gherkin', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!request.ok) {
        console.error('Failed to generate test suite:', request.statusText);
        notificationService.notify('error', 'Test suite generation failed', {
          description: request.statusText,
        });
        this.stateByFlowId[flowId] = 'error';
        this.dataByFlowId[flowId] = {
          error: 'Failed to generate test suite: ' + request.statusText,
        };
        return;
      }
      const response = await request.text();
      this.dataByFlowId[flowId] = {
        generatedContent: response,
      };
      // Update state to completed
      this.notifyComplete(flowId);
    } catch (error) {
      // Update state to error
      this.stateByFlowId[flowId] = 'error';
      this.dataByFlowId[flowId] = {
        error: error instanceof Error ? error.message : String(error),
      };

      // Emit state change event
      this.emit('stateChange', flowId, this.stateByFlowId[flowId]);

      // Notify user
      notificationService.handleError(
        error,
        'Test suite generation failed. Please try again.',
      );
    }
  }

  private notifyComplete(flowId: string): void {
    this.stateByFlowId[flowId] = 'completed';
    // Notify user
    notificationService.notify('success', 'Test suite generation completed', {
      description: 'Your test suite has been generated successfully.',
    });
    // Emit state change event
    this.emit('stateChange', flowId, this.stateByFlowId[flowId]);
  }

  /**
   * Reset the test suite generation state
   */
  resetState(flowId: string): void {
    this.stateByFlowId[flowId] = 'idle';
    this.dataByFlowId[flowId] = {};
    this.emit('stateChange', flowId, this.stateByFlowId[flowId]);
  }
}

const testSuiteService = new TestSuiteService();
export default testSuiteService;
