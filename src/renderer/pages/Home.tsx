import {
  DesktopOutlined,
  InboxOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Button, Empty, message, Typography, Upload } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CaptureScreen from '../components/CaptureScreen';
import CapturedImageViewer from '../components/CapturedImageViewer';
import ProjectCard from '../components/ProjectCard';
import { Project } from '../services/models';
import storageService from '../services/storage_service';

const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function Home() {
  const navigate = useNavigate();
  const [isCapturingModal, setIsCapturingModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Load recent projects from storage
    setRecentProjects(storageService.getRecentProjects(5));
  }, []);

  const handleUpload = (file: any) => {
    // Store the file temporarily (in a real app, you'd process this properly)
    // For now, we'll navigate to create a new project
    console.log('File selected:', file);
    navigate('/projects');
    return false; // Prevent default upload behavior
  };

  const handleImageCaptured = (imageData: string) => {
    setCapturedImage(imageData);
    setIsCapturingModal(false);
  };

  const handleUseScreenshot = () => {
    // Here you would handle the captured image (save/process it)
    message.success('Screenshot added to project');
    setCapturedImage(null);
  };

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
          beforeUpload={handleUpload}
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
            className="mr-2"
          >
            Start New Project
          </Button>
          <Button
            type="default"
            icon={<DesktopOutlined />}
            onClick={() => setIsCapturingModal(true)}
          >
            Capture Screen
          </Button>
        </div>
      </div>

      <div className="w-full max-w-3xl">
        <Title level={3}>Recent Projects</Title>

        {recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <Empty
            description="No recent projects"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>

      {/* Screen Capture Modal */}
      <CaptureScreen
        isOpen={isCapturingModal}
        onClose={() => setIsCapturingModal(false)}
        onCapture={handleImageCaptured}
      />

      {/* Display captured image if available */}
      <CapturedImageViewer
        imageData={capturedImage}
        onClose={() => setCapturedImage(null)}
        onUse={handleUseScreenshot}
        onRecapture={() => {
          setCapturedImage(null);
          setIsCapturingModal(true);
        }}
      />
    </div>
  );
}
