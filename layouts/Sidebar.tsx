import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { ArrowLeftOnRectangleIcon } from '../components/icons/ArrowLeftOnRectangleIcon';
import { BookOpenIcon } from '../components/icons/BookOpenIcon';
import { BuildingOfficeIcon } from '../components/icons/BuildingOfficeIcon';
import { ChartPieIcon } from '../components/icons/ChartPieIcon';
import { ClipboardDocumentCheckIcon } from '../components/icons/ClipboardDocumentCheckIcon';
import { ClipboardDocumentListIcon } from '../components/icons/ClipboardDocumentListIcon';
import { Cog6ToothIcon } from '../components/icons/Cog6ToothIcon';
import { DocumentChartBarIcon } from '../components/icons/DocumentChartBarIcon';
import { IdentificationIcon } from '../components/icons/IdentificationIcon';
import { NewspaperIcon } from '../components/icons/NewspaperIcon';
import { TableCellsIcon } from '../components/icons/TableCellsIcon';
import { UserGroupIcon } from '../components/icons/UserGroupIcon';
import { UserPlusIcon } from '../components/icons/UserPlusIcon';
import { AcademicCapIcon } from '../components/icons/AcademicCapIcon';
import { useData } from '../context/DataContext';


interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { userRole, logout } = useAuth();
  const { schoolPageVisibility } = useData();

  const adminLinks = [
    { to: '/admin/dashboard', icon: <ChartPieIcon className="h-6 w-6" />, text: 'Admin Dashboard' },
    { to: '/admin/schools', icon: <BuildingOfficeIcon className="h-6 w-6" />, text: 'Manage Schools' },
    { to: '/admin/users', icon: <UserPlusIcon className="h-6 w-6" />, text: 'Manage Users' },
    { to: '/admin/subjects', icon: <BookOpenIcon className="h-6 w-6" />, text: 'Manage Subjects' },
    { to: '/admin/school-dashboard', icon: <ChartPieIcon className="h-6 w-6" />, text: 'School Dashboard' },
    { to: '/admin/students', icon: <UserGroupIcon className="h-6 w-6" />, text: 'Manage Students' },
    { to: '/admin/subject-assign', icon: <ClipboardDocumentCheckIcon className="h-6 w-6" />, text: 'Assign Subjects' },
    { to: '/admin/marks-entry', icon: <TableCellsIcon className="h-6 w-6" />, text: 'Marks Entry' },
    { to: '/admin/mark-wise-ledger', icon: <DocumentChartBarIcon className="h-6 w-6" />, text: 'Mark Wise Ledger' },
    { to: '/admin/grade-wise-ledger', icon: <DocumentChartBarIcon className="h-6 w-6" />, text: 'Grade Wise Ledger' },
    { to: '/admin/grade-sheet', icon: <NewspaperIcon className="h-6 w-6" />, text: 'Grade Sheet' },
    
    
    { to: '/admin/school-settings', icon: <Cog6ToothIcon className="h-6 w-6" />, text: 'School Settings' },
    { to: '/admin/changelog', icon: <ClipboardDocumentListIcon className="h-6 w-6" />, text: 'Changelog' },
    { to: '/admin/help', icon: <BookOpenIcon className="h-6 w-6" />, text: 'Help' },
    { to: '/admin/settings', icon: <Cog6ToothIcon className="h-6 w-6" />, text: 'Settings' },
  ];

  const schoolLinks = [
    { to: '/school/dashboard', icon: <ChartPieIcon className="h-6 w-6" />, text: 'Dashboard', id: 'dashboard' },
    { to: '/school/students', icon: <UserGroupIcon className="h-6 w-6" />, text: 'Manage Students', id: 'students' },
    { to: '/school/subjects', icon: <BookOpenIcon className="h-6 w-6" />, text: 'Manage Subjects', id: 'subjects' },
    { to: '/school/assign-subjects', icon: <ClipboardDocumentCheckIcon className="h-6 w-6" />, text: 'Assign Subjects', id: 'assignSubjects' },
    { to: '/school/marks-entry', icon: <TableCellsIcon className="h-6 w-6" />, text: 'Marks Entry', id: 'marksEntry' },
    { to: '/school/mark-wise-ledger', icon: <DocumentChartBarIcon className="h-6 w-6" />, text: 'Mark Wise Ledger', id: 'markWiseLedger' },
    { to: '/school/grade-wise-ledger', icon: <DocumentChartBarIcon className="h-6 w-6" />, text: 'Grade Wise Ledger', id: 'gradeWiseLedger' },
    { to: '/school/grade-sheet', icon: <NewspaperIcon className="h-6 w-6" />, text: 'Grade Sheet', id: 'gradeSheet' },
    { to: '/school/help', icon: <BookOpenIcon className="h-6 w-6" />, text: 'Help', id: 'help' },
    { to: '/school/settings', icon: <Cog6ToothIcon className="h-6 w-6" />, text: 'Settings', id: 'settings' },
  ].filter(link => schoolPageVisibility && schoolPageVisibility[link.id as keyof typeof schoolPageVisibility] !== 'hidden');


  const navLinks = userRole === 'admin' ? adminLinks : schoolLinks;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      ></div>
      <aside
        className={`fixed lg:relative inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg z-30 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 flex flex-col`}
      >
        <div className="flex items-center justify-center p-4 border-b dark:border-gray-700">
          <AcademicCapIcon className="h-8 w-8 text-primary-600" />
          <span className="ml-3 text-lg font-bold text-gray-800 dark:text-white">ResultSys</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {/* FIX: Inlined NavItem to fix TypeScript error with 'key' prop on inner component. */}
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-1.5 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`
              }
            >
              {link.icon}
              <span className="ml-4 font-medium">{link.text}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t dark:border-gray-700">
          <button onClick={logout} className="w-full flex items-center px-4 py-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">
             <ArrowLeftOnRectangleIcon className="h-6 w-6" />
             <span className="ml-4 font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;