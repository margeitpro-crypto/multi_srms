
import React, { useEffect } from 'react';
import ManageSubjectsPage from '../admin/ManageSubjectsPage';
import { usePageTitle } from '../../context/PageTitleContext';

const SchoolManageSubjectsPage: React.FC = () => {
    const { setPageTitle } = usePageTitle();
    useEffect(() => {
        setPageTitle('Manage Subjects');
    }, [setPageTitle]);

    return <ManageSubjectsPage isReadOnly={true} />;
};

export default SchoolManageSubjectsPage;
