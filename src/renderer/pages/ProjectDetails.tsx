import { PlusOutlined, ProjectOutlined } from '@ant-design/icons';
import { Button, Divider, Empty, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FlowFormDialog from '../components/FlowFormDialog';
import FlowTreeGraph from '../components/FlowTreeGraph';
import { Flow, Project } from '../services/models';
import notificationService from '../services/notification_service';
import storageService from '../services/storage_service';

const { Title, Text } = Typography;

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);

  // Load project and flows data on component mount
  useEffect(() => {
    if (!id) {
      navigate('/projects');
      return;
    }

    try {
      const foundProject = storageService.getProject(id);
      if (!foundProject) {
        navigate('/projects');
        return;
      }

      setProject(foundProject);
      const projectFlows = storageService.getFlowsByProject(id);
      setFlows(projectFlows);

      // Select the first flow by default if available
      if (projectFlows.length > 0 && !selectedFlowId) {
        setSelectedFlowId(projectFlows[0].id);
      }
    } catch (error) {
      notificationService.handleError(
        error,
        'Failed to load project. Returning to projects list.',
      );
      navigate('/projects');
    }
  }, [id, navigate, selectedFlowId]);

  const handleFlowCreated = (newFlow: Flow) => {
    setFlows([...flows, newFlow]);
    setSelectedFlowId(newFlow.id);
    navigate(`/flows/${newFlow.id}`);
    notificationService.notify('success', 'Flow created successfully');
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <ProjectOutlined className="text-2xl mr-2 text-blue-500" />
          <Title level={2} className="!m-0">
            {project.name} — Project
          </Title>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsFlowModalOpen(true)}
        >
          Add Flow
        </Button>
      </div>

      <Divider />

      <div className="flex-1">
        {flows.length > 0 ? (
          <FlowTreeGraph project={project} flows={flows} />
        ) : (
          <Empty
            description="No flows found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Text className="mb-4 block">
              Flows represent user journeys through your application.
            </Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsFlowModalOpen(true)}
            >
              Add Your First Flow
            </Button>
          </Empty>
        )}
      </div>

      <FlowFormDialog
        visible={isFlowModalOpen}
        projectId={project.id}
        onClose={() => setIsFlowModalOpen(false)}
        onFlowCreated={handleFlowCreated}
      />
    </div>
  );
}
