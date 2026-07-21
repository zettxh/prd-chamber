import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InputIdeaPage from './pages/InputIdeaPage';
import ClarificationPage from './pages/ClarificationPage';
import StructurePage from './pages/StructurePage';
import PrdPage from './pages/PrdPage';
import TaskPage from './pages/TaskPage';
import SettingsPage from './pages/SettingsPage';
import VersionHistoryPage from './pages/VersionHistoryPage';
import SharePage from './pages/SharePage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/new" element={<InputIdeaPage />} />
        <Route path="/project/:id/clarify" element={<ClarificationPage />} />
        <Route path="/project/:id/structure" element={<StructurePage />} />
        <Route path="/project/:id/prd" element={<PrdPage />} />
        <Route path="/project/:id/tasks" element={<TaskPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/project/:id/versions" element={<VersionHistoryPage />} />
        <Route path="/share/:token" element={<SharePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
