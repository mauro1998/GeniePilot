import {
  MemoryRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { ConfigProvider } from 'antd';
import './App.css';

// Import theme
import theme from './theme';

// Import layout
import SidebarLayout from './layout/SidebarLayout';

// Import pages
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import FlowDetails from './pages/FlowDetails';
import StepCreation from './pages/StepCreation';
import Integrations from './pages/Integrations';
import Settings from './pages/Settings';

// Layout wrapper
function AppLayout() {
  return (
    <SidebarLayout>
      <Outlet />
    </SidebarLayout>
  );
}

export default function App() {
  return (
    <ConfigProvider theme={theme}>
      <Router>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/flows/:id" element={<FlowDetails />} />
            <Route
              path="/flows/:flowId/steps/configure"
              element={<StepCreation />}
            />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}
