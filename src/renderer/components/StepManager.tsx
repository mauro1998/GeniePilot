import { Flow } from '../services/models';

type StepManagerProps = {
  flow: Flow;
  onFlowUpdate: (flow: Flow) => void;
};

export default function StepManager({ flow, onFlowUpdate }: StepManagerProps) {
  return <div>StepManager</div>;
}
