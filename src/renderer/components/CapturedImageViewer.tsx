import React from 'react';
import { Button, Modal } from 'antd';

interface CapturedImageViewerProps {
  imageData: string | null;
  onClose: () => void;
  onUse: () => void;
  onRecapture: () => void;
}

function CapturedImageViewer({
  imageData,
  onClose,
  onUse,
  onRecapture,
}: CapturedImageViewerProps) {
  if (!imageData) return null;

  return (
    <Modal
      title="Captured Screenshot"
      open={!!imageData}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="recapture" onClick={onRecapture}>
          Take New Screenshot
        </Button>,
        <Button key="use" type="primary" onClick={onUse}>
          Save & Continue
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
}

export default CapturedImageViewer;
