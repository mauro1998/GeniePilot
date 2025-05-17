import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import {
  HomeOutlined,
  ProjectOutlined,
  ApiOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';

const { Content, Sider } = Layout;
const { Title } = Typography;

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

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
          <div className="flex flex-col h-full">
            <Breadcrumbs />
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
