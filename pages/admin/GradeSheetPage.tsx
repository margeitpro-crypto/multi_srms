import React, { useState, useEffect, useMemo } from 'react';
import { usePageTitle } from '../../context/PageTitleContext';
import Select from '../../components/Select';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import Table from '../../components/Table';
import Loader from '../../components/Loader';
import { School, Student } from '../../types';
import { useNavigate } from 'react-router-dom';
// FIX: Use central data context instead of importing mock data from pages.
import { useData } from '../../context/DataContext';
import { useAppContext } from '../../context/AppContext';
import { PrinterIcon } from '../../components/icons/PrinterIcon';

const GradeSheetPage: React.FC<{ school?: School }> = ({ school }) => {
    const { setPageTitle } = usePageTitle();
    useEffect(() => {
        setPageTitle('Grade Sheet');
    }, [setPageTitle]);

    const navigate = useNavigate();
    const { addToast } = useAppContext();
    // FIX: Get data from the central DataContext.
    const { schools: MOCK_SCHOOLS, students: MOCK_ADMIN_STUDENTS, academicYears, marksRefreshTrigger, appSettings } = useData();

    const [selectedSchoolId, setSelectedSchoolId] = useState<string>(school?.id.toString() || '');
    const [selectedYear, setSelectedYear] = useState('2082');
    const [selectedClass, setSelectedClass] = useState('11');
    const [isLoading, setIsLoading] = useState(false);
    const [loadedStudents, setLoadedStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showHeader, setShowHeader] = useState(true);

    // Add useEffect to trigger reload when marks are updated
    useEffect(() => {
        // This will trigger whenever marks are updated
        if (selectedSchoolId && selectedYear && selectedClass) {
            handleLoad();
        }
    }, [marksRefreshTrigger, selectedSchoolId, selectedYear, selectedClass]); // Add marksRefreshTrigger as dependency

    const handleLoad = () => {
        if (!selectedSchoolId) return;
        setIsLoading(true);
        setLoadedStudents([]);
        setTimeout(() => {
            const students = MOCK_ADMIN_STUDENTS.filter(
                s => s.school_id.toString() === selectedSchoolId && s.year.toString() === selectedYear && s.grade === selectedClass
            );
            setLoadedStudents(students);
            setIsLoading(false);
        }, 100);
    };

    const handleResultClick = (studentId: string) => {
        navigate(`/print-marksheet/${studentId}`);
    };

    const handleAdmitCardClick = (studentId: string) => {
        navigate(`/print-admit-card/${studentId}`);
    };

    const handlePrintAll = () => {
        const studentIdsToPrint = filteredStudents.map(s => s.id);
        if (studentIdsToPrint.length === 0) {
            addToast("No students loaded to print.", "warning");
            return;
        }
        navigate('/print-all-marksheets', { state: { studentIds: studentIdsToPrint } });
    };

    const handlePrintAllAdmitCards = () => {
        const studentIdsToPrint = filteredStudents.map(s => s.id);
        if (studentIdsToPrint.length === 0) {
            addToast("No students loaded to print.", "warning");
            return;
        }
        navigate('/print-all-admit-cards', { state: { studentIds: studentIdsToPrint } });
    };

    const filteredStudents = useMemo(() => {
        if (!searchQuery) return loadedStudents;
        const lowercasedQuery = searchQuery.toLowerCase();
        return loadedStudents.filter(student =>
            student.name.toLowerCase().includes(lowercasedQuery) ||
            student.symbol_no.toLowerCase().includes(lowercasedQuery)
        );
    }, [loadedStudents, searchQuery]);

    const columns = [
        { header: 'S.No.', accessor: (_: Student, index: number) => index + 1 },
        { header: 'registration_id', accessor: 'registration_id' as const },
        { header: 'Symbol Number', accessor: 'symbol_no' as const },
        { header: 'Student Name', accessor: 'name' as const },
        { header: 'dob_bs', accessor: 'dob_bs' as const },
        { header: 'Gender', accessor: 'gender' as const },

    ];

    return (
        <div className="animate-fade-in space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg print:hidden">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                     <div className="md:col-span-2">
                        {school ? (
                             <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">School</label>
                                <div className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                    {school.name}
                                </div>
                             </div>
                        ) : (
                            <Select id="school-selector" label="Selected School*" value={selectedSchoolId} onChange={(e) => setSelectedSchoolId(e.target.value)}>
                                <option value="">-- Select a School --</option>
                                {MOCK_SCHOOLS.map(s => (
                                    <option key={s.id} value={s.id}>{s.iemisCode}-{s.name}</option>
                                ))}
                            </Select>
                        )}
                     </div>
                     <Select id="year-selector" label="Year*" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        {academicYears.filter(y => y.is_active).map(year => (
                            <option key={year.id} value={year.year}>{year.year}</option>
                        ))}
                     </Select>
                     <Select id="class-selector" label="Class*" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                        <option value="11">Grade 11</option>
                        <option value="12">Grade 12</option>
                     </Select>
                     <Button onClick={handleLoad} disabled={isLoading || !selectedSchoolId} className="w-full">
                        {isLoading ? <span className="flex items-center space-x-2"><Loader /> <span>Loading...</span></span> : 'Load'}
                     </Button>
                </div>
            </div>

            {loadedStudents.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg animate-fade-in">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 print:hidden">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="showHeader"
                                checked={showHeader}
                                onChange={(e) => setShowHeader(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor="showHeader" className="ml-2 text-gray-700 dark:text-gray-300">Show Header</label>
                        </div>
                        <div className="w-full md:w-1/3">
                            <InputField 
                                id="search" 
                                label="" 
                                placeholder="Search..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex space-x-2">
                            <Button onClick={handlePrintAll} leftIcon={<PrinterIcon className="w-4 h-4" />}>Print All Results ({filteredStudents.length})</Button>
                            <Button variant="secondary" onClick={handlePrintAllAdmitCards} leftIcon={<PrinterIcon className="w-4 h-4" />}>Print All Admit Cards ({filteredStudents.length})</Button>
                        </div>
                    </div>

                    <Table<Student>
                        columns={columns}
                        data={filteredStudents}
                        isLoading={isLoading}
                        renderActions={(student) => (
                            <div className="flex space-x-2">
                                <Button size="sm" onClick={() => handleResultClick(student.id)}>
                                    Result
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => handleAdmitCardClick(student.id)}>
                                    Admit Card
                                </Button>
                            </div>
                        )}
                    />
                </div>
            )}
        </div>
    );
};

export default GradeSheetPage;