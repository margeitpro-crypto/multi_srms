import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppContextProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { PageTitleProvider } from './context/PageTitleContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import PortfolioPage from './pages/public/PortfolioPage';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Print Pages
import PrintMarksheetPage from './pages/print/PrintMarksheetPage';
import PrintAllMarksheetsPage from './pages/print/PrintAllMarksheetsPage';

// Common Authenticated Pages
import StudentProfilePage from './pages/common/StudentProfilePage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ManageSchoolsPage from './pages/admin/ManageSchoolsPage';
import ManageSubjectsPage from './pages/admin/ManageSubjectsPage';
import ManageStudentsPage from './pages/admin/ManageStudentsPage';
import SchoolDashboardViewerPage from './pages/admin/SchoolDashboardViewerPage';
import ChangelogPage from './pages/admin/ChangelogPage';
import SubjectAssignPage from './pages/admin/SubjectAssignPage';
import MarksEntryAdminPage from './pages/admin/MarksEntryAdminPage';
import MarkWiseLedgerPage from './pages/admin/MarkWiseLedgerPage';
import GradeWiseLedgerPage from './pages/admin/GradeWiseLedgerPage';
import GradeSheetPage from './pages/admin/GradeSheetPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import SchoolSettingsEditorPage from './pages/admin/SchoolSettingsEditorPage';
import ManageUserPage from './pages/admin/ManageUserPage';

// School Pages
import SchoolDashboardPage from './pages/school/SchoolDashboardPage';
import SchoolStudentsPage from './pages/school/SchoolStudentsPage';
import MarksEntryPage from './pages/school/MarksEntryPage';
import SchoolManageSubjectsPage from './pages/school/SchoolManageSubjectsPage';
import SchoolSubjectAssignPage from './pages/school/SchoolSubjectAssignPage';
import SchoolMarkWiseLedgerPage from './pages/school/SchoolMarkWiseLedgerPage';
import SchoolGradeWiseLedgerPage from './pages/school/SchoolGradeWiseLedgerPage';
import SchoolGradeSheetPage from './pages/school/SchoolGradeSheetPage';
import SchoolSettingsPage from './pages/school/SchoolSettingsPage';

// Help Page
import HelpPage from './pages/HelpPage';

// A wrapper for routes that should only be accessible to unauthenticated users.
const PublicOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, userRole } = useAuth();
  if (isAuthenticated) {
    const homePath = userRole === 'admin' ? '/admin/dashboard' : '/school/dashboard';
    return <Navigate to={homePath} replace />;
  }
  return children;
};

// A wrapper for routes that should only be accessible to authenticated users.
const ProtectedRoute: React.FC<{ children: React.ReactElement; requiredRole?: 'admin' | 'school' }> = ({ children, requiredRole }) => {
  const { isAuthenticated, userRole } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If a specific role is required, check it
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = userRole === 'admin' ? '/admin/dashboard' : '/school/dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

function AppContent() {
  const { userRole } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route index element={<PublicOnlyRoute><HomePage /></PublicOnlyRoute>} />
        <Route path="login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
      </Route>
      
      {/* Portfolio page without header and footer */}
      <Route path="/portfolio" element={
        <PageTitleProvider>
          <PortfolioPage />
        </PageTitleProvider>
      } />

      {/* Print routes don't need a layout */}
      <Route path="/print-marksheet/:studentId" element={<PrintMarksheetPage />} />
      <Route path="/print-all-marksheets" element={<PrintAllMarksheetsPage />} />

      {/* Admin Routes */}
      <Route path="/admin/*" element={<ProtectedRoute requiredRole="admin"><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="school-dashboard" element={<SchoolDashboardViewerPage />} />
        <Route path="schools" element={<ManageSchoolsPage />} />
        <Route path="subjects" element={<ManageSubjectsPage />} />
        <Route path="subject-assign" element={<SubjectAssignPage />} />
        <Route path="marks-entry" element={<MarksEntryAdminPage />} />
        <Route path="mark-wise-ledger" element={<MarkWiseLedgerPage />} />
        <Route path="grade-wise-ledger" element={<GradeWiseLedgerPage />} />
        <Route path="grade-sheet" element={<GradeSheetPage />} />
        <Route path="students" element={<ManageStudentsPage />} />
        <Route path="school-settings" element={<SchoolSettingsEditorPage />} />
        <Route path="changelog" element={<ChangelogPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="users" element={<ManageUserPage />} />
      </Route>

      {/* School Routes */}
      <Route path="/school/*" element={<ProtectedRoute requiredRole="school"><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/school/dashboard" replace />} />
        <Route path="dashboard" element={<SchoolDashboardPage />} />
        <Route path="students" element={<SchoolStudentsPage />} />
        <Route path="subjects" element={<SchoolManageSubjectsPage />} />
        <Route path="assign-subjects" element={<SchoolSubjectAssignPage />} />
        <Route path="marks-entry" element={<MarksEntryPage />} />
        <Route path="mark-wise-ledger" element={<SchoolMarkWiseLedgerPage />} />
        <Route path="grade-wise-ledger" element={<SchoolGradeWiseLedgerPage />} />
        <Route path="grade-sheet" element={<SchoolGradeSheetPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="settings" element={<SchoolSettingsPage />} />
      </Route>
      
      <Route path="student/:studentId" element={<StudentProfilePage />} />
      
       {/* Catch all unhandled routes */}
       <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


function App() {
  return (
    <ThemeProvider>
      <AppContextProvider>
        <HashRouter>
          <DataProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </DataProvider>
        </HashRouter>
      </AppContextProvider>
    </ThemeProvider>
  );
}

export default App;