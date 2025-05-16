import React, { useState } from 'react';
import { Typography, Button, Card, Empty, Modal, Form, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface Project {
  id: string;
  name: string;
  description: string;
}

export default function Projects() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Mock data - in a real app, this would come from a store or API
  const [projects, setProjects] = useState<Project[]>([
    // Uncomment for mock data
    { id: '1', name: 'Project 1', description: 'Description for Project 1' },
    { id: '2', name: 'Project 2', description: 'Description for Project 2' },
  ]);

  const handleCreateProject = async () => {
    try {
      const values = await form.validateFields();
      const newProject: Project = {
        id: Date.now().toString(), // Simple ID generation
        name: values.name,
        description: values.description || '',
      };

      setProjects([...projects, newProject]);
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <Title level={2}>Projects</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Create Project
        </Button>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
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
        <div className="text-center py-16">
          <Empty
            description="No projects found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => setIsModalOpen(true)}>
              Create Your First Project
            </Button>
          </Empty>
        </div>
      )}

      <Modal
        title="Create New Project"
        open={isModalOpen}
        onOk={handleCreateProject}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
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
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
