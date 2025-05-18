import React from 'react';
import { Modal, Form, Input } from 'antd';
import { Flow } from '../services/models';
import notificationService from '../services/notification_service';
import storageService from '../services/storage_service';

interface FlowFormDialogProps {
  visible: boolean;
  projectId: string;
  onClose: () => void;
  onFlowCreated: (flow: Flow) => void;
}

export default function FlowFormDialog({
  visible,
  projectId,
  onClose,
  onFlowCreated,
}: FlowFormDialogProps) {
  const [form] = Form.useForm();

  const handleCreateFlow = async () => {
    try {
      const values = await form.validateFields();
      const newFlow = storageService.saveFlow({
        name: values.name,
        projectId,
      });

      onFlowCreated(newFlow);
      form.resetFields();
      onClose();
    } catch (error) {
      notificationService.handleError(
        error,
        'Failed to create flow. Please try again.',
      );
    }
  };

  return (
    <Modal
      title="Add New Flow"
      open={visible}
      onOk={handleCreateFlow}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      okText="Create"
    >
      <Form form={form} layout="vertical" name="flow_form">
        <Form.Item
          name="name"
          label="Flow Name"
          rules={[{ required: true, message: 'Please enter a flow name' }]}
        >
          <Input placeholder="e.g., Login Flow, Checkout Process" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
