import React from 'react';
import { Typography, Empty } from 'antd';

const { Title } = Typography;

export default function Integrations() {
  return (
    <div className="flex flex-col">
      <Title level={2}>Integrations</Title>

      <div className="flex items-center justify-center h-64">
        <Empty
          description="Integrations coming soon"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    </div>
  );
}
