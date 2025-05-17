# Gherkin to Azure DevOps Test Plan Importer

This tool allows you to import Gherkin feature files into Azure DevOps Test Plans. It parses the Gherkin files and creates test cases in Azure DevOps using the API. Built with TypeScript for improved type safety and developer experience.

## Installation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Make the CLI tool available globally
npm link
```

## Prerequisites

1. You need an Azure DevOps account with appropriate permissions to create test plans and test cases.
2. You need a Personal Access Token (PAT) with appropriate permissions.
3. Your Gherkin files should follow the standard syntax.

## Usage

```bash
gherkin-to-ado --gherkin-dir <path-to-gherkin-files> \
               --org-name <azure-devops-org-name> \
               --project-name <azure-devops-project-name> \
               --token <personal-access-token> \
               --plan-name "My Test Plan" \
               --suite-name "My Test Suite"
```

## Command Line Options

| Option | Description | Required |
|--------|-------------|----------|
| --gherkin-dir | Directory containing Gherkin feature files | Yes |
| --org-name | Azure DevOps organization name | Yes |
| --project-name | Azure DevOps project name | Yes |
| --token | Azure DevOps personal access token | Yes |
| --plan-id | Existing test plan ID | No* |
| --plan-name | Name for new test plan (if plan-id not provided) | No* |
| --suite-id | Existing test suite ID | No |
| --suite-name | Name for new test suite (if suite-id not provided) | No (default: "Imported from Gherkin") |
| --api-version | Azure DevOps API version | No (default: "6.0") |

*Either --plan-id or --plan-name must be provided.

## Examples

### Create a new test plan and suite

```bash
gherkin-to-ado --gherkin-dir ./features \
               --org-name myorg \
               --project-name myproject \
               --token abc123def456 \
               --plan-name "Q4 2023 Test Plan" \
               --suite-name "Login Features"
```

### Import to an existing test plan and create a new suite

```bash
gherkin-to-ado --gherkin-dir ./features \
               --org-name myorg \
               --project-name myproject \
               --token abc123def456 \
               --plan-id 12345 \
               --suite-name "Payment Features"
```

### Import to an existing test plan and suite

```bash
gherkin-to-ado --gherkin-dir ./features \
               --org-name myorg \
               --project-name myproject \
               --token abc123def456 \
               --plan-id 12345 \
               --suite-id 67890
```

## How it works

1. The tool parses all .feature files in the specified directory
2. It converts Gherkin scenarios to Azure DevOps test cases
3. It creates or uses an existing test plan and suite
4. It adds all test cases to the test suite
5. It reports the results with links to the created resources

## Structure

- `src/utils/gherkinParser.ts` - Parses Gherkin files
- `src/services/azureDevOpsService.ts` - Handles communication with Azure DevOps API
- `src/importers/gherkinToAzureDevOpsImporter.ts` - Main importer logic
- `bin/gherkin-to-ado.ts` - CLI entry point

## Development

To run the tool in development mode without building:

```bash
npm run dev -- --gherkin-dir ./examples \
              --org-name your-org \
              --project-name your-project \
              --token your-token \
              --plan-name "My Test Plan"
```

## License

MIT
