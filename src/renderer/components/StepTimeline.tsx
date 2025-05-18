import React from 'react';
import { Timeline, Typography, Button, Tooltip, Popconfirm, Space } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { Step } from '../services/models';

const { Text, Paragraph } = Typography;

interface StepTimelineProps {
  steps: Step[];
  onDelete?: (stepId: string) => void;
  onEdit?: (step: Step) => void;
  readOnly?: boolean;
  currentlyEditingId?: string | null;
}

export default function StepTimeline({
  steps,
  onDelete,
  onEdit,
  readOnly = false,
  currentlyEditingId = null,
}: StepTimelineProps) {
  if (steps.length === 0) {
    return null;
  }

  // Check if we're in edit mode (any step is being edited)
  const isEditMode = currentlyEditingId !== null;

  return (
    <div className="overflow-hidden">
      <Timeline
        className="!py-4"
        mode="alternate"
        items={steps.map((step, index) => ({
          label: (
            <div className="mb-2">
              <Text strong>Step {index + 1}</Text>
              <Paragraph
                ellipsis={{ rows: 2 }}
                className="mt-1 text-sm text-gray-600"
              >
                {step.context || 'Screenshot with no context'}
              </Paragraph>
            </div>
          ),
          dot: <CheckCircleOutlined className="timeline-clock-icon" />,
          children: (
            <div
              className="mb-6"
              style={{
                position: 'relative',
                padding: step.id === currentlyEditingId ? '8px' : '0px',
                backgroundColor:
                  step.id === currentlyEditingId ? '#1f1f1f' : 'transparent',
                borderRadius: '4px',
                transition: 'all 0.3s ease',
                border:
                  step.id === currentlyEditingId ? '1px solid #434343' : 'none',
              }}
            >
              {step.id === currentlyEditingId && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: index % 2 === 0 ? 'auto' : '10px',
                    left: index % 2 === 0 ? '10px' : 'auto',
                    backgroundColor: '#1890ff',
                    color: 'white',
                    padding: '0 8px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    zIndex: 1,
                  }}
                >
                  Editing
                </div>
              )}
              {step.imageUrl ? (
                <div className="relative">
                  <div
                    className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className="relative" style={{ maxWidth: '75%' }}>
                      <img
                        src={step.imageUrl}
                        alt={`Step ${index + 1}`}
                        className="w-auto h-auto max-w-full max-h-48 object-contain rounded-md"
                      />

                      {!readOnly && (
                        <div className="absolute bottom-0 right-0 bg-black bg-opacity-60 p-2 rounded-tl-md">
                          <Space>
                            {onEdit && (
                              <Tooltip
                                title={
                                  isEditMode
                                    ? 'Finish current edit first'
                                    : 'Edit step details'
                                }
                              >
                                <Button
                                  type="text"
                                  icon={<EditOutlined />}
                                  onClick={() => !isEditMode && onEdit(step)}
                                  className={`${isEditMode ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:text-blue-300'}`}
                                  disabled={isEditMode}
                                />
                              </Tooltip>
                            )}

                            {onDelete && (
                              <Tooltip
                                title={
                                  isEditMode
                                    ? 'Finish current edit first'
                                    : 'Remove this step'
                                }
                              >
                                {isEditMode ? (
                                  <Button
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    className="text-gray-500 cursor-not-allowed"
                                    disabled
                                  />
                                ) : (
                                  <Popconfirm
                                    title="Remove step"
                                    description="Are you sure you want to remove this step?"
                                    onConfirm={() => onDelete(step.id)}
                                    okText="Yes"
                                    cancelText="No"
                                  >
                                    <Button
                                      type="text"
                                      icon={<DeleteOutlined />}
                                      className="text-white hover:text-red-300"
                                    />
                                  </Popconfirm>
                                )}
                              </Tooltip>
                            )}
                          </Space>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className="rounded-md border border-dashed border-gray-300 p-4 text-center bg-gray-50"
                    style={{ height: '100px', maxWidth: '75%', width: '300px' }}
                  >
                    <Text
                      type="secondary"
                      className="flex items-center justify-center h-full"
                    >
                      No image available
                    </Text>
                  </div>
                </div>
              )}
            </div>
          ),
        }))}
      />
    </div>
  );
}
