import React from 'react';
import { Card, Typography, Modal, Button, Tooltip, Space, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Project } from '../services/models';
import storageService from '../services/storage_service';

const { Text, Title } = Typography;
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
  const flowCount = storageService.getFlowsByProject(project.id).length;

  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
      className="bg-[#1f1f1f] hover:shadow-lg cursor-pointer transition-all duration-300 border border-gray-800 hover:border-blue-700"
      onClick={handleCardClick}
    >
      <div className="flex flex-col h-full">
        <div className="mb-2 flex justify-between items-start">
          <div>
            <Title level={4} className="!mb-0">
              {project.name}
            </Title>
            <div className="flex items-center text-xs text-gray-400 mt-1">
              <CalendarOutlined className="mr-1" />
              <span>Created {formatDate(project.createdAt)}</span>
            </div>
          </div>

          {showActions && onDelete && (
            <Tooltip title="Delete project">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                className="text-gray-400 hover:text-red-500"
                onClick={handleDeleteClick}
                danger
                size="small"
              />
            </Tooltip>
          )}
        </div>

        <Text className="text-gray-300 mb-4 flex-grow">
          {project.description || 'No description provided'}
        </Text>

        <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-800">
          <Space>
            <Tag color="blue">
              {flowCount} {flowCount === 1 ? 'Flow' : 'Flows'}
            </Tag>
          </Space>
          <RightOutlined className="text-gray-400" />
        </div>
      </div>
    </Card>
  );
}
