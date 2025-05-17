import React from 'react';
import { Typography } from 'antd';
import { DesktopOutlined, AppstoreOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Source {
  id: string;
  name: string;
  thumbnailDataUrl?: string;
  appIconDataUrl?: string;
  type: 'screen' | 'window';
}

interface ThumbnailSelectorProps {
  source: Source;
  isSelected: boolean;
  onClick: (id: string) => void;
}

const ThumbnailSelector: React.FC<ThumbnailSelectorProps> = ({
  source,
  isSelected,
  onClick,
}) => {
  const isScreen = source.type === 'screen';
  const Icon = isScreen ? DesktopOutlined : AppstoreOutlined;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Image loading error:', e);
    // Fallback to placeholder on error
    e.currentTarget.style.display = 'none';
    e.currentTarget.parentElement?.classList.add('bg-gray-800', 'flex', 'items-center', 'justify-center', 'h-32');
    // Add icon
    const icon = document.createElement('span');
    icon.innerHTML = isScreen
      ? '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z"></path></svg>'
      : '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 3h18v18H3V3m2 2v14h14V5H5z"></path></svg>';
    e.currentTarget.parentElement?.appendChild(icon);
  };

  return (
    <div
      className={`
        cursor-pointer rounded-md overflow-hidden border-2
        ${isSelected ? 'border-blue-500' : 'border-gray-700'}
        hover:border-blue-400 transition-colors
      `}
      onClick={() => onClick(source.id)}
    >
      {source.thumbnailDataUrl ? (
        <div className="relative">
          <img
            src={source.thumbnailDataUrl}
            alt={source.name}
            className="w-full h-32 object-cover"
            onError={handleImageError}
          />

        </div>
      ) : (
        <div className="h-32 bg-gray-800 flex items-center justify-center">
          <Icon style={{ fontSize: '24px' }} />
        </div>
      )}
      <div className="p-2 bg-[#1f1f1f]">
        <div className="flex items-center">
          <Icon className="mr-2" />
          <Text ellipsis className="text-sm">{source.name}</Text>
          {source.appIconDataUrl && (
            <img
              src={source.appIconDataUrl}
              alt="App icon"
              className="w-4 h-4 ml-2"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ThumbnailSelector;
