import { PlusOutlined } from '@ant-design/icons';
import { Button, Empty, Typography } from 'antd';
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
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleProjectDelete}
              showActions
            />
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

      <ProjectFormDialog
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
