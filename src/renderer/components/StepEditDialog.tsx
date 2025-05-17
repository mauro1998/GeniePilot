import React from 'react';
import { Form, Input, Button } from 'antd';
import { Step } from '../services/models';

interface StepEditDialogProps {
  initialValues: Step;
  onSave: (updatedStep: Step) => void;
  onCancel: () => void;
}

export default function StepEditDialog({
  initialValues,
  onSave,
  onCancel,
}: StepEditDialogProps) {
  const [form] = Form.useForm();

  React.useEffect(() => {
    // Initialize form with values
    form.setFieldsValue({
      context: initialValues.context,
    });
  }, [form, initialValues]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Update the step with new values while preserving other properties
      const updatedStep = {
        ...initialValues,
        context: values.context,
      };

      onSave(updatedStep);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      name="step_edit_form"
      onFinish={handleSave}
    >
      <Form.Item
        name="context"
        label="Step Description"
        rules={[
          { required: false, message: 'Please enter a step description' },
        ]}
      >
        <Input.TextArea
          placeholder="Describe what happens in this step..."
          rows={4}
          autoFocus
        />
      </Form.Item>

      <div className="flex justify-end gap-2 mt-4">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" htmlType="submit">
          Save Changes
        </Button>
      </div>
    </Form>
  );
}
