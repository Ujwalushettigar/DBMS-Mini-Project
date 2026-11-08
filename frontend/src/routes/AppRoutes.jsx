import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

// Public Pages
import Home from '../pages/Home';
import About from '../pages/About';
import Examinations from '../pages/Examinations';
import ExamDetails from '../pages/ExamDetails';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';

// Candidate Dashboard Pages
import CandidateDashboard from '../pages/CandidateDashboard';
import MyProfile from '../pages/MyProfile';
import Qualifications from '../pages/Qualifications';
import ApplyExam from '../pages/ApplyExam';
import MyApplications from '../pages/MyApplications';
import AdmitCards from '../pages/AdmitCards';
import Results from '../pages/Results';

// Admin Dashboard Pages
import AdminDashboard from '../pages/AdminDashboard';
import AdminCandidates from '../pages/AdminCandidates';
import AdminExaminations from '../pages/AdminExaminations';
import AdminCenters from '../pages/AdminCenters';
import AdminApplications from '../pages/AdminApplications';
import AdminAdmitCards from '../pages/AdminAdmitCards';
import AdminResults from '../pages/AdminResults';

const DashboardRedirect = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? "/admin/dashboard" : "/candidate/dashboard"} replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/examinations" element={<Examinations />} />
      <Route path="/examinations/:id" element={<ExamDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Intelligent Unified /dashboard Redirection */}
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* Candidate Protected Portal */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout role="candidate" />}>
          <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
          <Route path="/candidate/profile" element={<MyProfile />} />
          <Route path="/candidate/qualifications" element={<Qualifications />} />
          <Route path="/candidate/examinations" element={<Examinations />} />
          <Route path="/candidate/apply/:id" element={<ApplyExam />} />
          <Route path="/candidate/applications" element={<MyApplications />} />
          <Route path="/candidate/admit-cards" element={<AdmitCards />} />
          <Route path="/candidate/results" element={<Results />} />
        </Route>
      </Route>

      {/* Administrator Protected Portal */}
      <Route element={<AdminRoute />}>
        <Route element={<DashboardLayout role="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/candidates" element={<AdminCandidates />} />
          <Route path="/admin/examinations" element={<AdminExaminations />} />
          <Route path="/admin/centers" element={<AdminCenters />} />
          <Route path="/admin/applications" element={<AdminApplications />} />
          <Route path="/admin/admit-cards" element={<AdminAdmitCards />} />
          <Route path="/admin/results" element={<AdminResults />} />
        </Route>
      </Route>

      {/* 404 Not Found Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

