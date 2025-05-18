import { BranchesOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Empty, Tabs, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StepTimeline from '../components/StepTimeline';
import TestSuiteContent from '../components/TestSuiteContent';
import { Flow, Step, Project } from '../services/models';
import notificationService from '../services/notification_service';
import storageService from '../services/storage_service';
import testSuiteService, {
  TestSuiteState,
} from '../services/test_suite_service';

const { Title, Text } = Typography;

export default function FlowDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [activeTab, setActiveTab] = useState<string>('steps');
  const [generationState, setGenerationState] =
    useState<TestSuiteState>('idle');

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

      // Get the current generation state
      if (id) {
        setGenerationState(testSuiteService.getState(id));
      }
    } catch (error) {
      notificationService.handleError(
        error,
        'Failed to load flow. Returning to projects list.',
      );
      navigate('/projects');
    }
  }, [id, navigate]);

  // Listen for test suite generation state changes
  useEffect(() => {
    if (!id) return;

    const handleStateChange = (flowId: string, state: TestSuiteState) => {
      if (flowId === id) {
        setGenerationState(state);

        // Automatically switch to the test suite tab when generation completes
        if (state === 'completed' && activeTab !== 'testSuite') {
          setActiveTab('testSuite');
        }
      }
    };

    testSuiteService.on('stateChange', handleStateChange);

    return () => {
      testSuiteService.removeListener('stateChange', handleStateChange);
    };
  }, [id, activeTab]);

  const goToStepCreation = () => {
    if (flow) {
      navigate(`/flows/${flow.id}/steps/configure`);
    }
  };

  const handleGenerateTestSuite = () => {
    if (flow && id) {
      testSuiteService.generateTestSuite(id);
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
            disabled={steps.length === 0 || generationState === 'generating'}
            loading={generationState === 'generating'}
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

      {!steps.length && <Divider />}

      <div className="flex-1 relative flow-details-tabs">
        {steps.length > 0 ? (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'steps',
                label: 'Steps',
                children: (
                  <div className="absolute inset-0 overflow-y-auto">
                    <StepTimeline steps={steps} readOnly />
                  </div>
                ),
              },
              {
                key: 'testSuite',
                label: 'Test Suite',
                children: (
                  <div className="absolute inset-0 overflow-y-auto">
                    <TestSuiteContent
                      flowId={id || ''}
                      onGenerateClick={handleGenerateTestSuite}
                    />
                  </div>
                ),
              },
            ]}
          />
        ) : (
          <div className="absolute inset-0 overflow-y-auto">
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
          </div>
        )}
      </div>
    </div>
  );
}
