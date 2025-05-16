import React from 'react';
import { Typography, Button, Upload, Card, Empty } from 'antd';
import { PlusCircleOutlined, InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function Home() {
  const navigate = useNavigate();

  // Mock data for recent projects - in a real app, this would come from a store or API
  const recentProjects: any[] = [
    // Uncomment and modify if you want to show mock data
    // { id: '1', name: 'Project 1', description: 'Description for Project 1' },
    // { id: '2', name: 'Project 2', description: 'Description for Project 2' },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <Title>Welcome to GeniePilot</Title>
        <div className="w-[520px]">
          <Text className="text-lg">
            Transform your apps into testable flows in minutes. Simply upload
            screenshots and let GeniePilot create intelligent test scenarios
            powered by AI.
          </Text>
        </div>
      </div>

      <div className="w-full max-w-3xl mb-12">
        <Dragger
          accept=".png,.jpg,.jpeg"
          showUploadList={false}
          beforeUpload={() => false} // Prevent auto upload
          className="p-8 bg-[#141414] my-4"
        >
          <p className="text-6xl">
            <InboxOutlined />
          </p>
          <p className="text-lg mt-4">
            Click or drag an image to this area to upload
          </p>
          <p className="text-gray-400">Support for PNG, JPG</p>
        </Dragger>

        <div className="text-center mt-4">
          <Text className="mr-2">or</Text>
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => navigate('/projects')}
          >
            Start New Project
          </Button>
        </div>
      </div>

      <div className="w-full max-w-3xl">
        <Title level={3}>Recent Projects</Title>

        {recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentProjects.map((project) => (
              <Card
                key={project.id}
                className="bg-[#1f1f1f] hover:shadow-md cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <Title level={4}>{project.name}</Title>
                <Text>{project.description}</Text>
              </Card>
            ))}
          </div>
        ) : (
          <Empty
            description="No recent projects"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>
    </div>
  );
}
