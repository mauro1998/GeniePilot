import React, { useEffect, useState } from 'react';
import { Breadcrumb } from 'antd';
import {
  HomeOutlined,
  ProjectOutlined,
  ApiOutlined,
  SettingOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import storageService from '../services/storage_service';
import { Project, Flow } from '../services/models';

// Breadcrumb route mapping
const routeMap: Record<string, { label: string; icon: React.ReactNode }> = {
  '/': { label: 'Home', icon: <HomeOutlined /> },
  '/projects': { label: 'Projects', icon: <ProjectOutlined /> },
  '/flows': { label: 'Flows', icon: <ApartmentOutlined /> },
  '/integrations': { label: 'Integrations', icon: <ApiOutlined /> },
  '/settings': { label: 'Settings', icon: <SettingOutlined /> },
};

export default function Breadcrumbs() {
  const location = useLocation();
  const [projectCache, setProjectCache] = useState<Record<string, Project>>({});
  const [flowCache, setFlowCache] = useState<Record<string, Flow>>({});

  // Load projects and flows for breadcrumb display
  useEffect(() => {
    const paths = location.pathname.split('/').filter(Boolean);

    // For project routes
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

    // For flow routes
    if (paths[0] === 'flows' && paths[1] && !flowCache[paths[1]]) {
      const flowId = paths[1];
      const flow = storageService.getFlows().find((f) => f.id === flowId);
      if (flow) {
        setFlowCache((prev) => ({
          ...prev,
          [flowId]: flow,
        }));

        // Also cache the parent project if needed
        if (flow.projectId && !projectCache[flow.projectId]) {
          const project = storageService.getProject(flow.projectId);
          if (project) {
            setProjectCache((prev) => ({
              ...prev,
              [flow.projectId]: project,
            }));
          }
        }
      }
    }
  }, [location.pathname, projectCache, flowCache]);

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

      // For flows/:id, use special handling
      if (path === 'flows' && paths[index + 1]) {
        // We need both flow and its parent project
        const flowId = paths[index + 1];
        const flow = flowCache[flowId];

        if (flow && flow.projectId) {
          const project = projectCache[flow.projectId];

          // Add projects link
          items.push({
            key: '/projects',
            title: (
              <Link to="/projects">
                <ProjectOutlined /> Projects
              </Link>
            ),
          });

          // Add parent project link
          if (project) {
            items.push({
              key: `/projects/${flow.projectId}`,
              title: (
                <Link to={`/projects/${flow.projectId}`}>{project.name}</Link>
              ),
            });
          }

          // Add flow name as leaf
          items.push({
            key: `${currentPath}/${flowId}`,
            title: <span>{flow ? flow.name : `Flow ${flowId}`}</span>,
          });
        } else {
          // Fallback if we couldn't load the proper structure
          items.push({
            key: `${currentPath}/${flowId}`,
            title: (
              <span>
                <ApartmentOutlined /> {flow ? flow.name : `Flow ${flowId}`}
              </span>
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
