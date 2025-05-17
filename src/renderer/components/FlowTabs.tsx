import React from 'react';
import { Card, Tabs } from 'antd';
import { Flow } from '../services/models';
import StepManager from './StepManager';

const { TabPane } = Tabs;

interface FlowTabsProps {
  flows: Flow[];
  selectedFlowId: string | null;
  onFlowSelect: (flowId: string) => void;
  onFlowUpdate: (updatedFlow: Flow) => void;
}

export default function FlowTabs({
  flows,
  selectedFlowId,
  onFlowSelect,
  onFlowUpdate,
}: FlowTabsProps) {
  if (flows.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8 bg-[#1f1f1f]">
      <Tabs
        activeKey={selectedFlowId || undefined}
        onChange={onFlowSelect}
        type="card"
      >
        {flows.map((flow) => (
          <TabPane tab={flow.name} key={flow.id}>
            {selectedFlowId && flow.id === selectedFlowId && (
              <div className="mt-4">
                <StepManager flow={flow} onFlowUpdate={onFlowUpdate} />
              </div>
            )}
          </TabPane>
        ))}
      </Tabs>
    </Card>
  );
}
