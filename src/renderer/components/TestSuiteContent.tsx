import React, { useEffect, useState } from 'react';
import { Button, Empty, Spin, Typography, Card } from 'antd';
import {
  LoadingOutlined,
  CodeOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import testSuiteService, {
  TestSuiteState,
} from '../services/test_suite_service';

const { Title, Paragraph } = Typography;

interface TestSuiteContentProps {
  flowId: string;
  onGenerateClick: () => void;
}

export default function TestSuiteContent({
  flowId,
  onGenerateClick,
}: TestSuiteContentProps) {
  const [state, setState] = useState<TestSuiteState>(
    testSuiteService.getState(flowId),
  );
  const [content, setContent] = useState<string | undefined>(
    testSuiteService.getData(flowId).generatedContent,
  );

  useEffect(() => {
    const handleStateChange = (
      updatedFlowId: string,
      newState: TestSuiteState,
    ) => {
      if (updatedFlowId === flowId) {
        setState(newState);
        setContent(testSuiteService.getData(flowId).generatedContent);
      }
    };

    testSuiteService.on('stateChange', handleStateChange);

    return () => {
      testSuiteService.removeListener('stateChange', handleStateChange);
    };
  }, [flowId]);

  if (state === 'idle') {
    return (
      <Empty
        image={<CodeOutlined style={{ fontSize: 64 }} />}
        description="No test suite generated yet"
        className="my-8"
      >
        <Paragraph className="text-center mb-6">
          Generate a test suite to automatically create Gherkin code based on
          your flow steps.
        </Paragraph>
        <Button
          type="primary"
          size="large"
          onClick={onGenerateClick}
          icon={<RocketOutlined />}
        >
          Generate Test Suite
        </Button>
      </Empty>
    );
  }

  if (state === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          tip="Generating test suite..."
          size="large"
        />
        <Paragraph className="text-center mt-8 max-w-md">
          This process may take a few moments. We&apos;re analyzing your flow
          steps and generating appropriate test cases.
        </Paragraph>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Failed to generate test suite"
        className="my-8"
      >
        <Paragraph className="text-center mb-6 text-red-500">
          There was an error generating the test suite. Please try again.
        </Paragraph>
        <Button type="primary" onClick={onGenerateClick}>
          Try Again
        </Button>
      </Empty>
    );
  }

  // state === 'completed'
  return (
    <div className="px-4 py-6">
      <Title level={4}>Generated Test Suite</Title>
      <Paragraph className="mb-4">
        The following Gherkin code has been generated based on your flow steps:
      </Paragraph>
      <Card className="bg-gray-50 mb-6">
        <pre className="whitespace-pre-wrap font-mono text-sm">
          {content || 'No content available.'}
        </pre>
      </Card>
      <div className="flex justify-end">
        <Button type="primary" onClick={onGenerateClick}>
          Regenerate
        </Button>
      </div>
    </div>
  );
}
