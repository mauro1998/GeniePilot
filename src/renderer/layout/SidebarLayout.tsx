import React from 'react';
import { Layout, Menu, Typography, Breadcrumb } from 'antd';
import {
  HomeOutlined,
  ProjectOutlined,
  ApiOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const { Content, Sider } = Layout;
const { Title } = Typography;

interface SidebarLayoutProps {
  children: React.ReactNode;
}

// Breadcrumb route mapping
const routeMap: Record<string, { label: string; icon: React.ReactNode }> = {
  '/': { label: 'Home', icon: <HomeOutlined /> },
  '/projects': { label: 'Projects', icon: <ProjectOutlined /> },
  '/integrations': { label: 'Integrations', icon: <ApiOutlined /> },
  '/settings': { label: 'Settings', icon: <SettingOutlined /> },
};

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);

    // Start with home
    const items = [
      {
        key: '/',
        title: (
          <Link to="/">
            <HomeOutlined /> Home
          </Link>
        ),
      },
    ];

    // Build the rest of the path
    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;

      // For projects/:id, use special handling
      if (path === 'projects' && paths[index + 1]) {
        items.push({
          key: currentPath,
          title: (
            <Link to={currentPath}>
              <ProjectOutlined /> Projects
            </Link>
          ),
        });

        // Add the project ID as a leaf breadcrumb if it exists
        if (paths[index + 1]) {
          const projectId = paths[index + 1];
          items.push({
            key: `${currentPath}/${projectId}`,
            title: React.createElement('span', {}, `Project ${projectId}`),
          });
        }
        return;
      }

      // For normal routes
      if (routeMap[currentPath]) {
        items.push({
          key: currentPath,
          title: (
            <Link to={currentPath}>
              {routeMap[currentPath].icon} {routeMap[currentPath].label}
            </Link>
          ),
        });
      }
    });

    return items;
  };

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: 'Projects',
    },
    {
      key: '/integrations',
      icon: <ApiOutlined />,
      label: 'Integrations',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  return (
    <Layout className="h-full">
      <Sider
        theme="dark"
        width={200}
        className="min-h-screen"
        breakpoint="lg"
        collapsedWidth="0"
      >
        <Title level={4} className="text-white m-0 text-center py-2">
          GeniePilot
        </Title>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="h-full"
        />
      </Sider>
      <Layout className="bg-[#141414]">
        <Content className="p-4 min-h-screen">
          <Breadcrumb items={generateBreadcrumbs()} className="!mb-4" />
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
