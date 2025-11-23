import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppContextProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { PageTitleProvider } from './context/PageTitleContext';

// Layouts
const DashboardLayout = React.lazy(() => import('./layouts/DashboardLayout'));
const PublicLayout = React.lazy(() => import('./layouts/PublicLayout'));

// Public Pages
const HomePage = React.lazy(() => import('./pages/public/HomePage'));
const PortfolioPage = React.lazy(() => import('./pages/public/PortfolioPage'));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/auth/ResetPasswordPage'));

// Print Pages
const PrintMarksheetPage = React.lazy(() => import('./pages/print/PrintMarksheetPage'));
const PrintAllMarksheetsPage = React.lazy(() => import('./pages/print/PrintAllMarksheetsPage'));
const PrintAdmitCardPage = React.lazy(() => import('./pages/print/PrintAdmitCardPage'));
const PrintAllAdmitCardsPage = React.lazy(() => import('./pages/print/PrintAllAdmitCardsPage'));

// Common Authenticated Pages
const StudentProfilePage = React.lazy(() => import('./pages/common/StudentProfilePage'));
const StudentAllProfilePage = React.lazy(() => import('./pages/common/StudentAllProfilePage'));

// Admin Pages
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'));
const ManageSchoolsPage = React.lazy(() => import('./pages/admin/ManageSchoolsPage'));
const ManageSubjectsPage = React.lazy(() => import('./pages/admin/ManageSubjectsPage'));
const ManageStudentsPage = React.lazy(() => import('./pages/admin/ManageStudentsPage'));
const SchoolDashboardViewerPage = React.lazy(() => import('./pages/admin/SchoolDashboardViewerPage'));
const ChangelogPage = React.lazy(() => import('./pages/admin/ChangelogPage'));
const SubjectAssignPage = React.lazy(() => import('./pages/admin/SubjectAssignPage'));
const MarksEntryAdminPage = React.lazy(() => import('./pages/admin/MarksEntryAdminPage'));
const MarkWiseLedgerPage = React.lazy(() => import('./pages/admin/MarkWiseLedgerPage'));
const GradeWiseLedgerPage = React.lazy(() => import('./pages/admin/GradeWiseLedgerPage'));
const GradeSheetPage = React.lazy(() => import('./pages/admin/GradeSheetPage'));
const AdminSettingsPage = React.lazy(() => import('./pages/admin/AdminSettingsPage'));
const SchoolSettingsEditorPage = React.lazy(() => import('./pages/admin/SchoolSettingsEditorPage'));
const ManageUserPage = React.lazy(() => import('./pages/admin/ManageUserPage'));

// School Pages
const SchoolDashboardPage = React.lazy(() => import('./pages/school/SchoolDashboardPage'));
const SchoolManageStudentsPage = React.lazy(() => import('./pages/school/SchoolManageStudentsPage'));
const MarksEntrySchoolPage = React.lazy(() => import('./pages/school/MarksEntrySchoolPage'));
const SchoolManageSubjectsPage = React.lazy(() => import('./pages/school/SchoolManageSubjectsPage'));
const SchoolSubjectAssignPage = React.lazy(() => import('./pages/school/SchoolSubjectAssignPage'));
const SchoolMarkWiseLedgerPage = React.lazy(() => import('./pages/school/SchoolMarkWiseLedgerPage'));
const SchoolGradeWiseLedgerPage = React.lazy(() => import('./pages/school/SchoolGradeWiseLedgerPage'));
const SchoolGradeSheetPage = React.lazy(() => import('./pages/school/SchoolGradeSheetPage'));
const SchoolSettingsPage = React.lazy(() => import('./pages/school/SchoolSettingsPage'));

// Help Page
const HelpPage = React.lazy(() => import('./pages/HelpPage'));

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
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route index element={<PublicOnlyRoute><HomePage /></PublicOnlyRoute>} />
        <Route path="login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
        <Route path="reset-password" element={<PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute>} />
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
      <Route path="/print-admit-card/:studentId" element={<PrintAdmitCardPage />} />
      <Route path="/print-all-admit-cards" element={<PrintAllAdmitCardsPage />} />
      
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
        <Route path="students" element={<SchoolManageStudentsPage />} />
        <Route path="subjects" element={<SchoolManageSubjectsPage />} />
        <Route path="assign-subjects" element={<SchoolSubjectAssignPage />} />
        <Route path="marks-entry" element={<MarksEntrySchoolPage />} />
        <Route path="mark-wise-ledger" element={<SchoolMarkWiseLedgerPage />} />
        <Route path="grade-wise-ledger" element={<SchoolGradeWiseLedgerPage />} />
        <Route path="grade-sheet" element={<SchoolGradeSheetPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="settings" element={<SchoolSettingsPage />} />
      </Route>
      
      <Route path="student/:studentId" element={
        <PageTitleProvider>
          <StudentProfilePage />
        </PageTitleProvider>
      } />
      
      <Route path="students" element={
        <PageTitleProvider>
          <StudentAllProfilePage />
        </PageTitleProvider>
      } />
      
      <Route path="student/all-profiles" element={
        <PageTitleProvider>
          <StudentAllProfilePage />
        </PageTitleProvider>
      } />
      
       {/* Catch all unhandled routes */}
       <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}

const LoadingFallback: React.FC = () => (
  <div className="flex min-h-[200px] items-center justify-center text-gray-500">
    Loading…
  </div>
);

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