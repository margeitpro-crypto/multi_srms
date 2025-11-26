import React, { useEffect } from 'react';
import MarksEntryAdminPage from '../admin/MarksEntryAdminPage';
import { usePageTitle } from '../../context/PageTitleContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const MarksEntrySchoolPage: React.FC = () => {
    const { setPageTitle } = usePageTitle();
    useEffect(() => {
        setPageTitle('Marks Entry');
    }, [setPageTitle]);

    const { loggedInSchool } = useAuth();
    const { schoolPageVisibility } = useData();
    
    // Check if the page should be read-only
    const isReadOnly = schoolPageVisibility?.marksEntry === 'read-only' || schoolPageVisibility?.marksEntry === 'hidden';

    return <MarksEntryAdminPage school={loggedInSchool} isReadOnly={isReadOnly} />;
};

export default MarksEntrySchoolPage;