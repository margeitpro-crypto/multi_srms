import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

const Footer: React.FC = () => {
    const { appSettings } = useData();
    
    return (
        <footer className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 mt-auto">
            <div className="container mx-auto px-6 py-10">
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