import GherkinParser, { GherkinTestCase } from '../utils/gherkinParser';
import AzureDevOpsService from '../services/azureDevOpsService';

interface AzureDevOpsConfig {
  orgName: string;
  projectName: string;
  personalAccessToken: string;
  apiVersion?: string;
}

interface ImportOptions {
  planId?: number;
  planName?: string;
  suiteId?: number;
  suiteName?: string;
}

interface ImportedTestCase {
  name: string;
  id: number;
  url: string;
}

interface ImportResults {
  planId: number;
  suiteId: number;
  importedTestCases: ImportedTestCase[];
}

/**
 * GherkinToAzureDevOpsImporter class for importing Gherkin files to Azure DevOps Test Plans
 */
class GherkinToAzureDevOpsImporter {
  private gherkinParser: GherkinParser;
  private azureService: AzureDevOpsService;

  /**
   * Constructor for GherkinToAzureDevOpsImporter
   * @param {AzureDevOpsConfig} azureConfig Azure DevOps configuration
   */
  constructor(azureConfig: AzureDevOpsConfig) {
    this.gherkinParser = new GherkinParser();
    this.azureService = new AzureDevOpsService(azureConfig);
  }

  /**
   * Import Gherkin files from a directory to Azure DevOps
   * @param {string} gherkinDir Directory containing Gherkin files
   * @param {ImportOptions} options Import options
   * @returns {Promise<ImportResults>} Import results
   */
  async importFromDirectory(gherkinDir: string, options: ImportOptions = {}): Promise<ImportResults> {
    try {
      console.log(`Importing Gherkin files from ${gherkinDir}...`);

      // Parse all Gherkin files in the directory
      const parsedFiles = this.gherkinParser.parseDirectory(gherkinDir);
      console.log(`Found ${parsedFiles.length} Gherkin files.`);

      // Get or create test plan
      let planId = options.planId;
      if (!planId) {
        if (!options.planName) {
          throw new Error('Either planId or planName must be provided');
        }

        const newPlan = await this.azureService.createTestPlan({
          name: options.planName,
          description: 'Imported from Gherkin files'
        });

        planId = newPlan.id;
        console.log(`Created new test plan: ${options.planName} (ID: ${planId})`);
      } else {
        console.log(`Using existing test plan ID: ${planId}`);
      }

      // Ensure planId is defined by this point
      if (!planId) {
        throw new Error('Failed to obtain a valid test plan ID');
      }

      // Get or create test suite
      let suiteId = options.suiteId;
      if (!suiteId) {
        if (!options.suiteName) {
          throw new Error('Either suiteId or suiteName must be provided');
        }

        const newSuite = await this.azureService.createTestSuite(planId, {
          name: options.suiteName,
          suiteType: 'StaticTestSuite'
        });

        suiteId = newSuite.id;
        console.log(`Created new test suite: ${options.suiteName} (ID: ${suiteId})`);
      } else {
        console.log(`Using existing test suite ID: ${suiteId}`);
      }

      // Ensure suiteId is defined by this point
      if (!suiteId) {
        throw new Error('Failed to obtain a valid test suite ID');
      }

      // Process each file and convert to test cases
      const results: ImportResults = {
        planId,
        suiteId,
        importedTestCases: []
      };

      for (const file of parsedFiles) {
        console.log(`Processing file: ${file.fileName}`);

        // Convert Gherkin document to test cases
        const testCases = this.gherkinParser.convertToTestCases(file.content);
        console.log(`Found ${testCases.length} test cases in ${file.fileName}`);

        // Create each test case in Azure DevOps
        for (const testCase of testCases) {
          console.log(`Creating test case: ${testCase.name}`);

          // Format test case for Azure DevOps
          const formattedTestCase = this.azureService.formatTestCase(testCase);

          // Create test case
          const createdTestCase = await this.azureService.createTestCase(formattedTestCase);

          // Add test case to suite
          await this.azureService.addTestCasesToSuite(planId, suiteId, [createdTestCase.id]);

          results.importedTestCases.push({
            name: testCase.name,
            id: createdTestCase.id,
            url: createdTestCase._links.html.href
          });

          console.log(`Test case created: ${testCase.name} (ID: ${createdTestCase.id})`);
        }
      }

      console.log(`Import completed. Imported ${results.importedTestCases.length} test cases.`);
      return results;
    } catch (error) {
      console.error('Error importing Gherkin files:', error);
      throw error;
    }
  }
}

export default GherkinToAzureDevOpsImporter;
