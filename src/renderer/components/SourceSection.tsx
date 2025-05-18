import React from 'react';
import { Typography } from 'antd';
import ThumbnailSelector from './ThumbnailSelector';

const { Text } = Typography;

interface Source {
  id: string;
  name: string;
  thumbnailDataUrl?: string;
  appIconDataUrl?: string;
  type: 'screen' | 'window';
}

interface SourceSectionProps {
  title: string;
  sources: Source[];
  selectedSourceId: string | null;
  onSourceSelect: (id: string) => void;
  sourceType: 'screen' | 'window';
}

export default function SourceSection({
  title,
  sources,
  selectedSourceId,
  onSourceSelect,
  sourceType,
}: SourceSectionProps) {
  const filteredSources = sources.filter(
    (source) => source.type === sourceType,
  );

  if (filteredSources.length === 0) {
    return null;
  }

  return (
    <div className={sourceType === 'screen' ? 'mb-4' : ''}>
      <Text strong className="text-base mb-2 block">
        {title}
      </Text>
      <div className="grid grid-cols-4 gap-3">
        {filteredSources.map((source) => (
          <ThumbnailSelector
            key={source.id}
            source={source}
            isSelected={selectedSourceId === source.id}
            onClick={onSourceSelect}
          />
        ))}
      </div>
    </div>
  );
}
