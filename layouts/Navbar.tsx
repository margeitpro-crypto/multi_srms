import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { SunIcon } from '../components/icons/SunIcon';
import { MoonIcon } from '../components/icons/MoonIcon';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../context/PageTitleContext';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { userRole, loggedInSchool, logout } = useAuth();
  const { pageTitle } = usePageTitle();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const roleToDisplay = userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : '';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (userRole === 'admin') {
      return 'Administrator';
    } else if (userRole === 'school' && loggedInSchool) {
      return loggedInSchool.name;
    }
    return 'User';
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-b-2 dark:border-gray-700 shadow-sm">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none lg:hidden">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20M4 12H20M4 18H11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white ml-4">{pageTitle}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* User information display */}
        <div className="hidden md:block">
          <p className="text-sm italic text-gray-500 dark:text-gray-300 truncate max-w-xs">
            Hi! {getUserDisplayName()}
          </p>
        </div>
        
        <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none">
          {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
        </button>
        <div className="relative" ref={dropdownRef}>
          <button 
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <img className="h-8 w-8 rounded-full object-cover" src="https://picsum.photos/100" alt="Your avatar" />
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border dark:border-gray-700">
              
              {userRole === 'school' && loggedInSchool && (
                <div className="px-4 py-2 border-b dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">School Information</p>
                  <p className="text-sm text-gray-900 dark:text-white truncate">Role: {roleToDisplay}</p>
                  <p className="text-sm text-gray-900 dark:text-white truncate">School: {loggedInSchool.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">IEMIS: {loggedInSchool.iemisCode}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                Manual Guidelines and Help
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                Sign out
              </button>

            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;