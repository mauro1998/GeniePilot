# Screenshot to Test - AI-Powered Test Generation

## Overview
Screenshot to Test is an innovative tool that bridges the gap between UI design and test automation by leveraging AI to analyze UI screenshots, automatically generating Gherkin scenarios, and importing them into Azure DevOps Test Plans. This application streamlines the process of creating functional tests from visual designs.

## Key Features

### AI-Powered UI Analysis
- Analyzes screenshots of application interfaces
- Identifies UI components, layouts, and interactive elements
- Creates a structured UI tree representation of detected elements

### Automated Gherkin Generation
- Converts visual UI elements into Gherkin format (Given/When/Then) test scenarios
- Generates human-readable BDD specifications based on identified UI components
- Creates comprehensive test scenarios covering UI interactions

### Azure DevOps Integration
- Seamlessly imports generated Gherkin scenarios into Azure DevOps Test Plans
- Creates structured test cases, plans, and suites in Azure DevOps
- Maintains traceability between visual designs and formal test cases

## Technical Stack
- **Electron**: Cross-platform desktop application framework
- **React**: Modern UI library for component-based interfaces
- **TypeScript**: Strong typing for improved code quality
- **Tailwind CSS**: Utility-first CSS framework
- **Ant Design**: UI component library
- **Jest**: Testing framework
- **Webpack**: Module bundling
- **Node.js**: JavaScript runtime
- **Azure DevOps API**: For test plan integration

## Installation

Clone the repo and install dependencies:

```bash
git clone https://github.com/your-repo/screenshot-to-test.git
cd screenshot-to-test
npm install
```

## Starting Development

Start the app in development mode:

```bash
npm start
```

## Packaging for Production

Package the app for your platform:

```bash
npm run package
```

## Using the CLI Tool

The Gherkin-to-Azure DevOps importer can also be used as a standalone CLI tool:

```bash
# Link the CLI tool globally
npm link

# Basic usage
gherkin-to-ado --gherkin-dir <path-to-gherkin-files> \
               --org-name <azure-devops-org-name> \
               --project-name <azure-devops-project-name> \
               --token <personal-access-token> \
               --plan-name "My Test Plan" \
               --suite-name "My Test Suite"
```

### Command Line Options

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

## How It Works

1. **Image Upload**: User uploads screenshots of their application UI
2. **AI Processing**: The system analyzes the images and identifies UI components
3. **Gherkin Generation**: Based on the UI analysis, Gherkin test scenarios are created
4. **Azure DevOps Import**: Generated Gherkin files are converted into Azure DevOps test cases
5. **Test Management**: Tests are organized into suites and plans for execution

## Future Roadmap

### Immediate Next Steps
- **Improved AI Recognition**: Enhance accuracy for complex UI patterns
- **Additional Test Platforms**: Support for Jira, TestRail, etc.
- **Batch Processing**: Handle multiple screenshots in one operation
- **Review & Edit Interface**: Allow refinement of generated Gherkin

### Growth Potential
- **Enterprise Test Automation**: Scale to enterprise-level test creation
- **CI/CD Integration**: Seamless integration with development pipelines
- **Cross-Platform Support**: Recognize mobile, web, and desktop UIs
- **Accessibility Testing**: Identify accessibility issues in interfaces
- **Predictive Test Generation**: Suggest tests for edge cases
- **NLP Capabilities**: Generate tests from plain English descriptions
- **Self-Improving Models**: Implement feedback loops to increase accuracy

### Scaling Opportunities
- **SaaS Model**: Cloud-based service with API access
- **Industry-Specific Models**: Specialized AI for different sectors
- **Plugin Ecosystem**: Integrations with design tools
- **Visual Regression Testing**: Automated visual comparison
- **Test Data Generation**: Create realistic test data based on field types
- **Multi-language Support**: Generate tests in various programming languages
- **Collaborative Testing**: Enable teams to work simultaneously

## License

Proprietary. All rights reserved. This software may not be used without express written permission from the author(s).
