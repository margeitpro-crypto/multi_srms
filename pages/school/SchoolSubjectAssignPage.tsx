import React, { useEffect } from 'react';
import SubjectAssignPage from '../admin/SubjectAssignPage';
import { usePageTitle } from '../../context/PageTitleContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const SchoolSubjectAssignPage: React.FC = () => {
    const { setPageTitle } = usePageTitle();
    useEffect(() => {
        setPageTitle('Assign Subjects');
    }, [setPageTitle]);

    const { loggedInSchool } = useAuth();
    const { schoolPageVisibility } = useData();
    const isReadOnly = schoolPageVisibility?.assignSubjects === 'read-only';

    return <SubjectAssignPage school={loggedInSchool!} isReadOnly={isReadOnly} />;
};

export default SchoolSubjectAssignPage;
