
import React, { useEffect } from 'react';
import { usePageTitle } from '../../context/PageTitleContext';

const SubjectOfferingPage: React.FC = () => {
  const { setPageTitle } = usePageTitle();
  useEffect(() => {
    setPageTitle('Subject Offering');
  }, [setPageTitle]);

  return (
    <div className="animate-fade-in p-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Page Deprecated</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">This page is no longer in use. Please use the new "Manage Subjects" and "Assign Subjects" pages.</p>
    </div>
  );
};

export default SubjectOfferingPage;
