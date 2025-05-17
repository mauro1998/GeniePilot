import React from 'react';
import { Modal, Form, Input, Upload, Button, Typography } from 'antd';
import { CameraOutlined, InboxOutlined } from '@ant-design/icons';
import { Step } from '../services/models';
import notificationService from '../services/notification_service';
import storageService from '../services/storage_service';

const { Text } = Typography;
const { Dragger } = Upload;

interface StepFormDialogProps {
  visible: boolean;
  flowId: string;
  onClose: () => void;
  onStepCreated: (step: Step) => void;
}

export default function StepFormDialog({
  visible,
  flowId,
  onClose,
  onStepCreated,
}: StepFormDialogProps) {
  const [form] = Form.useForm();

  const handleCreateStep = async () => {
    try {
      const values = await form.validateFields();
      const newStep = storageService.saveStep({
        name: values.name,
        flowId,
        context: values.context,
        // Image handling would be implemented here
      });

      onStepCreated(newStep);
      form.resetFields();
      onClose();
    } catch (error) {
      notificationService.handleError(
        error,
        'Failed to create step. Please try again.',
      );
    }
  };

  const handleScreenCapture = () => {
    // Empty handler for now - will be implemented later
    console.log('Screen capture requested');
  };

  const handleDragUpload = (file: any) => {
    console.log('File uploaded via drag and drop:', file);
    return false; // Prevent default upload behavior
  };

  return (
    <Modal
      title="Add New Step"
      open={visible}
      onOk={handleCreateStep}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      okText="Create"
      width={600}
    >
      <Form form={form} layout="vertical" name="step_form">
        <Form.Item
          name="name"
          label="Step Name"
          rules={[{ required: true, message: 'Please enter a step name' }]}
        >
          <Input placeholder="e.g., Login Screen, Add to Cart" />
        </Form.Item>

        <Form.Item name="context" label="Step Context">
          <Input.TextArea
            placeholder="Additional details about this step..."
            rows={3}
          />
        </Form.Item>

        <Form.Item label="Screenshot or Image" required>
          <div className="flex flex-col gap-4">
            <Button
              type="primary"
              icon={<CameraOutlined />}
              onClick={handleScreenCapture}
              className="w-full py-6 flex items-center justify-center text-lg"
            >
              Capture Screen
            </Button>

            <div className="text-center">
              <Text type="secondary">or</Text>
            </div>

            <Dragger
              name="image"
              accept=".png,.jpg,.jpeg"
              showUploadList={false}
              beforeUpload={handleDragUpload}
              className="p-5"
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
        </Form.Item>
      </Form>
    </Modal>
  );
}
