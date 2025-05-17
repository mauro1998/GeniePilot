import React from 'react';
import { Modal, Form, Input } from 'antd';
import { Project } from '../services/models';
import storageService from '../services/storage_service';
import notificationService from '../services/notification_service';

interface ProjectFormProps {
  visible: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export default function ProjectFormDialog({
  visible,
  onClose,
  onProjectCreated,
}: ProjectFormProps) {
  const [form] = Form.useForm();

  const handleCreateProject = async () => {
    try {
      const values = await form.validateFields();
      const newProject = storageService.saveProject({
        name: values.name,
        description: values.description || '',
      });

      onProjectCreated(newProject);
      form.resetFields();
      onClose();
    } catch (error) {
      notificationService.handleError(
        error,
        'Failed to create project. Please try again.',
      );
    }
  };

  return (
    <Modal
      title="Create New Project"
      open={visible}
      onOk={handleCreateProject}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      okText="Create"
    >
      <Form form={form} layout="vertical" name="project_form">
        <Form.Item
          name="name"
          label="Project Name"
          rules={[{ required: true, message: 'Please enter a project name' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea
            rows={4}
            placeholder="Describe your project to help AI generate better results (optional)"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
