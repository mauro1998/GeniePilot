import React, { useEffect, useState } from 'react';
import { Breadcrumb } from 'antd';
import {
  HomeOutlined,
  ProjectOutlined,
  ApiOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import storageService from '../services/storage_service';
import { Project } from '../services/models';

// Breadcrumb route mapping
const routeMap: Record<string, { label: string; icon: React.ReactNode }> = {
  '/': { label: 'Home', icon: <HomeOutlined /> },
  '/projects': { label: 'Projects', icon: <ProjectOutlined /> },
  '/integrations': { label: 'Integrations', icon: <ApiOutlined /> },
  '/settings': { label: 'Settings', icon: <SettingOutlined /> },
};

export default function Breadcrumbs() {
  const location = useLocation();
  const [projectCache, setProjectCache] = useState<Record<string, Project>>({});

  // Load projects for breadcrumb display
  useEffect(() => {
    // Check if we're in a project route
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths[0] === 'projects' && paths[1] && !projectCache[paths[1]]) {
      const projectId = paths[1];
      const project = storageService.getProject(projectId);
      if (project) {
        setProjectCache((prev) => ({
          ...prev,
          [projectId]: project,
        }));
      }
    }
  }, [location.pathname, projectCache]);

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

        // Add the project with its name as a leaf breadcrumb if it exists
        if (paths[index + 1]) {
          const projectId = paths[index + 1];
          const project = projectCache[projectId];
          items.push({
            key: `${currentPath}/${projectId}`,
            title: (
              <span>{project ? project.name : `Project ${projectId}`}</span>
            ),
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

  return <Breadcrumb items={generateBreadcrumbs()} className="!mb-4" />;
}
