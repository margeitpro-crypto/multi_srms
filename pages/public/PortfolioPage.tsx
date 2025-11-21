import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../context/PageTitleContext';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon';
import { Bars3Icon } from '../../components/icons/Bars3Icon';
import { XMarkIcon } from '../../components/icons/XMarkIcon';
import { BriefcaseIcon } from '../../components/icons/BriefcaseIcon';
import { AcademicCapIcon } from '../../components/icons/AcademicCapIcon';
import { EnvelopeIcon } from '../../components/icons/EnvelopeIcon';
import { ComputerDesktopIcon } from '../../components/icons/ComputerDesktopIcon';
import { YoutubeIcon } from '../../components/icons/YoutubeIcon';
import { WhatsAppIcon } from '../../components/icons/WhatsAppIcon';
import Button from '../../components/Button';
import { useData } from '../../context/DataContext';


const PortfolioPage: React.FC = () => {
    const { appSettings } = useData();
    const { setPageTitle } = usePageTitle();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    // Updated images as requested
    const backgroundImages = [
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1920&q=80", // Office / Workplace
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1920&q=80", // Teaching / Education
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1920&q=80", // Coding / Tech
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80", // Office
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80", // Teaching
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80", // Coding
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80", // Laptop Code
        "https://images.unsplash.com/photo-1509062522246-37559cc792f9?auto=format&fit=crop&w=1000&q=80", // Classroom
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80", // Code Screen
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80", // Teamwork
        "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80", // Creative Work
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80", // Digital
        "https://images.unsplash.com/photo-1513258496098-8827129860b4?auto=format&fit=crop&w=1000&q=80", // Learning
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80", // Planning
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80", // Writing
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=80", // Education Concept
        "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=1000&q=80", // Notebook
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1000&q=80",
    ];

    useEffect(() => {
        setPageTitle('Man Singh Rana - Portfolio');
        
        // Scrollspy
        const handleScroll = () => {
            const sections = ['home', 'about', 'skills', 'experience', 'work', 'photos', 'contact'];
            const scrollPosition = window.scrollY + 200;

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
                    setActiveSection(section);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [setPageTitle]);

    // Background Slider Timer
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [backgroundImages.length]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <div className="font-sans text-gray-700 dark:text-gray-300 bg-white dark:bg-black min-h-screen selection:bg-blue-100 selection:text-blue-600 overflow-x-hidden">
            {/* Mobile Menu Toggle */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button 
                    onClick={() => setIsMobileMenuOpen(true)} 
                    className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md text-gray-700 dark:text-white focus:outline-none"
                >
                    <Bars3Icon className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Overlay */}
            <div 
                className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-50 h-full w-[300px] bg-[#f2f3f7] dark:bg-[#1a1a1a] flex flex-col items-center text-center transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 shadow-2xl lg:shadow-none`}>
                {/* Mobile Close Button */}
                <div className="absolute top-4 right-4 lg:hidden">
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-600 dark:text-gray-300 focus:outline-none">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="w-full p-0 flex flex-col items-center flex-grow overflow-y-auto no-scrollbar">
                    {/* Profile Image */}
                    <div className="mb-6">
                        <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
                            <img 
                                src="https://lh3.googleusercontent.com/pw/AP1GczO8lppD4c4e0duPD0vcdZ-RfTqFfPRm7va08ZcUrdgsWRHDnNvaVbsX-8RAhWINaSyxwIPrqz2lw54v7wif-_iYo3VSRNsgBZBHoBxgqwPT-Cmgv2E=w1920-h1080" 
                                alt="Man Singh Rana" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Name & Role */}
                    <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-2">Man Singh Rana</h1>
                    <p className="text-sm text-blue-500 font-medium uppercase tracking-widest mb-8">Educator & Developer</p>

                    {/* Navigation */}
                    <nav className="w-full space-y-4 mb-8">
                    {[
                        { id: 'home', label: 'Home' },
                        { id: 'about', label: 'About' },
                        { id: 'skills', label: 'Skills' },
                        { id: 'experience', label: 'Experience' },
                        { id: 'work', label: 'Work' },
                        { id: 'photos', label: 'Photos' },
                        { id: 'contact', label: 'Contact' }
                    ].map(item => (
                        <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`block w-full text-sm uppercase tracking-widest py-1 transition-colors duration-200 hover:text-blue-500 ${activeSection === item.id ? 'text-blue-500 font-bold border-b border-blue-500 inline-block' : 'text-gray-600 dark:text-gray-400'}`}
                        >
                        {item.label}
                        </button>
                    ))}
                    </nav>
                    {/* Back to Home Button */}
                     <div className="w-full mb-8 px-4">
                         <button 
                            onClick={() => navigate('/')} 
                            className="flex items-center justify-center w-full py-2 px-4 text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-white bg-transparent hover:bg-blue-500 border border-gray-300 dark:border-gray-700 hover:border-blue-500 rounded transition-all duration-300"
                         >
                            <span className="mr-2">←</span> {appSettings.appName} Home
                         </button>
                     </div>

                    {/* Footer */}
                    <div className="mt-auto text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                            &copy; {new Date().getFullYear()} All rights reserved <br />
                            Built with <span className="text-red-500">♥</span> in Man Singh Rana
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="lg:ml-[300px] min-h-screen overflow-x-hidden">
                
                {/* 1. Home (Hero) Section */}
                <section id="home" className="h-screen min-h-[600px] flex items-center justify-center relative overflow-hidden">
                    {/* Background Slideshow with Ken Burns Effect */}
                    {backgroundImages.map((img, index) => (
                        <div 
                            key={index}
                            className={`absolute inset-0 bg-cover bg-center ${index === currentImageIndex ? 'opacity-100 scale-110' : 'opacity-0 scale-100'}`}
                            style={{ 
                                backgroundImage: `url("${img}")`,
                                transition: 'opacity 1000ms ease-in-out, transform 6000ms ease-in-out'
                            }}
                        />
                    ))}

                    {/* Overlay */}
                    <div className="col-md-6 col-md-offset-3 col-md-pull-3 col-sm-12 col-xs-12 js-fullheight slider-text animated fadeInUp"></div>
                    
                    {/* Content */}
                    <div className="relative z-20 text-center px-6 max-w-3xl mx-auto animate-slide-in-up">
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-serif text-gray-900 dark:text-white mb-6 break-words">
                            I am <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Man Singh Rana</span>
                        </h1>
                        <p className="text-lg md:text-2xl text-gray-600 dark:text-gray-300 mb-10 font-light">
                            Educator • IT Learner • Frontend Developer (Beginner)
                        </p>
                         <div className="flex flex-col sm:flex-row justify-center gap-4">
                             <button onClick={() => scrollToSection('about')} className="px-8 py-4 border-2 border-blue-500 text-blue-500 font-bold rounded-none hover:bg-blue-500 hover:text-white transition-all duration-300 uppercase tracking-widest text-sm">
                                 View Profile
                             </button>
                             <button onClick={() => alert("CV Download coming soon")} className="px-8 py-4 bg-gray-900 dark:bg-gray-700 text-white font-bold rounded-none hover:bg-gray-800 transition-all duration-300 uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                                 <BriefcaseIcon className="w-4 h-4" /> Download CV
                             </button>
                             
                               
                                
                         </div>
                    </div>

                    {/* Slider Dots */}
                    <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center space-x-3">
                        {backgroundImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`h-2 rounded-full transition-all duration-500 ${
                                    index === currentImageIndex ? 'bg-blue-500 w-8' : 'bg-gray-400 w-2 hover:bg-gray-600'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </section>

                {/* 2. About Section */}
                <section id="about" className="py-24 px-6 md:px-16 bg-white dark:bg-gray-900">
                    <div className="max-w-5xl mx-auto">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] block mb-2">About Us</span>
                        <h2 className="text-4xl font-bold font-serif text-gray-900 dark:text-white mb-12 uppercase tracking-widest">Who Am I?</h2>
                        
                        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-16 font-light">
                            <strong className="font-bold text-gray-900 dark:text-white">Hi I'm Man Singh Rana.</strong> I have over 7 years of teaching experience (5 years in government schools and 2 years in private schools), along with strong skills in computer operations, IT tools, and frontend development. I have completed Bachelor's in Health Education and currently pursuing a Master’s degree in Sociology. I believe in continuous learning and want to grow in both the education sector and the IT field.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Service Card 1 */}
                            <div className="p-8 border-b-2 border-blue-500 shadow-xl bg-white dark:bg-gray-800 hover:-translate-y-2 transition-transform duration-300">
                                <div className="text-blue-500 mb-4">
                                     <AcademicCapIcon className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Education</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                    Expert in Classroom Management, Student Assessment, and Curriculum Planning for Mathematics & Health Education.
                                </p>
                            </div>
                             {/* Service Card 2 */}
                             <div className="p-8 border-b-2 border-purple-500 shadow-xl bg-white dark:bg-gray-800 hover:-translate-y-2 transition-transform duration-300">
                                <div className="text-purple-500 mb-4">
                                     <ComputerDesktopIcon className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Web Development</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                    Building modern web apps using React, Vite, Tailwind CSS, and integrating APIs. Passionate about clean code.
                                </p>
                            </div>
                             {/* Service Card 3 */}
                             <div className="p-8 border-b-2 border-green-500 shadow-xl bg-white dark:bg-gray-800 hover:-translate-y-2 transition-transform duration-300">
                                <div className="text-green-500 mb-4">
                                     <BriefcaseIcon className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Administration</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                    Proficient in Data Entry, Report Preparation, MS Office suite, and Google Workspace tools for efficient operations.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Skills Section */}
                <section id="skills" className="py-24 px-6 md:px-16 bg-[#f2f3f7] dark:bg-black">
                     <div className="max-w-5xl mx-auto">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] block mb-2">My Specialty</span>
                        <h2 className="text-4xl font-bold font-serif text-gray-900 dark:text-white mb-12 uppercase tracking-widest">My Skills</h2>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-12 max-w-2xl">
                            A visualization of my technical and professional proficiency levels. I am constantly learning and improving.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {[
                                { skill: 'Mathematics Teaching', percent: 90, color: 'bg-blue-500' },
                                { skill: 'Classroom Management', percent: 85, color: 'bg-purple-500' },
                                { skill: 'React / Frontend', percent: 60, color: 'bg-green-500' },
                                { skill: 'Computer Operations', percent: 95, color: 'bg-yellow-500' },
                                { skill: 'Database (SQL)', percent: 70, color: 'bg-red-500' },
                                { skill: 'API Integration', percent: 65, color: 'bg-indigo-500' }
                            ].map((item, index) => (
                                <div key={index} className="mb-2">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">{item.skill}</span>
                                        <span className={`font-bold text-xs ${item.color.replace('bg-', 'text-')}`}>{item.percent}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                                        <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.percent}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. Experience Section */}
                <section id="experience" className="py-24 px-6 md:px-16 bg-white dark:bg-gray-900">
                    <div className="max-w-5xl mx-auto">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] block mb-2">Experience</span>
                        <h2 className="text-4xl font-bold font-serif text-gray-900 dark:text-white mb-12 uppercase tracking-widest">Work Experience</h2>

                        {/* Adjusted left margin to ml-6 on mobile to prevent negative margin overflow issues */}
                        <div className="space-y-12 relative border-l-2 border-gray-200 dark:border-gray-700 ml-6 md:ml-3 pl-8 md:pl-12">
                             {[
                                { 
                                    title: 'Government School Teacher', 
                                    period: '2019 - Present (5 Years)', 
                                    desc: 'Taught Mathematics & Health Education. Managed classrooms, prepared lesson plans, and conducted student assessments.',
                                    icon: 'bg-blue-500'
                                },
                                { 
                                    title: 'Private School Teacher', 
                                    period: '2017 - 2019 (2 Years)', 
                                    desc: 'Secondary-level teaching focusing on interactive and activity-based learning methodologies.',
                                    icon: 'bg-purple-500'
                                },
                                { 
                                    title: 'Computer Operator', 
                                    period: 'Freelance / Contract', 
                                    desc: 'Handled complex data entry tasks, report preparation, and general administrative work with high precision.',
                                    icon: 'bg-green-500'
                                },
                            ].map((exp, index) => (
                                <div key={index} className="relative">
                                    <div className={`absolute -left-[43px] md:-left-[59px] w-6 h-6 md:w-8 md:h-8 rounded-full border-4 border-white dark:border-gray-900 ${exp.icon}`}></div>
                                    <div className="bg-[#f2f3f7] dark:bg-gray-800 p-8 rounded-md relative group hover:shadow-lg transition-shadow">
                                        <div className={`absolute left-[-10px] top-6 w-0 h-0 border-t-[10px] border-t-transparent border-r-[10px] border-r-[#f2f3f7] dark:border-r-gray-800 border-b-[10px] border-b-transparent`}></div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1 group-hover:text-blue-500 transition-colors">{exp.title}</h3>
                                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 block">{exp.period}</span>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{exp.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 5. Work/Projects Section */}
                <section id="work" className="py-24 px-6 md:px-16 bg-[#f2f3f7] dark:bg-black">
                     <div className="max-w-6xl mx-auto">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] block mb-2">My Work</span>
                        <h2 className="text-4xl font-bold font-serif text-gray-900 dark:text-white mb-12 uppercase tracking-widest">Recent Projects</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { title: "Result Mgmt System", cat: "Web App", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", desc: "Multi-school result management with NEB compliance." },
                                { title: "Signal Bot", cat: "Python Script", img: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", desc: "Telegram bot for Price Action trading signals." },
                                { title: "Template Editor", cat: "React Tool", img: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", desc: "Google Slides-style editor linked with Sheets." },
                                
                            ].map((proj, index) => (
                                <div key={index} className="group relative overflow-hidden shadow-xl">
                                    <div className="h-64 bg-gray-200 dark:bg-gray-800">
                                        <img src={proj.img} alt={proj.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    </div>
                                    <div className="absolute inset-0 bg-blue-500/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-center p-6">
                                        <h3 className="text-xl font-bold text-white mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{proj.title}</h3>
                                        <span className="text-sm text-white/80 uppercase tracking-widest mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">{proj.cat}</span>
                                        <p className="text-white text-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">{proj.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                </section>

                {/* 6. Photo Gallery Section */}
                <section id="photos" className="py-24 px-6 md:px-16 bg-white dark:bg-gray-900">
                    <div className="max-w-6xl mx-auto">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] block mb-2">My Gallery</span>
                        <h2 className="text-4xl font-bold font-serif text-gray-900 dark:text-white mb-12 uppercase tracking-widest">Photo Showcase</h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
                                <div key={index} className="group relative overflow-hidden rounded-xl shadow-lg transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                                    <div className="aspect-square overflow-hidden">
                                        <img 
                                            src={`/photos/photo${index}.jpg`} 
                                            alt={`Portfolio photo ${index}`}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            <h3 className="text-white font-bold text-lg">Photo {index}</h3>
                                            <p className="text-white/80 text-sm mt-1">Man Singh Rana</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 7. Contact Section */}
                <section id="contact" className="py-24 px-6 md:px-16 bg-white dark:bg-gray-900">
                    <div className="max-w-4xl mx-auto">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] block mb-2">Get in Touch</span>
                        <h2 className="text-4xl font-bold font-serif text-gray-900 dark:text-white mb-12 uppercase tracking-widest">Contact Me</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-[#f2f3f7] dark:bg-gray-800 flex items-center justify-center text-blue-500">
                                        <EnvelopeIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wide text-sm mb-1">Email</h4>
                                        <p className="text-gray-600 dark:text-gray-400">margeitpro@gmail.com</p>
                                    </div>
                                    
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-[#f2f3f7] dark:bg-gray-800 flex items-center justify-center text-blue-500">
                                        <BriefcaseIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wide text-sm mb-1">Address</h4>
                                        <p className="text-gray-600 dark:text-gray-400">Beldandi Rural Municipality -5, Kanchanpur, Nepal</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-[#f2f3f7] dark:bg-gray-800 flex items-center justify-center text-blue-500">
                                        <YoutubeIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wide text-sm mb-1">Youtube</h4>
                                        <p className="text-gray-600 dark:text-gray-400">youtube.com/margeitpro</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-[#f2f3f7] dark:bg-gray-800 flex items-center justify-center text-blue-500">
                                        <WhatsAppIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wide text-sm mb-1">WhatsApp</h4>
                                        <p className="text-gray-600 dark:text-gray-400">9827792360</p>
                                    </div>
                                </div>
                            </div>

                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                <input type="text" placeholder="Name" className="w-full p-4 bg-[#f2f3f7] dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-blue-500" />
                                <input type="email" placeholder="Email" className="w-full p-4 bg-[#f2f3f7] dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-blue-500" />
                                <textarea rows={4} placeholder="Message" className="w-full p-4 bg-[#f2f3f7] dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                                <Button className="w-full py-4 uppercase tracking-widest font-bold rounded-none hover:bg-gray-800 dark:hover:bg-gray-700">Send Message</Button>
                            </form>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
};

export default PortfolioPage;