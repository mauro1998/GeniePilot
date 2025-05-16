import React from 'react';
import { Typography, Empty } from 'antd';

const { Title } = Typography;

export default function Settings() {
  return (
    <div className="flex flex-col">
      <Title level={2}>Settings</Title>

      <div className="flex items-center justify-center h-64">
        <Empty
          description="Settings coming soon"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    </div>
  );
}
