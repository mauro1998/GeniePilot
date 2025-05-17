import React, { useState } from 'react';
import { Typography, Button, Upload, Card, Empty, Modal, Select, message, Spin } from 'antd';
import { PlusCircleOutlined, InboxOutlined, DesktopOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { Option } = Select;

export default function Home() {
  const navigate = useNavigate();
  const [isCapturingModal, setIsCapturingModal] = useState(false);
  const [captureSources, setCaptureSources] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Mock data for recent projects - in a real app, this would come from a store or API
  const recentProjects: any[] = [
    // Uncomment and modify if you want to show mock data
    // { id: '1', name: 'Project 1', description: 'Description for Project 1' },
    // { id: '2', name: 'Project 2', description: 'Description for Project 2' },
  ];

  // Screen capture methods
  const openCaptureModal = async () => {
    setIsCapturingModal(true);
    setIsLoading(true);
    try {
      const sources = await window.electron.screenCapturer.getSources();
      setCaptureSources(sources);
      if (sources.length > 0) {
        setSelectedSource(sources[0].id);
      }
    } catch (error) {
      console.error('Error fetching capture sources:', error);
      message.error('Failed to load capture sources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCapture = async () => {
    if (!selectedSource) {
      message.warning('Please select a source to capture');
      return;
    }

    setIsLoading(true);
    try {
      // The IPC call is now available but not fully implemented on the main process side
      await window.electron.screenCapturer.captureScreenshot(selectedSource);
      message.info('Screen capture via IPC will be fully implemented in the future.');
      setIsCapturingModal(false);

      // When fully implemented, we would do:
      // const result = await window.electron.screenCapturer.captureScreenshot(selectedSource);
      // if (result.success) {
      //   setCapturedImage(result.data);
      //   message.success('Screenshot captured successfully');
      // } else {
      //   message.warning(result.message || 'Failed to capture screenshot');
      // }
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      message.error('Failed to capture screenshot');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelCapture = () => {
    setIsCapturingModal(false);
    setSelectedSource(null);
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
            className="mr-2"
          >
            Start New Project
          </Button>
          <Button
            type="default"
            icon={<DesktopOutlined />}
            onClick={openCaptureModal}
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

      {/* Screen Capture Modal */}
      <Modal
        title="Capture Screen or Window"
        open={isCapturingModal}
        onCancel={cancelCapture}
        footer={[
          <Button key="cancel" onClick={cancelCapture}>
            Cancel
          </Button>,
          <Button
            key="capture"
            type="primary"
            onClick={handleCapture}
            loading={isLoading}
            disabled={!selectedSource}
          >
            Capture
          </Button>,
        ]}
        width={600}
      >
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spin size="large" />
            <span className="ml-3">Loading sources...</span>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <Text>Select what you want to capture:</Text>
              <Select
                style={{ width: '100%' }}
                value={selectedSource ?? undefined}
                onChange={(value) => setSelectedSource(value)}
                placeholder="Select a source"
                className="mt-2"
              >
                <Option value="" disabled>
                  Select a source
                </Option>
                <Select.OptGroup label="Screens">
                  {captureSources
                    .filter((source) => source.type === 'screen')
                    .map((source) => (
                      <Option key={source.id} value={source.id}>
                        <DesktopOutlined className="mr-2" />
                        {source.name}
                      </Option>
                    ))}
                </Select.OptGroup>
                <Select.OptGroup label="Windows">
                  {captureSources
                    .filter((source) => source.type === 'window')
                    .map((source) => (
                      <Option key={source.id} value={source.id}>
                        <AppstoreOutlined className="mr-2" />
                        {source.name}
                      </Option>
                    ))}
                </Select.OptGroup>
              </Select>
            </div>
            <div className="text-gray-400 text-sm">
              <p>
                <strong>Note:</strong> After capturing, the screenshot will be
                loaded into your project workspace.
              </p>
            </div>
          </>
        )}
      </Modal>

      {/* Display captured image if available */}
      {capturedImage && (
        <Modal
          title="Captured Screenshot"
          open={!!capturedImage}
          onCancel={() => setCapturedImage(null)}
          footer={[
            <Button key="close" onClick={() => setCapturedImage(null)}>
              Close
            </Button>,
            <Button
              key="use"
              type="primary"
              onClick={() => {
                // Here you would handle the captured image (save/process it)
                message.success('Screenshot added to project');
                setCapturedImage(null);
              }}
            >
              Use Screenshot
            </Button>,
          ]}
          width={800}
        >
          <div className="text-center">
            <img
              src={capturedImage}
              alt="Captured Screenshot"
              style={{ maxWidth: '100%', maxHeight: '60vh' }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
