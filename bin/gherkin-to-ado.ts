#!/usr/bin/env node

import * as path from 'path';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import GherkinToAzureDevOpsImporter from '../src/importers/gherkinToAzureDevOpsImporter';

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [options]')
  .option('gherkin-dir', {
    describe: 'Directory containing gherkin feature files',
    type: 'string',
    demandOption: true
  })
  .option('org-name', {
    describe: 'Azure DevOps organization name',
    type: 'string',
    demandOption: true
  })
  .option('project-name', {
    describe: 'Azure DevOps project name',
    type: 'string',
    demandOption: true
  })
  .option('token', {
    describe: 'Azure DevOps personal access token',
    type: 'string',
    demandOption: true
  })
  .option('plan-id', {
    describe: 'Existing test plan ID',
    type: 'number'
  })
  .option('plan-name', {
    describe: 'Name for new test plan (if plan-id not provided)',
    type: 'string'
  })
  .option('suite-id', {
    describe: 'Existing test suite ID',
    type: 'number'
  })
  .option('suite-name', {
    describe: 'Name for new test suite (if suite-id not provided)',
    type: 'string',
    default: 'Imported from Gherkin'
  })
  .option('api-version', {
    describe: 'Azure DevOps API version',
    type: 'string',
    default: '6.0'
  })
  .check((argv) => {
    if (!argv['plan-id'] && !argv['plan-name']) {
      throw new Error('Either --plan-id or --plan-name must be provided');
    }
    return true;
  })
  .help()
  .alias('help', 'h')
  .parseSync();

// Run the importer
async function run(): Promise<void> {
  try {
    // Configure Azure DevOps service
    const azureConfig = {
      orgName: argv['org-name'] as string,
      projectName: argv['project-name'] as string,
      personalAccessToken: argv.token as string,
      apiVersion: argv['api-version'] as string
    };

    // Import options
    const importOptions = {
      planId: argv['plan-id'] as number | undefined,
      planName: argv['plan-name'] as string | undefined,
      suiteId: argv['suite-id'] as number | undefined,
      suiteName: argv['suite-name'] as string | undefined
    };

    // Create importer
    const importer = new GherkinToAzureDevOpsImporter(azureConfig);

    // Resolve the gherkin directory path
    const gherkinDir = path.resolve(process.cwd(), argv['gherkin-dir'] as string);

    // Run the import
    console.log('Starting import...');
    const results = await importer.importFromDirectory(gherkinDir, importOptions);

    // Output results
    console.log('\nImport Results:');
    console.log('===============');
    console.log(`Test Plan ID: ${results.planId}`);
    console.log(`Test Suite ID: ${results.suiteId}`);
    console.log(`Imported Test Cases: ${results.importedTestCases.length}`);

    results.importedTestCases.forEach(tc => {
      console.log(`- ${tc.name} (ID: ${tc.id})`);
      console.log(`  URL: ${tc.url}`);
    });

    console.log('\nImport completed successfully!');
  } catch (error) {
    console.error('Error running importer:', (error as Error).message);
    process.exit(1);
  }
}

run();

run();
