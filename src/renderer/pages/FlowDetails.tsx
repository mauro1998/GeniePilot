import { BranchesOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Empty, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StepTimeline from '../components/StepTimeline';
import { Flow, Step, Project } from '../services/models';
import notificationService from '../services/notification_service';
import storageService from '../services/storage_service';
import { HttpFileService } from '../services/HttpFileService';
const { Title, Text } = Typography;

export default function FlowDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);

  const handleGenerateTestSuite = async () => {
    const fileService = new HttpFileService('https://cf67-134-238-186-21.ngrok-free.app');
    try {
      for (const step of steps) {
        if (!step.imageUrl) {
          throw new Error('Step image URL is missing');
        }
        const blob = await fetch(new URL(step.imageUrl)).then((r) => r.blob());
        const fileUrl = await fileService.uploadFile(blob, step.id);
        console.log(`Uploaded file for step ${step.id}, URL: ${fileUrl}`);
      }
    } catch (error) {
      console.error('Error during test suite generation:', error);
      notificationService.notify('error', 'Test suite generation failed', {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const testConnection = async () => {
    try {
      const fileService = new HttpFileService('https://cf67-134-238-186-21.ngrok-free.app');
      const url = await fileService.testConnection();
      notificationService.notify('success', 'Connection test successful', {
        description: `File uploaded to: ${url}`
      });
    } catch (error) {
      notificationService.notify('error', 'Connection test failed', {
        description: error instanceof Error ? error.message : String(error)
      });
    }
  };

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

  const goToStepCreation = () => {
    if (flow) {
      navigate(`/flows/${flow.id}/steps/create`);
    }
  };

  if (!flow || !project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <BranchesOutlined className="text-2xl mr-2 text-green-500" />
          <Title level={2} className="!m-0">
            {flow.name} — Flow
          </Title>
        </div>
        <div className="flex space-x-3">
          {steps.length > 0 && (
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={goToStepCreation}
            >
              Configure Steps
            </Button>
          )}
          <Button
            type="primary"
            onClick={handleGenerateTestSuite}
            disabled={steps.length === 0}
          >
            Generate Test Suite
          </Button>
        </div>
      </div>

      <div className="flex justify-start items-center">
        <Button
          type="link"
          onClick={() => navigate(`/projects/${project.id}`)}
          className="p-0"
        >
          ← Back to project {project.name}
        </Button>
      </div>

      <Divider />

      <div className="flex-1 relative">
        <div className="absolute inset-0 overflow-y-auto">
          {steps.length > 0 ? (
            <StepTimeline steps={steps} readOnly />
          ) : (
            <Empty
              description="No steps found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Text className="mb-4 block">
                Steps represent individual screens or actions in your flow.
                <br />
                Configure steps before generating a test suite.
              </Text>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={goToStepCreation}
              >
                Add Your First Step
              </Button>
            </Empty>
          )}
        </div>
      </div>
    </div>
  );
}
