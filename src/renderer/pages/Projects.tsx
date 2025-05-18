import { PlusOutlined, ProjectOutlined } from '@ant-design/icons';
import { Button, Empty, Typography, Divider } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import ProjectFormDialog from '../components/ProjectFormDialog';
import { Project } from '../services/models';
import notificationService from '../services/notification_service';
import storageService from '../services/storage_service';

const { Title } = Typography;

export default function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  // Load projects on component mount
  useEffect(() => {
    setProjects(storageService.getProjects());
  }, []);

  const handleProjectCreated = (project: Project) => {
    setProjects([...projects, project]);
    navigate(`/projects/${project.id}`);
    notificationService.notify('success', 'Project created successfully');
  };

  const handleProjectDelete = (projectId: string) => {
    try {
      storageService.deleteProject(projectId);
      setProjects(projects.filter((project) => project.id !== projectId));
      notificationService.message('success', 'Project deleted successfully');
    } catch (error) {
      notificationService.handleError(error, 'Failed to delete project');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <ProjectOutlined className="text-2xl mr-2 text-blue-500" />
          <Title level={2} className="!m-0">
            Projects
          </Title>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          size="large"
        >
          Create Project
        </Button>
      </div>

      <Divider className="mt-0" />

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleProjectDelete}
              showActions
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 flex-grow flex flex-col items-center justify-center">
          <Empty
            description="No projects found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="mb-4"
          />
          <Button
            type="primary"
            onClick={() => setIsModalOpen(true)}
            icon={<PlusOutlined />}
            size="large"
          >
            Create Your First Project
          </Button>
        </div>
      )}

      <ProjectFormDialog
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
