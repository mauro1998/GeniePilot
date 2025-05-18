import React, { useEffect, useState } from 'react';
import { Typography, Form, Input, Button, Card, Space, message } from 'antd';
import configurationService, { ServerConfig } from '../services/configuration_service';

const { Title } = Typography;

export default function Settings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load current configuration
    const config = configurationService.getConfig();
    form.setFieldsValue(config);
  }, [form]);

  const handleSave = async (values: ServerConfig) => {
    setLoading(true);
    try {
      configurationService.saveConfig(values);
      message.success('Server configuration saved successfully');
    } catch (error) {
      console.error('Error saving configuration:', error);
      message.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    configurationService.resetConfig();
    form.setFieldsValue(configurationService.getConfig());
    message.info('Configuration reset to defaults');
  };

  return (
    <div className="flex flex-col">
      <Title level={2}>Settings</Title>

      <Card title="Server Configuration" className="mb-4">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={configurationService.getConfig()}
        >
          <Form.Item
            label="File Server URL"
            name="fileServerUrl"
            rules={[
              { required: true, message: 'Please enter the file server URL' },
            ]}
            help="The URL for the file server API (e.g., http://localhost:5000)"
          >
            <Input placeholder="https://file-server.localhost:3000" />
          </Form.Item>

          <Form.Item
            label="Agent Server URL"
            name="agentServerUrl"
            rules={[
              { required: true, message: 'Please enter the agent server URL' },
              { type: 'url', message: 'Please enter a valid URL' },
            ]}
            help="The URL for the agent server API (e.g., http://localhost:3001)"
          >
            <Input placeholder="https://agents.localhost:3000" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Save Configuration
              </Button>
              <Button onClick={handleReset}>
                Reset to Defaults
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
