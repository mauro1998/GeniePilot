import React, { useState, useEffect } from 'react';
import { Typography, Form, Input, Button, Card, Table, Select, notification, Space, Divider, Modal, Tooltip, List, Tag, Tabs } from 'antd';
import { PlusOutlined, CloudUploadOutlined, DeleteOutlined, SettingOutlined, QuestionCircleOutlined, FolderOpenOutlined } from '@ant-design/icons';
import gherkinImportService, { GherkinSummary } from '../services/gherkinImportService';
import integrationsManager from '../integrations/IntegrationsManager';
import { IntegrationProvider, BaseIntegrationConfig } from '../integrations/IntegrationProvider';
import GherkinImporter from '../components/GherkinImporter';
import IntegrationSelectorModal from '../components/IntegrationSelectorModal';

// Import all available integrations
import '../integrations/AzureDevOpsIntegration';
// Add other integration imports here

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface AzureDevOpsProject {
  id: string;
  name: string;
  orgName: string;
  projectName: string;
  personalAccessToken: string;
}

export default function Integrations() {
  const [projects, setProjects] = useState<AzureDevOpsProject[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<AzureDevOpsProject | null>(null);
  const [loading, setLoading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [gherkinFiles, setGherkinFiles] = useState<GherkinSummary[]>([]);
  const [scanningDirectory, setScanningDirectory] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<IntegrationProvider<any, any>[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('azure-devops'); // Default to Azure DevOps

  const [form] = Form.useForm();
  const [importForm] = Form.useForm();

  // Load saved projects and available providers on component mount
  useEffect(() => {
    loadProjects();

    // Load available integration providers
    const providers = gherkinImportService.getAvailableIntegrations();
    setAvailableProviders(providers);

    // Set default provider if available
    if (providers.length > 0) {
      setSelectedProviderId(providers[0].id);
    }
  }, []);

  const loadProjects = () => {
    try {
      // Use the integration manager to get Azure DevOps projects
      const projects = integrationsManager.getAzureDevOpsProjects();
      setProjects(projects);
    } catch (error) {
      console.error('Error loading Azure DevOps projects:', error);
      notification.error({
        message: 'Failed to load integrations',
        description: 'Could not load your saved integration configurations.'
      });
    }
  };

  const saveProjects = (projectsList: AzureDevOpsProject[]) => {
    try {
      // Use the integration manager to save Azure DevOps projects
      integrationsManager.saveAzureDevOpsProjects(projectsList);
      setProjects(projectsList);
    } catch (error) {
      console.error('Error saving Azure DevOps projects:', error);
      notification.error({
        message: 'Failed to save integration',
        description: 'Could not save your integration configuration.'
      });
    }
  };

  const showModal = (project?: AzureDevOpsProject) => {
    if (project) {
      setEditingProject(project);
      form.setFieldsValue(project);
    } else {
      setEditingProject(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setImportModalVisible(false);
    form.resetFields();
    importForm.resetFields();
  };

  const handleSubmit = (values: any) => {
    if (editingProject) {
      // Edit existing project
      const updatedProjects = projects.map(p =>
        p.id === editingProject.id ? { ...values, id: editingProject.id } : p
      );
      saveProjects(updatedProjects);
      notification.success({ message: 'Project updated successfully' });
    } else {
      // Add new project
      const newProject = {
        ...values,
        id: Date.now().toString(), // Simple ID generation
      };
      saveProjects([...projects, newProject]);
      notification.success({ message: 'Project added successfully' });
    }
    setIsModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this integration?',
      onOk: () => {
        const updatedProjects = projects.filter(p => p.id !== id);
        saveProjects(updatedProjects);
        notification.success({ message: 'Project deleted successfully' });
      }
    });
  };

  const showImportModal = (projectId: string) => {
    setSelectedProjectId(projectId);
    setImportModalVisible(true);
    importForm.resetFields();

    // Reset the provider selection to default
    const providers = gherkinImportService.getAvailableIntegrations();
    if (providers.length > 0) {
      setSelectedProviderId(providers[0].id);
    }
  };

  const handleImport = async (values: any) => {
    setLoading(true);
    try {
      const selectedProject = projects.find(p => p.id === selectedProjectId);

      if (!selectedProject) {
        throw new Error('Project not found');
      }

      // Prepare import options
      const options = {
        planId: values.planId ? parseInt(values.planId, 10) : undefined,
        planName: values.planName ?? undefined,
        suiteId: values.suiteId ? parseInt(values.suiteId, 10) : undefined,
        suiteName: values.suiteName ?? undefined
      };

      // Create provider-specific configuration
      // For Azure DevOps
      let config: BaseIntegrationConfig & Record<string, any> = {
        name: selectedProject.name,
        description: `Import to ${selectedProject.orgName}/${selectedProject.projectName}`,
      };

      // Add provider-specific fields
      if (selectedProviderId === 'azure-devops') {
        config = {
          ...config,
          orgName: selectedProject.orgName,
          projectName: selectedProject.projectName,
          personalAccessToken: selectedProject.personalAccessToken
        };
      }

      // Use the selected integration provider
      var result = await gherkinImportService.importWithProvider(
        selectedProviderId,
        config,
        values.gherkinDirectory,
        options
      );

      if(!result.success) {
        console.error('Import failed:',        );
        throw new Error(result.message);
      }

      notification.success({
        message: 'Import Successful',
        description: `Tests imported successfully.`
      });

      setImportModalVisible(false);
    } catch (error) {
      console.error('Import failed:', error);
      notification.error({
        message: 'Import Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectDirectory = async () => {
    try {
      const result: Electron.OpenDialogReturnValue = await window.electron.fileSystem.selectDirectory();
      if (!result.canceled && result.filePaths) {
        const dirPath = result.filePaths[0];
        importForm.setFieldsValue({ gherkinDirectory: dirPath });

        // Scan for Gherkin files
        setScanningDirectory(true);
        try {
          const fileSummaries = await gherkinImportService.scanDirectory(dirPath);
          setGherkinFiles(fileSummaries);

          if (fileSummaries.length === 0) {
            notification.warning({
              message: 'No Gherkin Files Found',
              description: 'No .feature files were found in the selected directory.'
            });
          } else {
            notification.success({
              message: 'Gherkin Files Found',
              description: `Found ${fileSummaries.length} feature files with ${fileSummaries.reduce((sum, file) => sum + file.scenarios, 0)} test scenarios.`
            });
          }
        } catch (scanError) {
          console.error('Error scanning directory:', scanError);
          notification.error({
            message: 'Directory Scan Failed',
            description: scanError instanceof Error ? scanError.message : 'Failed to scan directory for Gherkin files'
          });
        } finally {
          setScanningDirectory(false);
        }
      }
    } catch (error) {
      console.error('Failed to select directory:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to select directory'
      });
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Organization',
      dataIndex: 'orgName',
      key: 'orgName',
    },
    {
      title: 'Project',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: AzureDevOpsProject) => (
        <Space>
          <Button
            icon={<CloudUploadOutlined />}
            onClick={() => showImportModal(record.id)}
            type="primary"
          >
            Import
          </Button>
          <Button
            icon={<SettingOutlined />}
            onClick={() => showModal(record)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>Integrations</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Add Integration
        </Button>
      </div>

      <Tabs defaultActiveKey="configured">
        <TabPane tab="Configured Integrations" key="configured">
          {projects.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center justify-center py-8">
                <Text className="text-lg mb-4">No integrations configured yet</Text>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showModal()}
                >
                  Add your first integration
                </Button>
              </div>
            </Card>
          ) : (
            <Table
              dataSource={projects}
              columns={columns}
              rowKey="id"
              pagination={false}
            />
          )}
        </TabPane>

        <TabPane tab="Quick Import" key="quick-import">
          <GherkinImporter />
        </TabPane>
      </Tabs>

      {/* Project Configuration Modal */}
      <Modal
        title={editingProject ? "Edit Integration" : "Add Integration"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Integration Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input placeholder="My Azure DevOps Project" />
          </Form.Item>

          <Form.Item
            name="orgName"
            label="Organization Name"
            rules={[{ required: true, message: 'Please enter the organization name' }]}
          >
            <Input placeholder="organization" />
          </Form.Item>

          <Form.Item
            name="projectName"
            label="Project Name"
            rules={[{ required: true, message: 'Please enter the project name' }]}
          >
            <Input placeholder="project" />
          </Form.Item>

          <Form.Item
            name="personalAccessToken"
            label={
              <span>
                Personal Access Token
                <Tooltip title="Generate a PAT with 'Test Management' permissions from your Azure DevOps profile settings">
                  <QuestionCircleOutlined className="ml-1" />
                </Tooltip>
              </span>
            }
            rules={[{ required: true, message: 'Please enter your PAT' }]}
          >
            <Input.Password placeholder="Personal Access Token" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end">
              <Button onClick={handleCancel} className="mr-2">
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingProject ? 'Update' : 'Add'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Import Modal */}
      <Modal
        title="Import Gherkin Tests"
        open={importModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={importForm}
          layout="vertical"
          onFinish={handleImport}
        >
          <Divider orientation="left">Integration Provider</Divider>
          <Form.Item
            name="providerId"
            label="Select Integration Provider"
            initialValue={selectedProviderId}
            rules={[{ required: true, message: 'Please select an integration provider' }]}
          >
            <Select
              onChange={(value) => setSelectedProviderId(value)}
              placeholder="Select integration provider"
            >
              {availableProviders.map(provider => (
                <Option key={provider.id} value={provider.id}>
                  {provider.displayName} - {provider.description}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider orientation="left">Test Plan</Divider>
          <div className="flex gap-4">
            <Form.Item
              name="planName"
              label="Test Plan Name (New)"
              className="flex-1"
              rules={[
                {
                  validator: (_, value) => {
                    if (!value && !importForm.getFieldValue('planId')) {
                      return Promise.reject(new Error('Either Plan ID or Plan Name is required'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input placeholder="My Test Plan" />
            </Form.Item>

            <Text className="mt-8">OR</Text>

            <Form.Item
              name="planId"
              label="Existing Test Plan ID"
              className="flex-1"
            >
              <Input placeholder="12345" />
            </Form.Item>
          </div>

          <Divider orientation="left">Test Suite</Divider>
          <div className="flex gap-4">
            <Form.Item
              name="suiteName"
              label="Test Suite Name (New)"
              className="flex-1"
              rules={[
                {
                  validator: (_, value) => {
                    if (!value && !importForm.getFieldValue('suiteId')) {
                      return Promise.reject(new Error('Either Suite ID or Suite Name is required'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input placeholder="My Test Suite" />
            </Form.Item>

            <Text className="mt-8">OR</Text>

            <Form.Item
              name="suiteId"
              label="Existing Test Suite ID"
              className="flex-1"
            >
              <Input placeholder="12345" />
            </Form.Item>
          </div>

          <Divider orientation="left">Gherkin Files</Divider>
          <Form.Item
            name="gherkinDirectory"
            label="Gherkin Directory Path"
            rules={[{ required: true, message: 'Please enter the directory path' }]}
          >
            <Input
              placeholder="/path/to/gherkin/files"
              addonAfter={
                <Button type="link" onClick={selectDirectory} className="p-0">
                  Browse
                </Button>
              }
            />
          </Form.Item>

          {gherkinFiles.length > 0 && (
            <>
              <Divider orientation="left">Files to Import</Divider>
              <List
                size="small"
                bordered
                loading={scanningDirectory}
                dataSource={gherkinFiles}
                renderItem={(item) => (
                  <List.Item>
                    <div className="flex flex-col w-full">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{item.fileName}</span>
                        <span>{item.scenarios} scenarios</span>
                      </div>
                      <div className="mt-1">
                        {item.tags.map((tag: string) => (
                          <Tag key={tag} color="blue">{tag}</Tag>
                        ))}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </>
          )}

          <Form.Item>
            <div className="flex justify-end">
              <Button onClick={handleCancel} className="mr-2">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<CloudUploadOutlined />}
                loading={loading}
              >
                Import Files
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
