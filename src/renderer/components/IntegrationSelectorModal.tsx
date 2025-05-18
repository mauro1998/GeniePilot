import React, { useState } from 'react';
import { Button, Modal, List, Card, Typography, Space, Avatar } from 'antd';
import { IntegrationProvider } from '../integrations/IntegrationProvider';
import integrationRegistry from '../integrations/IntegrationRegistry';

const { Title, Paragraph } = Typography;

interface IntegrationSelectorModalProps {
  visible: boolean;
  onSelect: (providerId: string) => void;
  onCancel: () => void;
}

const IntegrationSelectorModal: React.FC<IntegrationSelectorModalProps> = ({
  visible,
  onSelect,
  onCancel
}) => {
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const providers = integrationRegistry.getAllProviders();

  const handleSelect = () => {
    if (selectedProviderId) {
      onSelect(selectedProviderId);
    }
  };

  return (
    <Modal
      title="Select Integration Provider"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="select"
          type="primary"
          disabled={!selectedProviderId}
          onClick={handleSelect}
        >
          Continue
        </Button>
      ]}
      width={600}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Paragraph>
          Select the integration provider you want to use for importing your Gherkin files:
        </Paragraph>

        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={providers}
          renderItem={(provider: IntegrationProvider<any, any>) => (
            <List.Item>
              <Card
                hoverable
                style={{
                  borderColor: selectedProviderId === provider.id ? '#1890ff' : undefined,
                  backgroundColor: selectedProviderId === provider.id ? '#1e3a57' : undefined,
                  borderWidth: selectedProviderId === provider.id ? '2px' : '1px'
                }}
                onClick={() => setSelectedProviderId(provider.id)}
              >
                <Card.Meta
                  avatar={provider.iconUrl && <Avatar src={provider.iconUrl} size="large" />}
                  title={<span style={{ color: selectedProviderId === provider.id ? '#1890ff' : undefined }}>{provider.displayName}</span>}
                  description={<span style={{ color: selectedProviderId === provider.id ? '#d9d9d9' : undefined }}>{provider.description}</span>}
                />
              </Card>
            </List.Item>
          )}
        />
      </Space>
    </Modal>
  );
};

export default IntegrationSelectorModal;
