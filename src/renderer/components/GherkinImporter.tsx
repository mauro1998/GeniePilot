import React, { useState, useEffect } from 'react';
import { Button, message, Form, Input, Card, Spin, Select, Typography, Tag, Space } from 'antd';
import { ImportOutlined, FolderOpenOutlined, ApiOutlined } from '@ant-design/icons';
import GherkinImportService from '../services/gherkinImportService';
import integrationsManager from '../integrations/IntegrationsManager';
import IntegrationSelectorModal from './IntegrationSelectorModal';
import { BaseIntegrationConfig, IntegrationProvider } from '../integrations/IntegrationProvider';

const { Title, Text } = Typography;

const GherkinImporter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [directoryPath, setDirectoryPath] = useState('');
  const [modalVisible, setModalVisible] = useState(true); // Start with the modal visible
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [form] = Form.useForm();

  // Load previously saved configuration when provider is selected
  useEffect(() => {
    if (selectedProviderId) {
      const savedConfig = integrationsManager.getIntegrationConfig(selectedProviderId);
      if (savedConfig) {
        // Pre-fill the form with saved configuration
        form.setFieldsValue({
          config: savedConfig.config,
          options: savedConfig.options
        });
        message.info('Loaded saved configuration');
      }
    }
  }, [selectedProviderId, form]);

  // Handle directory selection
  const handleSelectDirectory = async () => {
    try {
      const result: Electron.OpenDialogReturnValue = await window.electron.fileSystem.selectDirectory();
      if (!result.canceled && result.filePaths) {
        const directory = result.filePaths[0];

        setDirectoryPath(directory); // Assuming the first selected directory
        // Scan for Gherkin files in the selected directory
        const files = await GherkinImportService.scanDirectory(directory);
        message.info(`Found ${files.length} Gherkin files in the selected directory.`);

        // Automatically show the integration selector after selecting a directory
        if (!selectedProviderId) {
          setModalVisible(true);
        }
      }
    } catch (error) {
      message.error('Error selecting directory');
      console.error(error);
    }
  };

  // Handle integration selection
  const handleIntegrationSelected = (providerId: string) => {
    setSelectedProviderId(providerId);
    setModalVisible(false);

    // Load existing configuration
    const savedConfig = integrationsManager.getIntegrationConfig(providerId);
    if (savedConfig) {
      form.setFieldsValue(savedConfig);
    } else {
      // Form fields could be dynamically generated based on the selected provider
      form.resetFields();
    }
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    if (!selectedProviderId || !directoryPath) {
      message.warning('Please select a directory and integration provider');
      return;
    }

    setLoading(true);
    try {
      // Get the config from form values
      const config: BaseIntegrationConfig = {
        name: 'Gherkin Import',
        description: 'Import from local directory',
        ...values.config,
      };

      // Save configuration for later use
      integrationsManager.saveIntegrationConfig(selectedProviderId, {
        config: values.config,
        options: values.options ?? {}
      });

      // Start the import process
      const result = await GherkinImportService.importWithProvider(
        selectedProviderId,
        config,
        directoryPath,
        values.options ?? {}
      );

      if (result.success) {
        message.success(result.message);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('Error during import process');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Get the selected provider to render its specific form fields
  const selectedProvider = selectedProviderId
    ? GherkinImportService.getAvailableIntegrations().find(p => p.id === selectedProviderId)
    : null;

  // Get existing configured integrations for the selected provider
  const configuredIntegrations = selectedProviderId === 'azure-devops'
    ? integrationsManager.getAzureDevOpsProjects()
    : [];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {!selectedProviderId ? (
        <Card
          title={<Title level={4} style={{ margin: 0, color: '#1890ff' }}>Select Integration Provider</Title>}
          style={{ background: '#1f1f1f', borderColor: '#303030' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 0' }}>
            <Text style={{ fontSize: 16, marginBottom: 16, color: '#d9d9d9' }}>
              Please select an integration provider to continue
            </Text>
            <Button
              type="primary"
              onClick={() => setModalVisible(true)}
              icon={<ApiOutlined />}
            >
              Select Provider
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card
            title={
              <Space>
                <ApiOutlined style={{ color: '#1890ff' }} />
                <Text strong style={{ color: '#1890ff' }}>
                  Selected Provider:
                </Text>
                <Tag color="blue">{selectedProvider?.displayName}</Tag>
              </Space>
            }
            style={{ background: '#1f1f1f', borderColor: '#303030', marginBottom: 16 }}
            extra={
              <Button
                type="primary"
                onClick={() => setModalVisible(true)}
                size="small"
              >
                Change Provider
              </Button>
            }
          >
            <div style={{ marginBottom: 16 }}>
              <Button
                icon={<FolderOpenOutlined />}
                onClick={handleSelectDirectory}
                style={{ marginRight: 16 }}
              >
                Select Directory
              </Button>
              {directoryPath && (
                <Text style={{ color: '#d9d9d9' }}>Selected: {directoryPath}</Text>
              )}
            </div>

            {selectedProviderId === 'azure-devops' && configuredIntegrations.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Text style={{ color: '#d9d9d9', display: 'block', marginBottom: 8 }}>Use existing configuration:</Text>
                <Select
                  placeholder="Select an existing configuration"
                  style={{ width: '100%' }}
                  onChange={(id: string) => {
                    const selectedConfig = configuredIntegrations.find(c => c.id === id);
                    if (selectedConfig) {
                      form.setFieldsValue({
                        config: {
                          orgName: selectedConfig.orgName,
                          projectName: selectedConfig.projectName,
                          personalAccessToken: selectedConfig.personalAccessToken
                        }
                      });
                      message.success('Loaded existing configuration');
                    }
                  }}
                >
                  {configuredIntegrations.map(config => (
                    <Select.Option key={config.id} value={config.id}>
                      {config.name} - {config.orgName}/{config.projectName}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            )}
          </Card>

          {directoryPath && selectedProvider && (
            <Card
              title={<Text strong style={{ color: '#1890ff' }}>Configure {selectedProvider.displayName}</Text>}
              style={{ background: '#1f1f1f', borderColor: '#303030', marginBottom: 16 }}
            >
              <Spin spinning={loading}>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                >
                  {/* This form would be dynamically generated based on the selected provider */}
                  {/* This is just an example for Azure DevOps */}
                  {selectedProviderId === 'azure-devops' && (
                    <>
                      <Form.Item
                        label={<Text style={{ color: '#d9d9d9' }}>Organization</Text>}
                        name={['config', 'orgName']}
                        rules={[{ required: true, message: 'Organization is required' }]}
                      >
                        <Input placeholder="Azure DevOps Organization" />
                      </Form.Item>

                      <Form.Item
                        label={<Text style={{ color: '#d9d9d9' }}>Project</Text>}
                        name={['config', 'projectName']}
                        rules={[{ required: true, message: 'Project is required' }]}
                      >
                        <Input placeholder="Azure DevOps Project" />
                      </Form.Item>

                      <Form.Item
                        label={<Text style={{ color: '#d9d9d9' }}>Personal Access Token</Text>}
                        name={['config', 'personalAccessToken']}
                        rules={[{ required: true, message: 'PAT is required' }]}
                      >
                        <Input.Password placeholder="Azure DevOps PAT" />
                      </Form.Item>

                      <Form.Item
                        label={<Text style={{ color: '#d9d9d9' }}>Test Plan Name</Text>}
                        name={['options', 'planName']}
                      >
                        <Input placeholder="Optional: Test Plan Name" />
                      </Form.Item>

                      <Form.Item
                        label={<Text style={{ color: '#d9d9d9' }}>Test Suite Name</Text>}
                        name={['options', 'suiteName']}
                      >
                        <Input placeholder="Optional: Test Suite Name" />
                      </Form.Item>
                    </>
                  )}

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} icon={<ImportOutlined />}>
                      Start Import
                    </Button>
                  </Form.Item>
                </Form>
              </Spin>
            </Card>
          )}
        </>
      )}

      <IntegrationSelectorModal
        visible={modalVisible}
        onSelect={handleIntegrationSelected}
        onCancel={() => setModalVisible(false)}
      />
    </div>
  );
};

export default GherkinImporter;
