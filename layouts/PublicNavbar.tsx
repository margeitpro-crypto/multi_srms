import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { AcademicCapIcon } from '../components/icons/AcademicCapIcon';
import { NebLogo } from '../components/icons/NebLogo';
import { Bars3Icon } from '../components/icons/Bars3Icon';
import { XMarkIcon } from '../components/icons/XMarkIcon';

const PublicNavbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    
    const navLinks = [
        { to: '/', text: 'Home' },
        { to: '/#features', text: 'Features' },
        { to: '/#pricing', text: 'Pricing' },
        { to: '/portfolio', text: 'Portfolio' },
        { to: '/#about', text: 'About' },
    ];

    const handleNavClick = (e: React.MouseEvent, to: string) => {
        if (to.startsWith('/#')) {
            e.preventDefault();
            const sectionId = to.split('#')[1];
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                setIsMenuOpen(false);
            }
        } else {
            setIsMenuOpen(false);
        }
    };

    return (
        <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="p-1 bg-primary-600 rounded-lg">
                                <AcademicCapIcon className="h-8 w-8 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">ResultSys</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => 
                            link.to.startsWith('/#') ? (
                                <a
                                    key={link.to} 
                                    href={link.to} 
                                    onClick={(e) => handleNavClick(e, link.to)} 
                                    className="text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                >
                                    {link.text}
                                </a>
                            ) : (
                                <Link 
                                    key={link.to} 
                                    to={link.to} 
                                    className="text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                >
                                    {link.text}
                                </Link>
                            )
                        )}
                    </nav>
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="md" onClick={() => navigate('/login')}>Login</Button>
                    </div>
                    
                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none"
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div 
                className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 md:hidden ${
                    isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <div 
                className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 md:hidden ${
                    isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                        <AcademicCapIcon className="h-8 w-8 text-primary-600" />
                        <span className="text-xl font-bold text-gray-900 dark:text-white">ResultSys</span>
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <nav className="p-4 space-y-2">
                    {navLinks.map((link) => 
                        link.to.startsWith('/#') ? (
                            <a
                                key={link.to}
                                href={link.to}
                                onClick={(e) => handleNavClick(e, link.to)}
                                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                                    location.pathname === link.to.split('#')[0] 
                                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' 
                                        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                {link.text}
                            </a>
                        ) : (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                                    location.pathname === link.to 
                                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' 
                                        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.text}
                            </Link>
                        )
                    )}
                </nav>
                
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <Button variant="ghost" size="lg" className="w-full" onClick={() => {
                        navigate('/login');
                        setIsMenuOpen(false);
                    }}>
                        Login
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default PublicNavbar;