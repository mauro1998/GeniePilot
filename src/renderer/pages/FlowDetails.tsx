import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Empty, Typography, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StepFormDialog from '../components/StepFormDialog';
import StepEditDialog from '../components/StepEditDialog';
import ImageSelector from '../components/ImageSelector';
import StepTimeline from '../components/StepTimeline';
import { Flow, Step, Project } from '../services/models';
import notificationService from '../services/notification_service';
import storageService from '../services/storage_service';

const { Title, Text } = Typography;

export default function FlowDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);

  // For image editing
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | undefined>(
    undefined,
  );

  // Add step form dialog handler
  const [stepFormDialogStep, setStepFormDialogStep] = useState<Step | null>(
    null,
  );
  const [isStepFormDialogOpen, setIsStepFormDialogOpen] = useState(false);

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

  const goToStepCreation = () => {
    if (flow) {
      navigate(`/flows/${flow.id}/steps/create`);
    }
  };

  const handleImageUpload = (file: File) => {
    // In a real implementation, we would handle the file upload properly
    const fakeImageUrl = URL.createObjectURL(file);
    setTempImageUrl(fakeImageUrl);
    return false;
  };

  const handleScreenCapture = () => {
    // For demonstration, we'll use a placeholder image
    const fakeCaptureUrl =
      'https://placehold.co/600x400/222/fff?text=Captured+Screen';
    setTempImageUrl(fakeCaptureUrl);
  };

  const handleClearImage = () => {
    setTempImageUrl(undefined);
  };

  const handleSaveImage = () => {
    if (!flow || !editingStep) return;

    try {
      // Update step in storage
      const updatedStep = {
        ...editingStep,
        imageUrl: tempImageUrl,
      };

      storageService.updateStep(updatedStep);

      // Update local state
      const newSteps = steps.map((s) =>
        s.id === updatedStep.id ? updatedStep : s,
      );
      setSteps(newSteps);

      // Close modal
      setIsImageModalOpen(false);
      setEditingStep(null);

      notificationService.notify('success', 'Image updated successfully');
    } catch (error) {
      notificationService.handleError(error, 'Failed to update image');
    }
  };

  const handleCancelImageEdit = () => {
    setIsImageModalOpen(false);
    setEditingStep(null);
    setTempImageUrl(undefined);
  };

  const handleStepFormDialogClose = () => {
    setIsStepFormDialogOpen(false);
    setStepFormDialogStep(null);
  };

  const handleStepFormDialogSave = (updatedStep: Step) => {
    try {
      // Update step in storage
      storageService.updateStep(updatedStep);

      // Update local state
      const newSteps = steps.map((s) =>
        s.id === updatedStep.id ? updatedStep : s,
      );
      setSteps(newSteps);

      // Close dialog
      handleStepFormDialogClose();
      notificationService.notify('success', 'Step updated successfully');
    } catch (error) {
      notificationService.handleError(error, 'Failed to update step');
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
            onClick={() => {
              // Placeholder for generate test suite functionality
              notificationService.notify(
                'info',
                'Test suite generation coming soon',
              );
            }}
            disabled={steps.length === 0}
          >
            Generate Test Suite
          </Button>
        </div>
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

      {/* Image editor modal */}
      <Modal
        title={editingStep?.imageUrl ? 'Change Image' : 'Add Image'}
        open={isImageModalOpen}
        onOk={handleSaveImage}
        onCancel={handleCancelImageEdit}
        width={600}
      >
        <ImageSelector
          imageUrl={tempImageUrl}
          onCapture={handleScreenCapture}
          onUpload={handleImageUpload}
          onClear={handleClearImage}
        />
      </Modal>

      {/* Keep this for backward compatibility until we fully migrate to the new flow */}
      <StepFormDialog
        visible={isStepModalOpen}
        flowId={flow.id}
        onClose={() => setIsStepModalOpen(false)}
        onStepCreated={handleStepCreated}
      />

      {/* Step form dialog */}
      <Modal
        title="Edit Step Details"
        open={isStepFormDialogOpen}
        onCancel={handleStepFormDialogClose}
        footer={null}
        width={600}
      >
        {stepFormDialogStep && (
          <StepEditDialog
            initialValues={stepFormDialogStep}
            onSave={handleStepFormDialogSave}
            onCancel={handleStepFormDialogClose}
          />
        )}
      </Modal>
    </div>
  );
}
