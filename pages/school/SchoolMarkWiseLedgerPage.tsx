import React, { useEffect } from 'react';
import MarkWiseLedgerPage from '../admin/MarkWiseLedgerPage';
import { usePageTitle } from '../../context/PageTitleContext';
import { useAuth } from '../../context/AuthContext';

const SchoolMarkWiseLedgerPage: React.FC = () => {
    const { setPageTitle } = usePageTitle();
    useEffect(() => {
        setPageTitle('Mark Wise Ledger');
    }, [setPageTitle]);
    
    const { loggedInSchool } = useAuth();

    return <MarkWiseLedgerPage school={loggedInSchool!} />;
};

export default SchoolMarkWiseLedgerPage;