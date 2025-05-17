import * as fs from 'fs';
import * as path from 'path';
import { Parser } from 'gherkin';

interface GherkinStep {
  keyword: string;
  text: string;
}

interface GherkinTag {
  name: string;
}

interface GherkinScenario {
  name: string;
  description?: string;
  steps: GherkinStep[];
  tags?: GherkinTag[];
}

interface GherkinFeature {
  description?: string;
  children: Array<{
    scenario?: GherkinScenario;
  }>;
  tags?: GherkinTag[];
}

interface GherkinDocument {
  feature?: GherkinFeature;
}

interface ParsedGherkinFile {
  fileName: string;
  content: GherkinDocument;
}

export interface GherkinTestCase {
  name: string;
  description: string;
  tags: string[];
  steps: {
    type: string;
    text: string;
  }[];
}

/**
 * GherkinParser class to read and parse Gherkin feature files
 */
class GherkinParser {
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
  }

  /**
   * Parse a gherkin file and return the parsed content
   * @param {string} filePath - Path to the gherkin file
   * @returns {GherkinDocument} Parsed gherkin content
   */
  parseFile(filePath: string): GherkinDocument {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const parsedContent = this.parser.parse(fileContent);
      return parsedContent;
    } catch (error) {
      console.error(`Error parsing gherkin file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Parse multiple gherkin files from a directory
   * @param {string} directoryPath - Path to directory containing gherkin files
   * @param {string} extension - File extension to look for (default: .feature)
   * @returns {Array<ParsedGherkinFile>} Array of parsed gherkin content
   */
  parseDirectory(directoryPath: string, extension: string = '.feature'): ParsedGherkinFile[] {
    try {
      const files = fs.readdirSync(directoryPath);
      const gherkinFiles = files.filter(file => path.extname(file) === extension);

      return gherkinFiles.map(file => {
        const filePath = path.join(directoryPath, file);
        return {
          fileName: file,
          content: this.parseFile(filePath)
        };
      });
    } catch (error) {
      console.error(`Error parsing gherkin directory ${directoryPath}:`, error);
      throw error;
    }
  }

  /**
   * Convert gherkin document to test case format
   * @param {GherkinDocument} gherkinDocument - Parsed gherkin document
   * @returns {Array<GherkinTestCase>} Array of test cases
   */
  convertToTestCases(gherkinDocument: GherkinDocument): GherkinTestCase[] {
    const testCases: GherkinTestCase[] = [];

    if (gherkinDocument && gherkinDocument.feature) {
      const feature = gherkinDocument.feature;

      if (feature.children && feature.children.length > 0) {
        feature.children.forEach(child => {
          if (child.scenario) {
            const scenario = child.scenario;

            const steps = scenario.steps.map(step => {
              return {
                type: step.keyword.trim(),
                text: step.text
              };
            });

            testCases.push({
              name: scenario.name,
              description: scenario.description || feature.description || '',
              tags: [...(feature.tags || []), ...(scenario.tags || [])].map(tag => tag.name),
              steps: steps
            });
          }
        });
      }
    }

    return testCases;
  }
}

export default GherkinParser;
