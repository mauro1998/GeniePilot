import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Button, Typography, Form, Input, Card, Divider, Empty } from 'antd';
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Flow, Step, Project } from '../services/models';
import ImageSelector from '../components/ImageSelector';
import StepTimeline from '../components/StepTimeline';
import notificationService from '../services/notification_service';
import storageService from '../services/storage_service';

const { Title, Text } = Typography;

export default function StepCreation() {
  const { flowId } = useParams<{ flowId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState<Partial<Step>>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);

  const refreshSteps = useCallback(() => {
    if (!flowId) return;
    const flowSteps = storageService.getStepsByFlow(flowId);
    setSteps(flowSteps);
  }, [flowId]);

  // Load flow data on component mount
  useEffect(() => {
    if (!flowId) {
      navigate('/projects');
      return;
    }

    try {
      const flows = storageService.getFlows();
      const foundFlow = flows.find((f) => f.id === flowId);

      if (!foundFlow) {
        navigate('/projects');
        return;
      }

      setFlow(foundFlow);

      // Also get the parent project
      const foundProject = storageService.getProject(foundFlow.projectId);
      setProject(foundProject || null);

      // Get existing steps
      refreshSteps();
    } catch (error) {
      notificationService.handleError(
        error,
        'Failed to load flow. Returning to projects list.',
      );
      navigate('/projects');
    }
  }, [flowId, navigate, refreshSteps]);

  const handleAddStep = async () => {
    try {
      if (!flow) return;

      // Validate form
      const values = await form.validateFields();

      if (isEditing && editingStepId) {
        // Update existing step
        const stepToUpdate = steps.find((s) => s.id === editingStepId);
        if (!stepToUpdate) return;

        const updatedStep = {
          ...stepToUpdate,
          context: values.context || '',
          imageUrl: currentStep.imageUrl,
        };

        // Update step in storage
        storageService.updateStep(updatedStep);

        // Update flow with modified step
        const updatedFlowSteps = flow.steps.map((s) =>
          s.id === editingStepId ? updatedStep : s,
        );

        const updatedFlow = {
          ...flow,
          steps: updatedFlowSteps,
        };

        storageService.updateFlow(updatedFlow);
        setFlow(updatedFlow);

        // Reset editing state
        setIsEditing(false);
        setEditingStepId(null);

        notificationService.notify('success', 'Step updated successfully');
      } else {
        // Create new step
        // Generate a name based on step index
        const stepNumber = steps.length + 1;
        let generatedName = `Step ${stepNumber}`;

        // Append preview of context if available
        if (values.context) {
          const contextPreview = values.context
            .split(' ')
            .slice(0, 3)
            .join(' ');
          if (contextPreview) {
            generatedName += `: ${contextPreview}`;
          }
        }

        // Create step directly in storage
        const newStep = storageService.saveStep({
          name: generatedName,
          flowId: flow.id,
          context: values.context || '',
          imageUrl: currentStep.imageUrl,
        });

        // Update flow with new step
        const updatedFlow = {
          ...flow,
          steps: [...flow.steps, newStep],
        };
        storageService.updateFlow(updatedFlow);
        setFlow(updatedFlow);

        notificationService.notify('success', 'Step added successfully');
      }

      // Refresh steps list
      refreshSteps();

      // Reset form and current step
      form.resetFields();
      setCurrentStep({});

      // Scroll to the bottom of the steps panel to show the newly added step
      setTimeout(() => {
        const stepsContainer = document.querySelector(
          '.right-panel .absolute.inset-0.overflow-y-auto',
        );
        if (stepsContainer) {
          stepsContainer.scrollTop = stepsContainer.scrollHeight;
        }
      }, 100);
    } catch (error) {
      notificationService.handleError(
        error,
        'Failed to save step. Please check the form.',
      );
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingStepId(null);
    setCurrentStep({});
    form.resetFields();
    notificationService.notify('info', 'Edit cancelled');
  };

  const handleImageUpload = (file: File) => {
    // In a real implementation, we would handle the file upload properly
    const fakeImageUrl = URL.createObjectURL(file);
    setCurrentStep({
      ...currentStep,
      imageUrl: fakeImageUrl,
    });
    return false; // Prevent default upload behavior
  };

  const handleClearImage = () => {
    setCurrentStep({
      ...currentStep,
      imageUrl: undefined,
    });
  };

  const handleRemoveStep = (stepId: string) => {
    if (!flow) return;

    try {
      // Remove step from storage
      storageService.deleteStep(stepId);

      // Update flow
      const updatedFlow = {
        ...flow,
        steps: flow.steps.filter((s) => s.id !== stepId),
      };
      storageService.updateFlow(updatedFlow);
      setFlow(updatedFlow);

      // Refresh steps list
      refreshSteps();

      notificationService.notify('success', 'Step removed successfully');
    } catch (error) {
      notificationService.handleError(error, 'Failed to remove step.');
    }
  };

  const handleDone = () => {
    if (flow) {
      navigate(`/flows/${flow.id}`);
    }
  };

  if (!flow || !project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex justify-start items-center">
        <Button type="link" onClick={handleDone} className="p-0 mb-2">
          <ArrowLeftOutlined /> Back to {flow.name}
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="!m-0">
            Add Steps to {flow.name}
          </Title>
          <Text type="secondary">Project: {project.name}</Text>
        </div>

        <Button type="primary" onClick={handleDone}>
          Done
        </Button>
      </div>

      <Divider />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Left side - Step form */}
        <div className="flex flex-col space-y-5">
          <Card
            title={
              isEditing
                ? `Edit Step #${steps.findIndex((s) => s.id === editingStepId) + 1}`
                : 'Create New Step'
            }
            className="flex-1"
            style={{
              backgroundColor: isEditing ? '#242424' : 'transparent',
              transition: 'background-color 0.3s ease',
            }}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                label="Screenshot or Image"
                className="image-selector-area"
              >
                <ImageSelector
                  imageUrl={currentStep.imageUrl}
                  onUpload={handleImageUpload}
                  onClear={handleClearImage}
                />
              </Form.Item>

              <Form.Item name="context" label="Step Description">
                <Input.TextArea
                  placeholder="You can add a brief description of what's happening in this step for better context..."
                  rows={4}
                />
              </Form.Item>
            </Form>

            <div className="flex justify-end mt-4 space-x-2">
              {isEditing && <Button onClick={handleCancelEdit}>Cancel</Button>}
              <Button
                type="primary"
                icon={isEditing ? <EditOutlined /> : <PlusOutlined />}
                onClick={handleAddStep}
              >
                {isEditing ? 'Update Step' : 'Add Step'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right side - Steps list */}
        <div className="flex flex-col relative overflow-hidden right-panel">
          <Card
            title={`Flow Steps (${steps.length})`}
            className="flex-1"
            styles={{
              body: {
                height: '100%',
                overflow: 'hidden',
                margin: '-24px',
              },
            }}
            extra={
              isEditing && (
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse mr-2" />
                  <Text type="secondary">Editing in progress...</Text>
                </div>
              )
            }
          >
            {steps.length === 0 ? (
              <Empty
                description="No steps created yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Text className="mb-4 block">
                  Create your first step using the form on the left.
                </Text>
              </Empty>
            ) : (
              <div className="relative h-full">
                <div className="absolute inset-0 overflow-y-auto p-2">
                  <StepTimeline
                    steps={steps}
                    onDelete={handleRemoveStep}
                    currentlyEditingId={editingStepId}
                    onEdit={(step) => {
                      // Set current step for editing
                      setCurrentStep({
                        ...step,
                      });
                      // Set editing state
                      setIsEditing(true);
                      setEditingStepId(step.id);

                      // Load step data into form
                      form.setFieldsValue({
                        context: step.context,
                      });

                      // Scroll to form
                      document
                        .querySelector('.image-selector-area')
                        ?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                        });
                    }}
                  />
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
