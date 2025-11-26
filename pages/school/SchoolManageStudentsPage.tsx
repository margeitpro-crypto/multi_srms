import React, { useEffect } from 'react';
import ManageStudentsPage from '../admin/ManageStudentsPage';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { usePageTitle } from '../../context/PageTitleContext';

const SchoolManageStudentsPage: React.FC = () => {
  const { setPageTitle } = usePageTitle();
  const { loggedInSchool } = useAuth();
  const { schoolPageVisibility } = useData();

  // Set the page title after the component has rendered
  useEffect(() => {
    setPageTitle('Manage Students');
  }, [setPageTitle]);

  // Check if the page should be read-only
  const isReadOnly = schoolPageVisibility?.students === 'read-only' || schoolPageVisibility?.students === 'hidden';

  return (
    <ManageStudentsPage 
      school={loggedInSchool} 
      isReadOnly={isReadOnly} 
    />
  );
};

export default SchoolManageStudentsPage;