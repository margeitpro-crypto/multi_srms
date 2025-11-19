
import React, { useState, useEffect } from 'react';
import Select from '../../components/Select';
import SchoolDashboardPage from '../school/SchoolDashboardPage';
import { School } from '../../types';
// FIX: Use central data context instead of useMockData and direct mock imports.
import { useData } from '../../context/DataContext';
import { usePageTitle } from '../../context/PageTitleContext';

const SchoolDashboardViewerPage: React.FC = () => {
    const { setPageTitle } = usePageTitle();
    useEffect(() => {
        setPageTitle('School Dashboard Viewer');
    }, [setPageTitle]);

    const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
    // FIX: Get schools from the central DataContext.
    const { schools } = useData();
    
    const selectedSchool = schools?.find(s => s.id.toString() === selectedSchoolId);

    const handleSelectSchool = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSchoolId(e.target.value);
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <Select
                    id="school-selector"
                    label="Select a School to View its Dashboard"
                    value={selectedSchoolId}
                    onChange={handleSelectSchool}
                    containerClassName="max-w-md"
                >
                    <option value="">-- Select a School --</option>
                    {schools?.map(school => (
                        <option key={school.id} value={school.id}>
                            {school.iemisCode}-{school.name}
                        </option>
                    ))}
                </Select>
            </div>

            {selectedSchool ? (
                <div className="animate-fade-in">
                    <SchoolDashboardPage school={selectedSchool} />
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                    <p className="text-gray-500 dark:text-gray-400">Please select a school from the dropdown to view its dashboard.</p>
                </div>
            )}
        </div>
    );
};

export default SchoolDashboardViewerPage;
