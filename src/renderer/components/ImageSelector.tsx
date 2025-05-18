import {
  CameraOutlined,
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { Button, Space, Tooltip, Typography, Upload } from 'antd';
import { UploadRef } from 'antd/es/upload/Upload';
import React, { useRef, useState } from 'react';
import CaptureScreen from './CaptureScreen';
import { base64ToFile } from '../services/util';

const { Text } = Typography;
const { Dragger } = Upload;

interface ImageSelectorProps {
  imageUrl?: string;
  onUpload: (file: File) => void;
  onClear: () => void;
}

export default function ImageSelector({
  imageUrl,
  onUpload,
  onClear,
}: ImageSelectorProps) {
  const [isCapturingModalOpen, setIsCapturingModalOpen] = useState(false);
  const uploadRef = useRef<UploadRef>(null);

  const handleImageCaptured = (base64ImageData: string) => {
    const file = base64ToFile(base64ImageData, 'screenshot.png', 'image/png');
    onUpload(file);
    setIsCapturingModalOpen(false);
  };

  const handleDragUpload = (file: File) => {
    onUpload(file);
    return false; // Prevent default upload behavior
  };

  // When we have an image, show the preview with action buttons
  if (imageUrl) {
    return (
      <div className="relative border border-gray-300 rounded-md overflow-hidden">
        <img
          src={imageUrl}
          alt="Preview"
          className="w-full h-auto max-h-[250px] object-contain"
        />
        <div className="absolute bottom-0 right-0 bg-black bg-opacity-60 p-2 rounded-tl-md">
          <Space>
            <Tooltip title="Capture screen">
              <Button
                type="text"
                icon={<CameraOutlined />}
                onClick={() => setIsCapturingModalOpen(true)}
                className="text-white hover:text-blue-300"
              />
            </Tooltip>
            <Tooltip title="Upload from device">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => {
                  console.log(uploadRef.current);
                  uploadRef.current?.nativeElement
                    ?.querySelector('input')
                    ?.click();
                }}
                className="text-white hover:text-blue-300"
              />
            </Tooltip>
            <Tooltip title="Remove image">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={onClear}
                className="text-white hover:text-red-300"
              />
            </Tooltip>
          </Space>
          <Upload
            ref={uploadRef}
            id="image-upload"
            showUploadList={false}
            beforeUpload={handleDragUpload}
            className="hidden"
          />
          <CaptureScreen
            isOpen={isCapturingModalOpen}
            onClose={() => setIsCapturingModalOpen(false)}
            onCapture={handleImageCaptured}
          />
        </div>
      </div>
    );
  }

  // When no image is selected, show the upload/capture options
  return (
    <div className="flex flex-col gap-4">
      <Tooltip title="Take a screenshot of the current screen">
        <Button
          type="primary"
          icon={<CameraOutlined />}
          onClick={() => setIsCapturingModalOpen(true)}
          className="w-full py-6 flex items-center justify-center text-lg"
        >
          Capture Screen
        </Button>
      </Tooltip>

      <div className="text-center">
        <Text type="secondary">or</Text>
      </div>

      <Dragger
        name="image"
        accept=".png,.jpg,.jpeg"
        showUploadList={false}
        beforeUpload={handleDragUpload}
        className="p-5 h-[200px]"
      >
        <p className="text-3xl">
          <InboxOutlined />
        </p>
        <p className="text-base mt-2">
          Click or drag an image to this area to upload
        </p>
        <p className="text-xs text-gray-500">
          Supported formats: PNG, JPG, JPEG (max 5MB)
        </p>
      </Dragger>

      <CaptureScreen
        isOpen={isCapturingModalOpen}
        onClose={() => setIsCapturingModalOpen(false)}
        onCapture={handleImageCaptured}
      />
    </div>
  );
}
