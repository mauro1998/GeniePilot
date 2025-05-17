import { PlusOutlined, CameraOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Divider, Empty, Typography, List, Card } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StepFormDialog from '../components/StepFormDialog';
import { Flow, Step, Project } from '../services/models';
import notificationService from '../services/notification_service';
import storageService from '../services/storage_service';

const { Title, Text, Paragraph } = Typography;

export default function FlowDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);

  // Load flow and steps data on component mount
  useEffect(() => {
    if (!id) {
      navigate('/projects');
      return;
    }

    try {
      const flows = storageService.getFlows();
      const foundFlow = flows.find((f) => f.id === id);

      if (!foundFlow) {
        navigate('/projects');
        return;
      }

      setFlow(foundFlow);

      // Also get the parent project
      const foundProject = storageService.getProject(foundFlow.projectId);
      setProject(foundProject || null);

      // Get steps for this flow
      const flowSteps = storageService.getStepsByFlow(id);
      setSteps(flowSteps);
    } catch (error) {
      notificationService.handleError(
        error,
        'Failed to load flow. Returning to projects list.',
      );
      navigate('/projects');
    }
  }, [id, navigate]);

  const handleStepCreated = (newStep: Step) => {
    setSteps([...steps, newStep]);

    // Update the flow in state to include the new step
    if (flow) {
      const updatedFlow = {
        ...flow,
        steps: [...flow.steps, newStep],
      };
      setFlow(updatedFlow);

      // Also update in storage
      storageService.updateFlow(updatedFlow);
    }
  };

  if (!flow || !project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex justify-start items-center">
        <Button
          type="link"
          onClick={() => navigate(`/projects/${project.id}`)}
          className="p-0 mb-2"
        >
          ← Back to {project.name}
        </Button>
      </div>
      <div className="flex justify-between items-center">
        <Title level={2} className="!m-0">
          {flow.name}
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsStepModalOpen(true)}
        >
          Add Step
        </Button>
      </div>

      <Divider />

      <div className="flex-1">
        {steps.length > 0 ? (
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 3,
              lg: 3,
              xl: 4,
              xxl: 4,
            }}
            dataSource={steps}
            renderItem={(step) => (
              <List.Item>
                <Card
                  hoverable
                  cover={
                    step.imageUrl ? (
                      <img
                        alt={step.name}
                        src={step.imageUrl}
                        style={{ height: 200, objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="flex flex-col items-center justify-center bg-gray-100"
                        style={{ height: 200 }}
                      >
                        <Text type="secondary">No image</Text>
                        <Text type="secondary" className="text-xs mt-1">
                          Use capture or upload options to add a screenshot
                        </Text>
                      </div>
                    )
                  }
                  actions={[
                    <Button type="text" key="capture" icon={<CameraOutlined />}>
                      Capture
                    </Button>,
                    <Button type="text" key="edit" icon={<EditOutlined />}>
                      Edit
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={step.name}
                    description={
                      step.context ? (
                        <Paragraph ellipsis={{ rows: 2 }}>
                          {step.context}
                        </Paragraph>
                      ) : (
                        <Text type="secondary">No description</Text>
                      )
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Empty
            description="No steps found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Text className="mb-4 block">
              Steps represent individual screens or actions in your flow.
            </Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsStepModalOpen(true)}
            >
              Add Your First Step
            </Button>
          </Empty>
        )}
      </div>

      <StepFormDialog
        visible={isStepModalOpen}
        flowId={flow.id}
        onClose={() => setIsStepModalOpen(false)}
        onStepCreated={handleStepCreated}
      />
    </div>
  );
}
