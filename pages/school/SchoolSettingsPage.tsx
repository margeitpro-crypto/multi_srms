import React, { useState, useEffect } from 'react';
import { usePageTitle } from '../../context/PageTitleContext';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import ToggleSwitch from '../../components/ToggleSwitch';
import { School, User } from '../../types';
import { IdentificationIcon } from '../../components/icons/IdentificationIcon';
import { ShieldCheckIcon } from '../../components/icons/ShieldCheckIcon';
import { PaintBrushIcon } from '../../components/icons/PaintBrushIcon';
import { CreditCardIcon } from '../../components/icons/CreditCardIcon';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import { useData } from '../../context/DataContext';
import api from '../../services/api';

const SchoolProfileSettings: React.FC<{ school: School, isReadOnly: boolean }> = ({ school, isReadOnly }) => {
    const { addToast } = useAppContext();
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addToast("School profile updated successfully!", "success");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Edit School Profile</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4">Keep your school's information up-to-date.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField id="school-name" label="School Name" defaultValue={school.name} required disabled={isReadOnly} />
                <InputField id="municipality" label="Municipality" defaultValue={school.municipality} required disabled={isReadOnly} />
                <InputField id="head-teacher-name" label="Head Teacher Name" defaultValue={school.headTeacherName} required disabled={isReadOnly} />
                <InputField id="head-teacher-contact" label="Head Teacher Contact" defaultValue={school.headTeacherContact} required disabled={isReadOnly} />
                <InputField id="email" label="School Email" type="email" defaultValue={school.email} required disabled={isReadOnly} />
                <InputField id="estd" label="Established Year (Estd.)" defaultValue={school.estd} disabled={isReadOnly} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <InputField id="prepared-by" label="Prepared By (for reports)" defaultValue={school.preparedBy} disabled={isReadOnly} />
                 <InputField id="checked-by" label="Checked By (for reports)" defaultValue={school.checkedBy} disabled={isReadOnly} />
             </div>

            <div className="flex justify-end pt-4 border-t dark:border-gray-600">
                <Button type="submit" disabled={isReadOnly}>Save Profile Changes</Button>
            </div>
        </form>
    );
};

const PaymentDetailsSettings: React.FC<{ school: School, isAdminView: boolean, isReadOnly: boolean }> = ({ school, isAdminView, isReadOnly }) => {
    return (
        <div className="space-y-8">
            {(isAdminView || isReadOnly) && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-500 text-blue-800 dark:text-blue-300">
                    <p className="text-xs font-medium">
                        {isAdminView ? "You are viewing these settings as an administrator. Actions are disabled." : "This page is read-only."}
                    </p>
                </div>
            )}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Subscription & Payment</h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Subscription Details */}
                    <div className="p-4 border dark:border-gray-600 rounded-lg space-y-2 h-full flex flex-col justify-between">
                        <div>
                            <h4 className="font-semibold mb-2">Current Subscription</h4>
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Current Plan:</span>
                                <span className="font-semibold text-green-600 dark:text-green-400">{school.subscriptionPlan} Plan</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Next Renewal:</span>
                                <span className="font-semibold">2025-07-01</span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Button variant="secondary" disabled={isAdminView || isReadOnly}>Change Plan</Button>
                        </div>
                    </div>
                    {/* Payment Method */}
                    <div className="p-4 border dark:border-gray-600 rounded-lg">
                        <h4 className="font-semibold mb-2 text-center">Payment Method</h4>
                         <div className="flex flex-col items-center text-center">
                            <p className="text-sm font-medium">Pay via eSewa</p>
                            <img 
                                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Pay%20to%20eSewa%20ID%209827792360" 
                                alt="eSewa QR Code" 
                                className="w-40 h-40 my-2 rounded-lg ring-2 ring-gray-200 dark:ring-gray-700 p-1"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">Scan the QR code with your eSewa app</p>
                            <p className="mt-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Or send to eSewa ID:</span><br/>
                                <strong className="text-base font-bold text-gray-800 dark:text-white">9827792360</strong>
                            </p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const SecuritySettings: React.FC<{ isReadOnly: boolean }> = ({ isReadOnly }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Change Password</h3>
            <div className="max-w-md">
                <InputField id="currentPass" label="Current Password" type="password" disabled={isReadOnly} />
                <InputField id="newPass" label="New Password" type="password" containerClassName="mt-4" disabled={isReadOnly} />
                <InputField id="confirmPass" label="Confirm New Password" type="password" containerClassName="mt-4" disabled={isReadOnly} />
            </div>
             <div className="flex justify-start pt-4 border-t dark:border-gray-600">
                <Button disabled={isReadOnly}>Update Password</Button>
            </div>
        </div>
    );
};

const AppearanceSettings = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Theme Preference</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4">Choose how you want the application to look.</p>
            <div className="flex items-center space-x-4">
                <span>Light</span>
                <ToggleSwitch label="" enabled={theme === 'dark'} onChange={toggleTheme} />
                <span>Dark</span>
            </div>
        </div>
    );
};

const SchoolSettingsPage: React.FC<{ school?: School, isAdminView?: boolean }> = ({ school, isAdminView = false }) => {
    const { setPageTitle } = usePageTitle();
    useEffect(() => {
        setPageTitle('Settings');
    }, [setPageTitle]);

    const { loggedInSchool } = useAuth();
    const { schoolPageVisibility } = useData();

    const schoolToEdit = school || loggedInSchool;
    const [activeTab, setActiveTab] = useState('profile');

    const isReadOnly = !isAdminView && schoolPageVisibility?.settings === 'read-only';

    let tabs = [
        { id: 'profile', label: 'School Profile', icon: <IdentificationIcon className="w-5 h-5 mr-2" />, component: schoolToEdit ? <SchoolProfileSettings school={schoolToEdit} isReadOnly={isReadOnly} /> : <Loader /> },
        { id: 'payment', label: 'Payment Details', icon: <CreditCardIcon className="w-5 h-5 mr-2" />, component: schoolToEdit ? <PaymentDetailsSettings school={schoolToEdit} isAdminView={isAdminView} isReadOnly={isReadOnly} /> : <Loader /> },
        { id: 'security', label: 'Security', icon: <ShieldCheckIcon className="w-5 h-5 mr-2" />, component: <SecuritySettings isReadOnly={isReadOnly} /> },
        { id: 'appearance', label: 'Appearance', icon: <PaintBrushIcon className="w-5 h-5 mr-2" />, component: <AppearanceSettings /> },
    ];
    
    if (isAdminView) {
        tabs = tabs.filter(tab => tab.id !== 'security');
    }
    
    if (!schoolToEdit) {
        return <div className="flex justify-center items-center h-64"><Loader /></div>;
    }

    return (
        <div className="animate-fade-in flex flex-col md:flex-row gap-8">
            <aside className="md:w-1/4">
                <nav className="space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center px-4 py-2.5 rounded-lg text-left transition-colors duration-200 ${
                                activeTab === tab.id
                                    ? 'bg-primary-600 text-white shadow'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                {tabs.find(tab => tab.id === activeTab)?.component}
            </main>
        </div>
    );
};

export default SchoolSettingsPage;