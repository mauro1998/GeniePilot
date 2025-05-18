import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import * as globModule from 'glob';
import * as azdev from 'azure-devops-node-api';

import { JsonPatchOperation, Operation } from 'azure-devops-node-api/interfaces/common/VSSInterfaces';
import { TestPlanApi } from 'azure-devops-node-api/TestPlanApi';
import { GherkinSummary as BaseGherkinSummary } from '../../renderer/services/gherkin_import_service';
import { TestPlanCreateParams, TestSuiteCreateParams, TestSuiteType } from 'azure-devops-node-api/interfaces/TestPlanInterfaces';
import { AzureDevOpsConfig, AzureDevOpsImportOptions } from '../../renderer/integrations/AzureDevOpsIntegration';

export interface GherkinStep {
  type: string;
  text: string;
}

export interface GherkinScenario {
  name: string;
  steps: GherkinStep[];
}

export interface ParsedGherkinFile {
  path: string;
  name: string;
  featureName: string;
  scenarios: GherkinScenario[];
}


export interface ImportResult {
  success: boolean;
  message: string;
  trace?: string;
  testPlanId?: number | string;
  testSuiteId?: number | string;
  testCases?: any[];
  testCasesCreated?: number;
  logs?: string[];
}

// Extended version that includes our additional fields
interface GherkinSummary extends BaseGherkinSummary {
  relativePath: string;
}

// Promisify file system operations
const readFileAsync = promisify(fs.readFile);
// Wrap glob in a promise
const globAsync = (pattern: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    globModule.default(pattern, (err: Error | null, files: string[]) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
};

/**
 * Service to handle Gherkin file operations (parsing, importing, etc.)
 */
class GherkinService {
  /**
   * Scan a directory for Gherkin feature files
   * @param directoryPath Path to scan
   * @returns Array of file information with feature content summaries
   */
  async scanDirectory(directoryPath: string): Promise<GherkinSummary[]> {
    try {
      const pattern = path.join(directoryPath, '**', '*.feature');
      const files = await globAsync(pattern);

      const filePromises = files.map(async (filePath: string) => {
        try {
          const content = await readFileAsync(filePath, 'utf-8');
          const relativePath = path.relative(directoryPath, filePath);

          // Basic parsing to count scenarios
          const scenarios = (content.match(/Scenario:/g) || []).length;
          const scenarioOutlines = (content.match(/Scenario Outline:/g) || []).length;
          const totalScenarios = scenarios + scenarioOutlines;

          // Extract feature name
          const featureMatch = content.match(/Feature:(.+)$/m);
          const featureName = featureMatch ? featureMatch[1].trim() : 'Unknown Feature';

          // Let's create an object with the fields we want, then cast it as needed
          const summary = {
            path: filePath,
            relativePath,
            fileName: path.basename(filePath),
            scenarios: totalScenarios,
            tags: [], // Assuming no tags by default
            featureName: featureName,
            size: fs.statSync(filePath).size
          } as unknown as GherkinSummary;

          return summary;
        } catch (error) {
          console.error(`Error processing file ${filePath}:`, error);
          return null;
        }
      });

      const results = await Promise.all(filePromises);
      return results.filter(Boolean) as GherkinSummary[];
    } catch (error) {
      console.error('Error scanning directory:', error);
      throw new Error(`Failed to scan directory: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parse a single Gherkin file
   * @param filePath Path to the file
   * @returns Parsed file content
   */
  async parseFile(filePath: string): Promise<ParsedGherkinFile> {
    try {
      const content = await readFileAsync(filePath, 'utf-8');

      // Basic parsing logic (could be replaced with a proper Gherkin parser)
      const featureMatch = content.match(/Feature:(.+)$/m);
      const featureName = featureMatch ? featureMatch[1].trim() : 'Unknown Feature';

      const scenarios = [];
      const scenarioMatches = content.matchAll(/Scenario:(.+)$[\s\S]*?(?=Scenario:|$)/gm);

      for (const match of scenarioMatches) {
        const scenarioText = match[0];
        const scenarioNameMatch = scenarioText.match(/Scenario:(.+)$/m);
        const scenarioName = scenarioNameMatch ? scenarioNameMatch[1].trim() : 'Unknown Scenario';

        const steps = [];
        const stepMatches = scenarioText.matchAll(/^\s*(Given|When|Then|And|But)(.+)$/gm);

        for (const stepMatch of stepMatches) {
          steps.push({
            type: stepMatch[1].trim(),
            text: stepMatch[2].trim()
          });
        }

        scenarios.push({
          name: scenarioName,
          steps
        });
      }

      return {
        path: filePath,
        name: path.basename(filePath),
        featureName,
        scenarios
      };
    } catch (error) {
      console.error(`Error parsing file ${filePath}:`, error);
      throw new Error(`Failed to parse file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Import Gherkin files to Azure DevOps
   * @param config Azure DevOps configuration
   * @param directoryPath Path to directory containing Gherkin files
   * @param options Import options
   * @returns Import results
   */
  async importToAzureDevOps(
    config: AzureDevOpsConfig,
    directoryPath: string,
    options: AzureDevOpsImportOptions
  ): Promise<ImportResult> {
    const logs: string[] = [];
    try {
      // First scan the directory for Gherkin files
      const files = await this.scanDirectory(directoryPath);
      if (files.length === 0) {
        return { success: false, message: 'No Gherkin files found in the specified directory' };
      }

      // Extract configuration values
      const { orgName, projectName, personalAccessToken } = config;
      const { planName, planId, suiteName, suiteId } = options;

      // Initialize Azure DevOps client
      const orgUrl = `https://dev.azure.com/${orgName}`;
      const authHandler = azdev.getPersonalAccessTokenHandler(personalAccessToken);
      const connection = new azdev.WebApi(orgUrl, authHandler);

      // Get test and work item tracking API instances
      const testApi = await connection.getTestPlanApi();
      const witApi = await connection.getWorkItemTrackingApi();

      // Step 1: Get or create test plan
      let testPlanId = planId;
      if (!testPlanId && planName) {
        logs.push(`Creating new test plan with name: ${planName}`);
        const testPlanCreateParams: TestPlanCreateParams = {
          name: planName,
          areaPath: projectName,
          iteration: projectName,
        };

        const createdTestPlan = await testApi.createTestPlan(testPlanCreateParams, projectName);
        logs.push(`Created test plan with ID: ${createdTestPlan?.id}`);
        testPlanId = createdTestPlan?.id;
      }

      if (!testPlanId) {
        return {
          success: false,
          message: 'You must provide either a test plan ID or a name for a new plan'
        };
      }

      // Step 2: Get or create test suite
      let testSuiteId = suiteId;
      if (!testSuiteId && suiteName) {
        logs.push(`Creating new test suite with name: ${suiteName}`);
        const testSuiteCreateParams: TestSuiteCreateParams = {
          name: suiteName,
          suiteType: TestSuiteType.StaticTestSuite,
        };

        const createdSuite = await testApi.createTestSuite(testSuiteCreateParams, projectName, testPlanId);
        logs.push(`Created test suite with ID: ${createdSuite?.id}`);
        testSuiteId = createdSuite?.id;
      }

      if (!testSuiteId) {
        return {
          success: false,
          message: 'You must provide either a test suite ID or a name for a new suite',
          logs: logs
        };
      }

      // Step 3: Process each file and create test cases
      const results: ImportResult = {
        success: true,
        message: `Imported ${files.length} Gherkin files with success`,
        testPlanId,
        testSuiteId,
        testCases: [],
        logs: logs
      };

      for (const file of files) {
        try {
          logs.push(`Processing file: ${file.relativePath}`);
          const parsedFile = await this.parseFile(file.path);

          for (const scenario of parsedFile.scenarios) {
            logs.push(`Creating test case for scenario: ${scenario.name}`);
            // Create test case for each scenario
            const patchOperations: JsonPatchOperation[] = [
              {
                op: Operation.Add,
                path: '/fields/System.Title',
                value: `${parsedFile.featureName} - ${scenario.name}`
              },
              {
                op: Operation.Add,
                path: '/fields/Microsoft.VSTS.TCM.Steps',
                value: this.formatStepsForAzureDevOps(scenario.steps)
              }
            ];

            logs.push(`Patch operations: ${JSON.stringify(patchOperations)}`);
            // Create work item with test case type
            logs.push(`Creating work item for test case: ${scenario.name}`);
            const createdWorkItem = await witApi.createWorkItem(
              { }, // teamContext
              patchOperations,
              projectName,
              'Test Case'
            );

            logs.push(`Created work item with ID: ${createdWorkItem?.id}`);
            const testCaseId = createdWorkItem?.id;
            if (!testCaseId) {
              logs.push(`Failed to create test case for scenario: ${scenario.name}`);
              return {
                success: false,
                message: `Failed to create test case for scenario: ${scenario.name}`,
                logs: logs
              };
            }
            logs.push(`Adding test case to suite with ID: ${testSuiteId}`);
            // Add test case to the suite
            const testCases= await testApi.addTestCasesToSuite([ { workItem:createdWorkItem }],
              projectName,
              testPlanId,
              testSuiteId
            );
            logs.push(`Added test case to suite: ${testCases.length} test cases added`);

            if (results.testCases) {
              logs.push(`Adding test case to results: ${testCaseId}`);
              results.testCases.push({
                id: testCaseId,
                name: scenario.name,
                feature: parsedFile.featureName,
                file: file.relativePath
              });
            }
          }
        } catch (error) {
          console.error(`Error processing file ${file.path}:`, error);
        }
      }

      results.testCasesCreated = results.testCases?.length ?? 0;
      return results;
    } catch (error) {
      console.error('Error importing to Azure DevOps:', error);
      return {
        success: false,
        message: `Failed to import to Azure DevOps: ${error instanceof Error ? error.message : String(error)}`,
        trace: error instanceof Error ? error.stack : undefined,
        logs: logs,
      };
    }
  }

  /**
   * Format steps for Azure DevOps test cases
   * @param steps Array of step objects
   * @returns HTML formatted steps
   */
  private formatStepsForAzureDevOps(steps: GherkinStep[]): string {
    let stepsHtml = '<steps id="0">';

    steps.forEach((step, index) => {
      stepsHtml += `
        <step id="${index + 1}" type="ActionStep">
          <parameterizedString isformatted="true">${step.type} ${step.text}</parameterizedString>
          <parameterizedString isformatted="true"></parameterizedString>
        </step>
      `;
    });

    stepsHtml += '</steps>';
    return stepsHtml;
  }
}

export default new GherkinService();
