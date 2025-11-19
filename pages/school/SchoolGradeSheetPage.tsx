import React, { useEffect } from 'react';
import GradeSheetPage from '../admin/GradeSheetPage';
import { usePageTitle } from '../../context/PageTitleContext';
import { useAuth } from '../../context/AuthContext';

const SchoolGradeSheetPage: React.FC = () => {
    const { setPageTitle } = usePageTitle();
    useEffect(() => {
        setPageTitle('Grade Sheet');
    }, [setPageTitle]);
    
    const { loggedInSchool } = useAuth();

    return <GradeSheetPage school={loggedInSchool!} />;
};

export default SchoolGradeSheetPage;