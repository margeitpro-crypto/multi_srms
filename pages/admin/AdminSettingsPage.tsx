

import React, { useState, useEffect } from 'react';
import { usePageTitle } from '../../context/PageTitleContext';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import ToggleSwitch from '../../components/ToggleSwitch';
import { WrenchScrewdriverIcon } from '../../components/icons/WrenchScrewdriverIcon';
import { CalculatorIcon } from '../../components/icons/CalculatorIcon';
import { PaintBrushIcon } from '../../components/icons/PaintBrushIcon';
import { ShieldCheckIcon } from '../../components/icons/ShieldCheckIcon';
import { CircleStackIcon } from '../../components/icons/CircleStackIcon';
import { CreditCardIcon } from '../../components/icons/CreditCardIcon';
import { useData } from '../../context/DataContext';
import { ComputerDesktopIcon } from '../../components/icons/ComputerDesktopIcon';
import Loader from '../../components/Loader';
import { SchoolPageVisibility, PagePermission } from '../../types';

const GeneralSettings = () => {
    const { addToast } = useAppContext();
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addToast("General settings saved successfully!", "success");
    };

    return (
        <div className="space-y-6">
            <InputField id="appName" label="Application Name" defaultValue="ResultSys" />
            <InputField id="academicYear" label="Current Academic Year" defaultValue="2082" />
            <InputField id="appLogo" label="Application Logo" type="file" />
            <div className="flex justify-end">
                <Button onClick={handleSubmit}>Save Changes</Button>
            </div>
        </div>
    );
};

const GradingSettings = () => {
    const finalGradeTable = [
        { grade: 'A+', marksRange: '90 – 100%', gpaRange: '3.61 – 4.00' },
        { grade: 'A', marksRange: '80 – 89%', gpaRange: '3.21 – 3.60' },
        { grade: 'B+', marksRange: '70 – 79%', gpaRange: '2.81 – 3.20' },
        { grade: 'B', marksRange: '60 – 69%', gpaRange: '2.41 – 2.80' },
        { grade: 'C+', marksRange: '50 – 59%', gpaRange: '2.01 – 2.40' },
        { grade: 'C', marksRange: '40 – 49%', gpaRange: '1.61 – 2.00' },
        { grade: 'D', marksRange: '35 – 39%', gpaRange: '1.21 – 1.60' },
        { grade: 'NG', marksRange: 'Below 35%', gpaRange: 'Below 1.20' },
    ];

    const gpScale = [
        { grade: 'A+', range: '90–100', point: 4.0 },
        { grade: 'A', range: '80–89', point: 3.6 },
        { grade: 'B+', range: '70–79', point: 3.2 },
        { grade: 'B', range: '60–69', point: 2.8 },
        { grade: 'C+', range: '50–59', point: 2.4 },
        { grade: 'C', range: '40–49', point: 2.0 },
        { grade: 'D', range: '35–39', point: 1.6 },
        { grade: 'NG', range: 'Below 35', point: 0.0 },
    ];

     const wgpScale = [
        { grade: 'A+', range: '3.61 – 4.0' },
        { grade: 'A', range: '3.21 – 3.6' },
        { grade: 'B+', range: '2.81 – 3.2' },
        { grade: 'B', range: '2.41 – 2.8' },
        { grade: 'C+', range: '2.01 – 2.4' },
        { grade: 'C', range: '1.61 – 2.0' },
        { grade: 'D', range: '1.21 – 1.6' },
        { grade: 'NG', range: '1.2 Below' },
    ];
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                             <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Final Grade Conversion Scale</h3>
                    <div className="overflow-x-auto mt-2">
                        <table className="w-full text-xs text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                                <tr>
                                    <th className="px-4 py-2">Final Grade</th>
                                    <th className="px-4 py-2">Marks Range (%)</th>
                                    <th className="px-4 py-2">GPA Range</th>
                                </tr>
                            </thead>
                            <tbody>
                                {finalGradeTable.map(g => (
                                    <tr key={g.grade} className="border-b dark:border-gray-700">
                                        <td className="px-4 py-2 font-medium">{g.grade}</td>
                                        <td className="px-4 py-2">{g.marksRange}</td>
                                        <td className="px-4 py-2">{g.gpaRange}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">GP from Marks Scale</h3>
                    <div className="overflow-x-auto mt-2">
                        <table className="w-full text-xs text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                                <tr>
                                    <th className="px-4 py-2">Marks Range (%)</th>
                                    <th className="px-4 py-2">Grade Point (GP)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gpScale.map(g => (
                                    <tr key={g.grade} className="border-b dark:border-gray-700">
                                        <td className="px-4 py-2">{g.range}</td>
                                        <td className="px-4 py-2">{g.point.toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">WGPA to Final Grade Scale</h3>
                     <div className="overflow-x-auto mt-2">
                        <table className="w-full text-xs text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                                <tr>
                                    <th className="px-4 py-2">WGPA Range</th>
                                    <th className="px-4 py-2">Subject Final Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wgpScale.map(g => (
                                    <tr key={g.grade} className="border-b dark:border-gray-700">
                                        <td className="px-4 py-2">{g.range}</td>
                                        <td className="px-4 py-2 font-medium">{g.grade}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            <div className="pt-6 border-t dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Calculation Example</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">This example demonstrates how grades are calculated based on NEB standards.</p>

                <div className="space-y-4">
                    <h4 className="font-semibold text-base text-primary-600 dark:text-primary-400">Part 1: WGPA (Subject-wise Final Grade) Calculation</h4>
                    <p className="text-xs">The WGPA represents the final grade for a single subject, combining both Theory and Internal marks.</p>
                    
                    <div className="pl-4 space-y-3">
                        <div>
                            <p className="font-semibold">Step 1: Find Grade Point (GP) for Theory & Internal</p>
                            <p className="text-xs">Based on marks obtained. Eg: a student gets 85% in Theory (GP: 3.6) and 95% in Internal (GP: 4.0).</p>
                        </div>
                        <div>
                            <p className="font-semibold">Step 2: Calculate Weighted Grade Point (WGP)</p>
                            <p className="text-xs font-mono bg-gray-100 dark:bg-gray-700/50 p-1 rounded inline-block">Formula: WGP = Credit Hour × GP</p>
                            <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                                <li>Nepali (TH): 2.25 Credit × 3.6 GP = 8.1 WGP</li>
                                <li>Nepali (IN): 0.75 Credit × 4.0 GP = 3.0 WGP</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold">Step 3: Calculate WGPA (Weighted Grade Point Average)</p>
                            <p className="text-xs font-mono bg-gray-100 dark:bg-gray-700/50 p-1 rounded inline-block">Formula: WGPA = Total WGP / Total Credit Hour</p>
                            <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                                <li>Total WGP for Nepali = 8.1 + 3.0 = 11.1</li>
                                <li>Total Credit for Nepali = 2.25 + 0.75 = 3.0</li>
                                <li><span className="font-bold">WGPA = 11.1 / 3.0 = 3.7</span></li>
                            </ul>
                            <p className="text-xs mt-1">Based on the WGPA Range Table, a WGPA of <strong>3.70</strong> results in a final subject grade of <strong>A+</strong>.</p>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-4 mt-6 pt-4 border-t dark:border-gray-700">
                    <h4 className="font-semibold text-base text-primary-600 dark:text-primary-400">Part 2: Final GPA (Overall Transcript GPA) Calculation</h4>
                    <p className="text-xs">The Final GPA is the overall GPA for all subjects combined, which appears on the final transcript.</p>
                    <div className="pl-4 space-y-3">
                        <div>
                            <p className="font-semibold">Formula:</p>
                            <p className="text-xs font-mono bg-gray-100 dark:bg-gray-700/50 p-1 rounded inline-block">Final GPA = Sum of WGP (all subjects) / Total Credit Hour (all subjects)</p>
                        </div>
                        <div>
                            <p className="font-semibold">Example:</p>
                            <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                                <li>Assume Sum of WGP for all subjects = 115.2</li>
                                <li>Assume Total Credit Hours for all subjects = 32</li>
                                <li><span className="font-bold">Final GPA = 115.2 / 32 = 3.60</span></li>
                            </ul>
                            <p className="text-xs mt-1">Based on the official Final GPA Range Table, a Final GPA of <strong>3.60</strong> results in an overall transcript grade of <strong>A+</strong>.</p>
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 dark:text-white pt-6 border-t dark:border-gray-600">Pass Marks Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField id="theoryPass" label="Default Theory Pass Marks (%)" type="number" defaultValue="35" />
                <InputField id="internalPass" label="Default Internal Pass Marks (%)" type="number" defaultValue="40" />
            </div>
            <div className="flex justify-end pt-4 border-t dark:border-gray-600">
                <Button>Save Grading Settings</Button>
            </div>
        </div>
    );
};

const AppearanceSettings = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Theme</h3>
            <div className="flex items-center space-x-4">
                <span>Light</span>
                <ToggleSwitch label="" enabled={theme === 'dark'} onChange={toggleTheme} />
                <span>Dark</span>
            </div>
        </div>
    );
};

const SecuritySettings = () => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Change Password</h3>
            <InputField id="currentPass" label="Current Password" type="password" />
            <InputField id="newPass" label="New Password" type="password" />
            <InputField id="confirmPass" label="Confirm New Password" type="password" />
             <div className="flex justify-end">
                <Button>Update Password</Button>
            </div>
            <hr className="dark:border-gray-600"/>
             <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Security Options</h3>
             <ToggleSwitch label="Enable Two-Factor Authentication (2FA)" enabled={false} onChange={() => {}} />
        </div>
    );
};

const PaymentSettings = () => {
    const { addToast } = useAppContext();
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addToast("Payment settings saved successfully!", "success");
    };

    const plans = [
        { name: 'Basic', price: 'Rs. 5,000/year', features: 'Up to 500 students' },
        { name: 'Pro', price: 'Rs. 10,000/year', features: 'Up to 2000 students, Priority Support' },
        { name: 'Enterprise', price: 'Contact Us', features: 'Unlimited students, Custom features' },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Payment Gateway Configuration</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Configure eSewa for payment processing.</p>
                <div className="mt-4 space-y-4 max-w-md">
                    <InputField id="esewaMerchant" label="eSewa Merchant ID / Number" type="text" defaultValue="9827792360" />
                    <InputField id="esewaQR" label="eSewa QR Code Image URL" type="text" placeholder="e.g., https://example.com/qr.png" />
                </div>
            </div>
            
            <div className="pt-6 border-t dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Subscription Plans</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage the subscription plans available for schools.</p>
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-2">Plan Name</th>
                                <th className="p-2">Price</th>
                                <th className="p-2">Features</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map(plan => (
                                <tr key={plan.name} className="border-b dark:border-gray-700">
                                    <td className="p-2 font-medium">{plan.name}</td>
                                    <td className="p-2">{plan.price}</td>
                                    <td className="p-2">{plan.features}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t dark:border-gray-600">
                <Button type="submit">Save Payment Settings</Button>
            </div>
        </form>
    );
};

const DataManagement = () => {
    const { addToast } = useAppContext();
    const { resetData } = useData();

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Database Information</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    The system uses a PostgreSQL database for robust and reliable data management.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-xs p-4 border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                    <div className="font-medium text-gray-600 dark:text-gray-300">Database Type:</div>
                    <div className="text-gray-800 dark:text-white font-semibold">PostgreSQL</div>
                    <div className="font-medium text-gray-600 dark:text-gray-300">Status:</div>
                    <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                        <span className="text-green-600 dark:text-green-400 font-semibold">Connected</span>
                    </div>
                    <div className="font-medium text-gray-600 dark:text-gray-300">Version:</div>
                    <div className="text-gray-800 dark:text-white">16.3</div>
                    <div className="font-medium text-gray-600 dark:text-gray-300">Host:</div>
                    <div className="text-gray-800 dark:text-white">db.resultsys.cloud.internal</div>
                </div>
            </div>
            
            <div className="pt-6 border-t dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Backup & Restore</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Create backups of the entire database or restore from a previous point.</p>
                <div className="flex flex-wrap gap-4 mt-4">
                    <Button variant="secondary" onClick={() => addToast("Creating system backup... This may take a few minutes.", "info")}>Create System Backup</Button>
                    <Button variant="ghost" onClick={() => addToast("Restore functionality is limited to super-admins.", "warning")}>Restore from Backup</Button>
                </div>
            </div>

            <div className="pt-6 border-t dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Export Data</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Download system data in CSV format for offline use or migration.</p>
                <div className="flex flex-wrap gap-4 mt-4">
                    <Button variant="ghost" onClick={() => addToast("Exporting students data...", "info")}>Export Students</Button>
                    <Button variant="ghost" onClick={() => addToast("Exporting schools data...", "info")}>Export Schools</Button>
                    <Button variant="ghost" onClick={() => addToast("Exporting subjects data...", "info")}>Export Subjects</Button>
                </div>
            </div>

            <div className="pt-6 border-t border-red-500/50 dark:border-red-500/30">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">These actions are irreversible. Please proceed with caution.</p>
                <div className="mt-4 space-y-4">
                    <Button variant="danger" onClick={resetData}>
                        Reset All Application Data
                    </Button>
                     <Button variant="danger" onClick={() => window.confirm('Are you sure you want to clear all result data? This action cannot be undone.') && addToast("All result data has been cleared.", "error")}>
                        Clear All Result Data
                    </Button>
                </div>
            </div>
        </div>
    );
};

const SchoolPageController = () => {
    const { addToast } = useAppContext();
    const { schoolPageVisibility, setSchoolPageVisibility } = useData();

    if (!schoolPageVisibility || Object.keys(schoolPageVisibility).length === 0) {
        return <Loader />;
    }

    const handlePermissionChange = (page: keyof SchoolPageVisibility, permission: PagePermission) => {
        setSchoolPageVisibility(prev => ({ ...prev, [page]: permission }));
    };

    const handleSave = () => {
        addToast("School page visibility settings saved!", "success");
    };

    const pageLabels: { [key in keyof SchoolPageVisibility]: string } = {
        dashboard: "Dashboard",
        students: "Manage Students",
        subjects: "Manage Subjects",
        assignSubjects: "Assign Subjects",
        marksEntry: "Marks Entry",
        gradeSheet: "Grade Sheet",
        markWiseLedger: "Mark Wise Ledger",
        gradeWiseLedger: "Grade Wise Ledger",
        settings: "Settings",
    };

    const permissions: { id: PagePermission, label: string }[] = [
        { id: 'read-write', label: 'Read/Write' },
        { id: 'read-only', label: 'Read Only' },
        { id: 'hidden', label: 'Hidden' },
    ];

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">School Page Controller</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4">
                Control access levels for each page in the school dashboard.
            </p>
            <div className="space-y-4">
                {(Object.keys(schoolPageVisibility) as Array<keyof SchoolPageVisibility>).map(page => (
                    <div key={page} className="p-4 border rounded-lg dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                         <span className="font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">{pageLabels[page]}</span>
                         <div className="flex rounded-md shadow-sm" role="group">
                             {permissions.map(p => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handlePermissionChange(page, p.id)}
                                    className={`px-4 py-2 text-xs font-medium border border-gray-200 dark:border-gray-600 transition-colors
                                        ${schoolPageVisibility[page] === p.id 
                                            ? 'bg-primary-600 text-white z-10 ring-2 ring-primary-500' 
                                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600'}
                                        ${p.id === 'read-write' ? 'rounded-l-lg' : ''}
                                        ${p.id === 'hidden' ? 'rounded-r-lg' : ''}
                                    `}
                                >
                                    {p.label}
                                </button>
                             ))}
                        </div>
                    </div>
                ))}
            </div>
             <div className="flex justify-end pt-4 border-t dark:border-gray-600">
                <Button onClick={handleSave}>Save Settings</Button>
            </div>
        </div>
    );
};


const AdminSettingsPage: React.FC = () => {
    const { setPageTitle } = usePageTitle();
    useEffect(() => {
        setPageTitle('Settings');
    }, [setPageTitle]);

    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General', icon: <WrenchScrewdriverIcon className="w-5 h-5" />, component: <GeneralSettings /> },
        { id: 'grading', label: 'Grading', icon: <CalculatorIcon className="w-5 h-5" />, component: <GradingSettings /> },
        { id: 'school-controller', label: 'School Page Controller', icon: <ComputerDesktopIcon className="w-5 h-5" />, component: <SchoolPageController /> },
        { id: 'appearance', label: 'Appearance', icon: <PaintBrushIcon className="w-5 h-5" />, component: <AppearanceSettings /> },
        { id: 'security', label: 'Security', icon: <ShieldCheckIcon className="w-5 h-5" />, component: <SecuritySettings /> },
        { id: 'payment', label: 'Payment', icon: <CreditCardIcon className="w-5 h-5" />, component: <PaymentSettings /> },
        { id: 'data', label: 'Data', icon: <CircleStackIcon className="w-5 h-5" />, component: <DataManagement /> },
    ];

    return (
       <div className="animate-fade-in">
            <div className="flex border-b dark:border-gray-700 mb-6 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border-b-2 border-transparent'
                        }`}
                    >
                        {tab.icon}
                        <span className="ml-2">{tab.label}</span>
                    </button>
                ))}
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                {tabs.find(tab => tab.id === activeTab)?.component}
            </div>
        </div>
    );
};

export default AdminSettingsPage;
