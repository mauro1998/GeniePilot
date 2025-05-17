import React from 'react';
import { Card, Typography, Modal, Button, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Project } from '../services/models';

const { Text } = Typography;
const { confirm } = Modal;

interface ProjectCardProps {
  project: Project;
  onDelete?: (projectId: string) => void;
  showActions?: boolean;
}

export default function ProjectCard({
  project,
  onDelete,
  showActions = false,
}: ProjectCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/projects/${project.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    confirm({
      title: 'Are you sure you want to delete this project?',
      icon: <ExclamationCircleOutlined />,
      content:
        'This action will permanently delete the project and all its flows and steps.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        onDelete?.(project.id);
      },
    });
  };

  return (
    <Card
      key={project.id}
      title={project.name}
      className="bg-[#1f1f1f] hover:shadow-md cursor-pointer"
      onClick={handleCardClick}
      extra={
        showActions && onDelete ? (
          <Tooltip title="Delete project">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-gray-400 hover:text-red-500"
              onClick={handleDeleteClick}
              danger
            />
          </Tooltip>
        ) : null
      }
    >
      <Text>{project.description}</Text>
    </Card>
  );
}
