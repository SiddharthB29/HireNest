import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { RedirectIfAuthenticated, RequireRole } from './components/RouteGuards';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { JobsPage } from './pages/JobsPage';
import { JobDetailPage } from './pages/JobDetailPage';

import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentApplicationsPage } from './pages/student/StudentApplicationsPage';

import { RecruiterDashboardPage } from './pages/recruiter/RecruiterDashboardPage';
import { RecruiterJobsPage } from './pages/recruiter/RecruiterJobsPage';
import { RecruiterApplicationsPage } from './pages/recruiter/RecruiterApplicationsPage';
import { CandidateRankingsPage } from './pages/recruiter/CandidateRankingsPage';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminCompaniesPage } from './pages/admin/AdminCompaniesPage';
import { AdminRecruitersPage } from './pages/admin/AdminRecruitersPage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:jobId" element={<JobDetailPage />} />

            {/* Auth */}
            <Route
              path="/login"
              element={
                <RedirectIfAuthenticated>
                  <LoginPage />
                </RedirectIfAuthenticated>
              }
            />
            <Route
              path="/register"
              element={
                <RedirectIfAuthenticated>
                  <RegisterPage />
                </RedirectIfAuthenticated>
              }
            />

            {/* Student */}
            <Route
              path="/student"
              element={
                <RequireRole roles={['STUDENT']}>
                  <StudentDashboardPage />
                </RequireRole>
              }
            />
            <Route
              path="/student/profile"
              element={
                <RequireRole roles={['STUDENT']}>
                  <StudentProfilePage />
                </RequireRole>
              }
            />
            <Route
              path="/student/applications"
              element={
                <RequireRole roles={['STUDENT']}>
                  <StudentApplicationsPage />
                </RequireRole>
              }
            />

            {/* Recruiter */}
            <Route
              path="/recruiter"
              element={
                <RequireRole roles={['RECRUITER']}>
                  <RecruiterDashboardPage />
                </RequireRole>
              }
            />
            <Route
              path="/recruiter/jobs"
              element={
                <RequireRole roles={['RECRUITER']}>
                  <RecruiterJobsPage />
                </RequireRole>
              }
            />
            <Route
              path="/recruiter/applications"
              element={
                <RequireRole roles={['RECRUITER']}>
                  <RecruiterApplicationsPage />
                </RequireRole>
              }
            />
            <Route
              path="/recruiter/jobs/:jobId/candidates"
              element={
                <RequireRole roles={['RECRUITER', 'ADMIN']}>
                  <CandidateRankingsPage />
                </RequireRole>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <RequireRole roles={['ADMIN']}>
                  <AdminDashboardPage />
                </RequireRole>
              }
            />
            <Route
              path="/admin/companies"
              element={
                <RequireRole roles={['ADMIN']}>
                  <AdminCompaniesPage />
                </RequireRole>
              }
            />
            <Route
              path="/admin/recruiters"
              element={
                <RequireRole roles={['ADMIN']}>
                  <AdminRecruitersPage />
                </RequireRole>
              }
            />
            <Route
              path="/admin/applications"
              element={
                <RequireRole roles={['ADMIN']}>
                  <AdminApplicationsPage />
                </RequireRole>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
