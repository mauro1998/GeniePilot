import axios, { AxiosInstance } from 'axios';
import { GherkinTestCase } from '../../utils/gherkin_parser';

interface AzureDevOpsConfig {
  orgName: string;
  projectName: string;
  personalAccessToken: string;
  apiVersion?: string;
}

interface TestCase {
  fields: Array<{
    name: string;
    value: string;
  }>;
}

interface TestSuite {
  name: string;
  suiteType?: string;
}

interface TestPlan {
  name: string;
  description?: string;
}

/**
 * Azure DevOps API service for interacting with test plans and test cases
 */
class AzureDevOpsService {
  private orgName: string;
  private projectName: string;
  private personalAccessToken: string;
  private apiVersion: string;
  private baseUrl: string;
  private httpClient: AxiosInstance;

  /**
   * Constructor for Azure DevOps service
   * @param {AzureDevOpsConfig} config Configuration object
   */
  constructor(config: AzureDevOpsConfig) {
    this.orgName = config.orgName;
    this.projectName = config.projectName;
    this.personalAccessToken = config.personalAccessToken;
    this.apiVersion = config.apiVersion || '6.0';

    this.baseUrl = `https://dev.azure.com/${this.orgName}/${this.projectName}`;
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`:${this.personalAccessToken}`).toString('base64')}`,
      },
    });
  }

  /**
   * Get all test plans in the project
   * @returns {Promise<Array>} Test plans
   */
  async getTestPlans(): Promise<any[]> {
    try {
      const response = await this.httpClient.get(
        `/_apis/testplan/plans?api-version=${this.apiVersion}`,
      );
      return response.data.value;
    } catch (error) {
      console.error('Error getting test plans:', error);
      throw error;
    }
  }

  /**
   * Get test plan by ID
   * @param {number} planId Test plan ID
   * @returns {Promise<Object>} Test plan
   */
  async getTestPlan(planId: number): Promise<any> {
    try {
      const response = await this.httpClient.get(
        `/_apis/testplan/plans/${planId}?api-version=${this.apiVersion}`,
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting test plan ${planId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new test plan
   * @param {TestPlan} testPlan Test plan object
   * @returns {Promise<Object>} Created test plan
   */
  async createTestPlan(testPlan: TestPlan): Promise<any> {
    try {
      const response = await this.httpClient.post(
        `/_apis/testplan/plans?api-version=${this.apiVersion}`,
        testPlan,
      );
      return response.data;
    } catch (error) {
      console.error('Error creating test plan:', error);
      throw error;
    }
  }

  /**
   * Get test suites for a test plan
   * @param {number} planId Test plan ID
   * @returns {Promise<Array>} Test suites
   */
  async getTestSuites(planId: number): Promise<any[]> {
    try {
      const response = await this.httpClient.get(
        `/_apis/testplan/plans/${planId}/suites?api-version=${this.apiVersion}`,
      );
      return response.data.value;
    } catch (error) {
      console.error(`Error getting test suites for plan ${planId}:`, error);
      throw error;
    }
  }

  /**
   * Create a test suite
   * @param {number} planId Test plan ID
   * @param {TestSuite} testSuite Test suite object
   * @returns {Promise<Object>} Created test suite
   */
  async createTestSuite(planId: number, testSuite: TestSuite): Promise<any> {
    try {
      const response = await this.httpClient.post(
        `/_apis/testplan/plans/${planId}/suites?api-version=${this.apiVersion}`,
        testSuite,
      );
      return response.data;
    } catch (error) {
      console.error(`Error creating test suite for plan ${planId}:`, error);
      throw error;
    }
  }

  /**
   * Create a test case
   * @param {TestCase} testCase Test case object
   * @returns {Promise<Object>} Created test case
   */
  async createTestCase(testCase: TestCase): Promise<any> {
    try {
      const response = await this.httpClient.post(
        `/_apis/wit/workitems/$Test%20Case?api-version=${this.apiVersion}`,
        testCase.fields.map((field) => ({
          op: 'add',
          path: `/fields/${field.name}`,
          value: field.value,
        })),
        {
          headers: {
            'Content-Type': 'application/json-patch+json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error creating test case:', error);
      throw error;
    }
  }

  /**
   * Add test cases to a test suite
   * @param {number} planId Test plan ID
   * @param {number} suiteId Test suite ID
   * @param {Array<number>} testCaseIds Test case IDs
   * @returns {Promise<Array>} Added test cases
   */
  async addTestCasesToSuite(
    planId: number,
    suiteId: number,
    testCaseIds: number[],
  ): Promise<any[]> {
    try {
      const response = await this.httpClient.post(
        `/_apis/testplan/plans/${planId}/suites/${suiteId}/testcases?api-version=${this.apiVersion}`,
        testCaseIds.map((id) => ({ id })),
      );
      return response.data.value;
    } catch (error) {
      console.error(`Error adding test cases to suite ${suiteId}:`, error);
      throw error;
    }
  }

  /**
   * Convert gherkin test case to Azure DevOps test case format
   * @param {GherkinTestCase} gherkinTestCase Gherkin test case object
   * @returns {TestCase} Azure DevOps formatted test case
   */
  formatTestCase(gherkinTestCase: GherkinTestCase): TestCase {
    // Create steps XML for Azure DevOps
    const stepsXml = this.formatTestSteps(gherkinTestCase.steps);

    return {
      fields: [
        {
          name: 'System.Title',
          value: gherkinTestCase.name,
        },
        {
          name: 'System.Description',
          value: gherkinTestCase.description,
        },
        {
          name: 'Microsoft.VSTS.TCM.Steps',
          value: stepsXml,
        },
      ],
    };
  }

  /**
   * Format test steps into XML for Azure DevOps
   * @param {Array} steps Test steps
   * @returns {string} XML formatted steps
   */
  private formatTestSteps(
    steps: Array<{ type: string; text: string }>,
  ): string {
    let xml = '<?xml version="1.0" encoding="utf-8"?>';
    xml += '<TestSteps>';

    steps.forEach((step, index) => {
      xml += `<step id="${index + 1}" type="ActionStep">`;
      xml += `<parameterizedString isformatted="true">`;
      xml += `<![CDATA[${step.type} ${step.text}]]>`;
      xml += '</parameterizedString>';
      xml += `<parameterizedString isformatted="true">`;
      xml += '<![CDATA[]]>'; // Expected result is empty
      xml += '</parameterizedString>';
      xml += '</step>';
    });

    xml += '</TestSteps>';
    return xml;
  }
}

export default AzureDevOpsService;
