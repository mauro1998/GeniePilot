import React, { useState, useEffect } from 'react';
import { Typography, Button, Modal, message, Spin } from 'antd';
import SourceSection from './SourceSection';

const { Text } = Typography;

interface CaptureScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string, sourceName: string) => void;
}

interface Source {
  id: string;
  name: string;
  thumbnailDataUrl?: string;
  appIconDataUrl?: string;
  type: 'screen' | 'window';
}

const CaptureScreen: React.FC<CaptureScreenProps> = ({ isOpen, onClose, onCapture }) => {
  const [captureSources, setCaptureSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCaptureSources();
    }
  }, [isOpen]);

  const loadCaptureSources = async () => {
    setIsLoading(true);
    try {
      const sources = await window.electron.screenCapturer.getSources();
      console.log('Capture sources:', sources);

      // Check if thumbnails are present
      if (sources.length > 0) {
        console.log('First source thumbnail:',
          sources[0].thumbnailDataUrl ?
          `Present (${sources[0].thumbnailDataUrl.substring(0, 30)}...)` :
          'Missing'
        );
      }

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
      // Call the IPC method to capture the screenshot
      const result = await window.electron.screenCapturer.captureScreenshot(selectedSource);
      console.log('Capture result:', result);

      if (result.success) {
        onCapture(result.data, result.name);
        message.success(`Screenshot of "${result.name}" captured successfully`);
      } else {
        message.error(result.message ?? 'Failed to capture screenshot');
      }
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      message.error('Failed to capture screenshot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedSource(null);
    onClose();
  };

  return (
    <Modal
      title="Capture Screen or Window"
      open={isOpen}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
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
            <Text className="text-lg mb-3 block">Select what you want to capture:</Text>

            <SourceSection
              title="Screens"
              sources={captureSources}
              selectedSourceId={selectedSource}
              onSourceSelect={setSelectedSource}
              sourceType="screen"
            />

            <SourceSection
              title="Windows"
              sources={captureSources}
              selectedSourceId={selectedSource}
              onSourceSelect={setSelectedSource}
              sourceType="window"
            />
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
  );
};

export default CaptureScreen;
