/**
 * Project represents a collection of flows
 */
export interface Project {
  id: string; // Unique identifier
  name: string; // Project name
  description: string; // Project description
  createdAt: number; // Timestamp when created
}

/**
 * Step represents a single action or screen in a flow
 */
export interface Step {
  id: string; // Unique identifier
  name: string; // Step name
  flowId: string; // Reference to parent flow
  imageUrl?: string; // Optional url to S3 bucket image
  context?: string; // Optional description or context about the screenshot
}

/**
 * Flow represents a sequence of steps within a project
 */
export interface Flow {
  id: string; // Unique identifier
  name: string; // Flow name
  projectId: string; // Reference to parent project
  createdAt: number; // Timestamp when created
}

/**
 * TreeNode used for hierarchical visualization of projects and flows
 */
export interface TreeNode {
  name: string; // Node display name
  children?: TreeNode[]; // Child nodes (if any)
  id?: string; // Optional identifier for node (used for navigation)
}
