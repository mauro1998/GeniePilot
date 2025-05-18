import { EventEmitter } from 'events';
import notificationService from './notification_service';

export type TestSuiteState = 'idle' | 'generating' | 'completed' | 'error';

interface TestSuiteData {
  generatedContent?: string;
  error?: string;
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
  async generateTestSuite(flowId: string): Promise<void> {
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
      // Mock API call with timeout
      // This will be replaced with actual API call in the future
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          // Mock test suite data
          this.dataByFlowId[flowId] = {
            generatedContent:
              'Feature: Sample feature\n\n  Scenario: Sample scenario\n    Given I am on the homepage\n    When I click the button\n    Then I should see the result',
          };

          // Update state to completed
          this.stateByFlowId[flowId] = 'completed';

          // Emit state change event
          this.emit('stateChange', flowId, this.stateByFlowId[flowId]);

          // Notify user
          notificationService.notify(
            'success',
            'Test suite generation completed',
            {
              description: 'Your test suite has been generated successfully.',
            },
          );

          resolve();
        }, 5000); // Simulate 5 seconds of processing
      });
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
