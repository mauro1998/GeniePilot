import React from 'react';
import { Button, Upload, Typography, Space, Tooltip } from 'antd';
import {
  CameraOutlined,
  InboxOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';

const { Text } = Typography;
const { Dragger } = Upload;

interface ImageSelectorProps {
  imageUrl?: string;
  onCapture: () => void;
  onUpload: (file: File) => void;
  onClear: () => void;
}

export default function ImageSelector({
  imageUrl,
  onCapture,
  onUpload,
  onClear,
}: ImageSelectorProps) {
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
                onClick={onCapture}
                className="text-white hover:text-blue-300"
              />
            </Tooltip>
            <Tooltip title="Upload from device">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => document.getElementById('image-upload')?.click()}
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
            id="image-upload"
            showUploadList={false}
            beforeUpload={handleDragUpload}
            className="hidden"
          >
            <span />
          </Upload>
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
          onClick={onCapture}
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
    </div>
  );
}
