import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

const Footer: React.FC = () => {
    const { appSettings } = useData();
    

    const navLinks = [
        { to: '/', text: 'Home' },
        { to: '/#features', text: 'Features' },
        { to: '/#pricing', text: 'Pricing' },
        { to: '/portfolio', text: 'Portfolio' },
        { to: '/#about', text: 'About' },
    ];

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
        if (to.includes('#')) {
            e.preventDefault();
            const [path, hash] = to.split('#');
            // Check if we are already on the target path (ignoring trailing slash differences)
            const currentPath = location.pathname.endsWith('/') && location.pathname.length > 1 
                ? location.pathname.slice(0, -1) 
                : location.pathname;
            const targetPath = path === '/' ? '' : path; // Normalize for comparison if needed

            // Simple check: if we are on the home page (which corresponds to '/')
            if (location.pathname === '/' || location.pathname === '') {
                const targetId = hash;
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                // Navigate to the route with hash
                
            }
        }
    };
    
    
    return (
        <footer className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 mt-auto">
            <div className="container mx-auto px-6 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left space-y-2">
                         <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600">
                            {appSettings.appName}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            &copy; {new Date().getFullYear()} {appSettings.appName}. All rights reserved.
                        </p>
                         <p className="text-xs text-gray-400 dark:text-gray-500">
                            Making education management simpler.
                        </p>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-wrap justify-center gap-6 md:w-1/3">
                        {navLinks.map((link) => (
                            link.to.includes('#') ? (
                                <a
                                    key={link.text}
                                    href={link.to}
                                    onClick={(e) => handleNavClick(e, link.to)}
                                    className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                                >
                                    {link.text}
                                </a>
                            ) : (
                                <Link
                                    key={link.text}
                                    to={link.to}
                                    className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                >
                                    {link.text}
                                </Link>
                            )
                        ))}
                    </div>
                    <a 
                        href="https://drive.google.com/drive/folders/1xFrbH2IHKwMVX9gLpOJ2DGuBS5WFBtrV"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center md:items-end space-y-3 no-underline text-current"
                        >
                        Reg Application Form
                    </a>
                                                

                    <div className="text-left">
                        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Contact & WhatsApp</p>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">9827792360</p>
                    </div>
                            

                    <div className="flex flex-col items-center md:items-end space-y-3">
                         <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Designed & Built By</p>
                         
                         <Link to="/portfolio" className="group flex items-center space-x-4 bg-white dark:bg-gray-800 py-2 px-5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300">
                            <div className="relative">
                                <img 
                                    src="https://lh3.googleusercontent.com/pw/AP1GczO8lppD4c4e0duPD0vcdZ-RfTqFfPRm7va08ZcUrdgsWRHDnNvaVbsX-8RAhWINaSyxwIPrqz2lw54v7wif-_iYo3VSRNsgBZBHoBxgqwPT-Cmgv2E=w1920-h1080" 
                                    alt="Man Singh Rana" 
                                    className="h-10 w-10 rounded-full ring-2 ring-white dark:ring-gray-700 shadow-sm group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Man Singh Rana</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-tight">with Marge It Pro</p>
                            </div>
                         </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
