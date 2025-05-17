import React from 'react';
import { Typography, Button, Modal, message } from 'antd';

interface CapturedImageViewerProps {
  imageData: string | null;
  onClose: () => void;
  onUse: () => void;
}

const CapturedImageViewer: React.FC<CapturedImageViewerProps> = ({
  imageData,
  onClose,
  onUse
}) => {
  if (!imageData) return null;

  return (
    <Modal
      title="Captured Screenshot"
      open={!!imageData}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button
          key="use"
          type="primary"
          onClick={onUse}
        >
          Use Screenshot
        </Button>,
      ]}
      width={800}
    >
      <div className="text-center">
        <img
          src={imageData}
          alt="Captured Screenshot"
          style={{ maxWidth: '100%', maxHeight: '60vh' }}
          className="border border-gray-700 rounded"
        />
      </div>
    </Modal>
  );
};

export default CapturedImageViewer;
