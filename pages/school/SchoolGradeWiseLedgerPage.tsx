import React, { useEffect } from 'react';
import GradeWiseLedgerPage from '../admin/GradeWiseLedgerPage';
import { usePageTitle } from '../../context/PageTitleContext';
import { useAuth } from '../../context/AuthContext';

const SchoolGradeWiseLedgerPage: React.FC = () => {
    const { setPageTitle } = usePageTitle();
    useEffect(() => {
        setPageTitle('Grade Wise Ledger');
    }, [setPageTitle]);

    const { loggedInSchool } = useAuth();

    return <GradeWiseLedgerPage school={loggedInSchool!} />;
};

export default SchoolGradeWiseLedgerPage;