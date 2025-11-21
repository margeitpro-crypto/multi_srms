
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { ChartPieIcon } from '../../components/icons/ChartPieIcon';
import { TableCellsIcon } from '../../components/icons/TableCellsIcon';
import { NewspaperIcon } from '../../components/icons/NewspaperIcon';
import { ShieldCheckIcon } from '../../components/icons/ShieldCheckIcon';
import { UserGroupIcon } from '../../components/icons/UserGroupIcon';
import { CalculatorIcon } from '../../components/icons/CalculatorIcon';
import { CheckCircleIcon } from '../../components/icons/CheckCircleIcon';
import { AcademicCapIcon } from '../../components/icons/AcademicCapIcon';
import { ComputerDesktopIcon } from '../../components/icons/ComputerDesktopIcon';
import { BookOpenIcon } from '../../components/icons/BookOpenIcon';
import { BriefcaseIcon } from '../../components/icons/BriefcaseIcon';
import { useData } from '../../context/DataContext';
import { useAppContext } from '../../context/AppContext';
import Modal from '../../components/Modal'; // Import Modal

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
    delay: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, color, delay }) => (
    <div className={`group relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-500 hover:-translate-y-2 animate-slide-in-up ${delay}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`} />
        <div className="relative z-10">
            <div className={`inline-flex items-center justify-center p-4 rounded-2xl mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br ${color} text-white`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{description}</p>
        </div>
    </div>
);

const PricingCard: React.FC<{ plan: string; price: React.ReactNode; students: string; features: string[], isPopular?: boolean, buttonText?: string, delay: string, onClick?: () => void }> = ({ plan, price, students, features, isPopular = false, buttonText = "Choose Plan", delay, onClick }) => (
    <div className={`relative flex flex-col p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2 animate-slide-in-up ${delay} ${isPopular ? 'bg-white dark:bg-gray-800 ring-4 ring-primary-500/20 shadow-2xl scale-105 z-10' : 'bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl'}`}>
        {isPopular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary-600 to-purple-600 text-white text-xs font-bold px-6 py-2 rounded-full shadow-lg uppercase tracking-wide animate-pulse">
                    Most Popular
                </span>
            </div>
        )}
        <div className="mb-8 text-center">
            <h3 className="text-lg font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">{plan}</h3>
            <div className="flex items-center justify-center text-gray-900 dark:text-white">
                {typeof price === 'string' ? (
                     <div className="flex items-baseline">
                        <span className="text-5xl font-extrabold tracking-tight">{price}</span>
                     </div>
                ) : price}
            </div>
             {typeof price === 'string' && <span className="text-sm font-medium text-gray-500 dark:text-gray-400">per year</span>}
            <div className={`mt-6 inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${isPopular ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                {students}
            </div>
        </div>
        <ul className="space-y-4 mb-8 flex-1 px-2">
            {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                    <CheckCircleIcon className={`w-5 h-5 mt-0.5 ${isPopular ? 'text-primary-500' : 'text-green-500'}`} />
                    <p className="ml-3 text-sm text-gray-600 dark:text-gray-300 text-left font-medium">{feature}</p>
                </li>
            ))}
        </ul>
        <Button 
            className={`w-full rounded-xl py-3.5 font-bold shadow-lg transition-transform active:scale-95 ${isPopular ? 'shadow-primary-500/30 hover:shadow-primary-500/50' : ''}`} 
            variant={isPopular ? 'primary' : 'secondary'}
            onClick={onClick}
        >
            {buttonText}
        </Button>
    </div>
);

const AcknowledgmentCard: React.FC<{ title: string; description: React.ReactNode; role?: string; person?: string; delay: string; imageSrc?: string }> = ({ title, description, role, person, delay, imageSrc }) => (
    <div className={`bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-500 hover:-translate-y-1 h-full flex flex-col text-center items-center animate-slide-in-up ${delay}`}>
        {imageSrc ? (
            <div className="w-24 h-24 mb-6 rounded-full overflow-hidden shadow-lg shadow-indigo-500/30 border-4 border-white dark:border-gray-700 flex-shrink-0">
                <img src={imageSrc} alt={person || title} className="w-full h-full object-cover" />
            </div>
        ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-3xl mb-6 shadow-lg shadow-indigo-500/30 text-white flex-shrink-0">
                🏛️
            </div>
        )}
        {(person || role) && (
            <div className="mt-1 pt-2 border-t border-gray-100 dark:border-gray-700 w-full">
                {role && <p className="text-xs text-indigo-500 dark:text-indigo-400 uppercase tracking-wider font-bold mb-1">{role}</p>}
                {person && <p className="text-lg font-bold text-gray-800 dark:text-white">{person}</p>}
            </div>
        )}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-grow px-2">
            {description}
        </div>
        
    </div>
);

const HomePage: React.FC = () => {
    const { appSettings } = useData();
    const { addToast } = useAppContext();
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const navigate = useNavigate();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    
    // Typing effect state
    const fullText1 = "School's Result";
    const fullText2 = "Management System";
    const [typedText1, setTypedText1] = useState('');
    const [typedText2, setTypedText2] = useState('');
    const [typingComplete1, setTypingComplete1] = useState(false);
    const [typingComplete2, setTypingComplete2] = useState(false);

    useEffect(() => {
        const text1 = "School's Result";
        const text2 = "Management System";
        
        let timeout: ReturnType<typeof setTimeout>;
        let phase = 0; // 0: Type 1, 1: Type 2, 2: Pause, 3: Delete 2, 4: Delete 1, 5: Pause
        let charIndex = 0;

        const animate = () => {
            switch (phase) {
                case 0: // Typing Line 1
                    if (charIndex <= text1.length) {
                        setTypedText1(text1.slice(0, charIndex));
                        charIndex++;
                        timeout = setTimeout(animate, 100);
                    } else {
                        setTypingComplete1(true);
                        phase = 1;
                        charIndex = 0;
                        timeout = setTimeout(animate, 100);
                    }
                    break;
                case 1: // Typing Line 2
                    if (charIndex <= text2.length) {
                        setTypedText2(text2.slice(0, charIndex));
                        charIndex++;
                        timeout = setTimeout(animate, 100);
                    } else {
                        setTypingComplete2(true);
                        phase = 2;
                        timeout = setTimeout(animate, 3000); // Wait 3s before deleting
                    }
                    break;
                case 2: // Prepare Delete
                    phase = 3;
                    charIndex = text2.length;
                    animate();
                    break;
                case 3: // Delete Line 2
                    if (charIndex >= 0) {
                        setTypedText2(text2.slice(0, charIndex));
                        charIndex--;
                        timeout = setTimeout(animate, 50); // Deleting speed
                    } else {
                        setTypingComplete2(false);
                        phase = 4;
                        charIndex = text1.length;
                        timeout = setTimeout(animate, 100);
                    }
                    break;
                case 4: // Delete Line 1
                    if (charIndex >= 0) {
                        setTypedText1(text1.slice(0, charIndex));
                        charIndex--;
                        timeout = setTimeout(animate, 50); // Deleting speed
                    } else {
                        setTypingComplete1(false);
                        phase = 5;
                        timeout = setTimeout(animate, 1000); // Wait 1s before restarting
                    }
                    break;
                case 5: // Restart
                    phase = 0;
                    charIndex = 0;
                    animate();
                    break;
            }
        };

        animate();

        return () => clearTimeout(timeout);
    }, []);

    const handlePlanClick = () => {
        setIsPaymentModalOpen(true);
    };

    return (
        <div className="overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden pt-20">
                 {/* Animated Background Blobs */}
                <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                     <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 dark:bg-purple-900/40 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob"></div>
                     <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-300 dark:bg-blue-900/40 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob animation-delay-2000"></div>
                     <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-300 dark:bg-pink-900/40 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob animation-delay-4000"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="animate-slide-in-up">
                        <div className="inline-flex items-center justify-center px-4 py-1.5 mb-8 rounded-full border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-sm">
                             <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                             <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Grade 11 & 12 NEB Compliant</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8 leading-[1.1]">
                             {typedText1} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 animate-gradient-x">
                                {typedText2} 
                            </span>
                        </h1>
                        
                        <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
                            Empower your institution with a powerful, cloud-based platform designed for the modern educational landscape. Secure, efficient, and effortless.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            
                            <Button 
                                size="lg" 
                                variant="secondary" 
                                onClick={() => navigate('/login')} 
                                className="w-full sm:w-auto px-10 py-4 text-lg font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all rounded-2xl"
                            >
                                School Login
                            </Button>
                        </div>
                    </div>
                    
                    
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-16 bg-white dark:bg-gray-900 relative">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                         <span className="text-primary-600 font-bold tracking-wider uppercase text-sm">Features</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mt-2 mb-6">
                            Everything You Need
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Packed with powerful features to streamline your academic processes and save valuable time.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={<ChartPieIcon className="w-8 h-8" />}
                            title="Centralized Dashboards"
                            description="Comprehensive dashboards for admins and schools providing a crystal-clear overview of academic performance at a glance."
                            color="from-blue-400 to-blue-600"
                            delay="delay-0"
                        />
                        <FeatureCard 
                            icon={<TableCellsIcon className="w-8 h-8" />}
                            title="Easy Marks Entry"
                            description="Intuitive, spreadsheet-like interface designed for speed. Enter and manage student marks without the headache."
                            color="from-emerald-400 to-emerald-600"
                            delay="delay-100"
                        />
                        <FeatureCard 
                            icon={<CalculatorIcon className="w-8 h-8" />}
                            title="Auto Grade Calculation"
                            description="Forget manual errors. Automatic GPA and final grade calculations based strictly on the latest NEB standards."
                            color="from-violet-400 to-violet-600"
                            delay="delay-200"
                        />
                         <FeatureCard 
                            icon={<NewspaperIcon className="w-8 h-8" />}
                            title="Printable Grade-Sheets"
                            description="Generate professional, NEB-compliant grade-sheets instantly. Print for a single student or the entire batch in one click."
                            color="from-pink-400 to-pink-600"
                            delay="delay-300"
                        />
                        <FeatureCard 
                            icon={<UserGroupIcon className="w-8 h-8" />}
                            title="Student Management"
                            description="Effortlessly manage student records, subject assignments, and demographic data in a secure, searchable database."
                            color="from-amber-400 to-amber-600"
                            delay="delay-400"
                        />
                        <FeatureCard 
                            icon={<ShieldCheckIcon className="w-8 h-8" />}
                            title="Secure & Reliable"
                            description="Bank-grade security for your data. Robust cloud infrastructure ensures privacy, daily backups, and 99.9% uptime."
                            color="from-cyan-400 to-cyan-600"
                            delay="delay-500"
                        />
                        <FeatureCard 
                            icon={<ComputerDesktopIcon className="w-8 h-8" />}
                            title="Technical Stream"
                            description="Specialized support for technical streams like Computer, Civil, and Electrical Engineering with customizable practical marks."
                            color="from-orange-400 to-orange-600"
                            delay="delay-0"
                        />
                        <FeatureCard 
                            icon={<BookOpenIcon className="w-8 h-8" />}
                            title="Traditional Stream"
                            description="Dedicated features for Traditional and Sanskrit education, ensuring full compliance with specific curriculum standards."
                            color="from-rose-400 to-rose-600"
                            delay="delay-100"
                        />
                        <FeatureCard 
                            icon={<BriefcaseIcon className="w-8 h-8" />}
                            title="General Faculty Support"
                            description="Comprehensive tools for Management, Humanities, and Education faculties with flexible subject configurations."
                            color="from-indigo-400 to-indigo-600"
                            delay="delay-200"
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-32 bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden">
                 {/* Background decoration */}
                 <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 -right-64 w-[500px] h-[500px] bg-primary-200/20 dark:bg-primary-900/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 -left-64 w-[500px] h-[500px] bg-purple-200/20 dark:bg-purple-900/20 rounded-full blur-3xl"></div>
                 </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-purple-600 font-bold tracking-wider uppercase text-sm">Pricing</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mt-2 mb-6">
                            Simple, Transparent Plans
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Choose the perfect plan that fits your institution's size and needs. No hidden fees.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                        <PricingCard
                            plan="Basic"
                            price={<div><span className="text-2xl font-bold text-gray-500 mr-1">Rs.</span> <span className="text-4xl font-extrabold">2,500</span></div>}
                            students="Up to 500 Students"
                            features={['All Core Features', 'Standard Support', 'Daily Cloud Backup', 'Basic Reporting']}
                            delay="delay-0"
                            onClick={handlePlanClick}
                        />
                        <PricingCard
                            plan="Pro"
                            price={<div><span className="text-2xl font-bold text-primary-200 mr-1">Rs.</span> <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-purple-600">5,000</span></div>}
                            students="Up to 2000 Students"
                            features={['All Core Features', 'Priority 24/7 Support', 'Real-time Backups', 'Admin Viewer Access', 'Advanced Analytics']}
                            isPopular={true}
                            buttonText="Get Started"
                            delay="delay-100"
                            onClick={handlePlanClick}
                        />
                        <PricingCard
                            plan="Enterprise"
                            price={<span className="text-4xl font-extrabold">Contact Us</span>}
                            students="Unlimited Students"
                            features={['All Pro Features', 'Custom Integrations', 'Dedicated Account Manager', 'On-Premise Option', 'Custom Branding']}
                            delay="delay-200"
                            onClick={handlePlanClick}
                        />
                    </div>
                </div>
            </section>

             {/* Special Acknowledgments Section */}
             <section className="py-16 bg-gradient-to-b from-white to-indigo-50 dark:from-gray-900 dark:to-gray-800 relative">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className="inline-block p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
                            <AcademicCapIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                            Special Acknowledgments
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            We extend our heartfelt gratitude to the visionary institutions and individuals who made this project possible through their invaluable contributions.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <AcknowledgmentCard 
                            title="Phone No & WhatsApp 9827792360"
                            description={
                                <>
                                    Located in <strong>Beldandi Rural Municipality - 5</strong>. Their enthusiastic collaboration and pilot testing were crucial for refining our system.
                                </>
                            }
                            role="Call Owner (Winner) Designed & Built By"
                            person="Man Singh Rana"
                            imageSrc="/photos/photo2.jpg"
                            
                            delay="delay-100"
                        />
                        <AcknowledgmentCard 
                            title="Saraswati Janata Secondary School"
                            description={
                                <>
                                    Located in <strong>Beldandi Rural Municipality - 4</strong>. Their enthusiastic collaboration and pilot testing were crucial for refining our system.
                                </>
                            }
                            role="Head Sir"
                            person="Deepak B.C."
                            imageSrc="https://lh3.googleusercontent.com/pw/AP1GczMLEmnC_K1oTVwLiyrm37Nkkz9mYr6H2WJ9VBiwyYX-hmmt2InJfqkj4g2K1FycJf1VCsauSvRrSFZkl49BXCYXB9sOjSWMKQZ3npwSE3zWNoj-fCc=w1920-h1080"
                            delay="delay-100"
                        />
                         <AcknowledgmentCard 
                            
                            title="Ganesh Secondary School Bursa"
                            description={
                                <>
                                    Located in <strong>Beldandi Rural Municipality - 5</strong>. Their continuous support, valuable feedback, and alignment with the municipal vision were vital.
                                </>
                            }
                            role="Key Support"
                            person="Janak Bahadur Thapa"
                            imageSrc="https://lh3.googleusercontent.com/pw/AP1GczPim_xHO_2euH749swydNe8A-TUhVoOePKx_ER5QhymsR9PkNgNMXx2NIFziX1SrIfaQDXyNQBGqbJjPm8DDR6_E3sl9ZtGFbtWrC0V3yb5huJ05dA=w1920-h1080"
                            delay="delay-200"
                        />
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-10 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto bg-gray-50 dark:bg-gray-800 rounded-[3rem] p-12 md:p-20 text-center shadow-inner">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
                            About {appSettings.appName}
                        </h2>
                        <div className="prose prose-lg mx-auto text-gray-600 dark:text-gray-300 leading-relaxed">
                            <p className="mb-8 text-xl">
                                {appSettings.appName} was built to simplify the complex and time-consuming process of result management for schools in Nepal. 
                            </p>
                            <p className="text-base md:text-lg">
                                Our mission is to provide an <span className="font-bold text-primary-600 dark:text-primary-400">affordable, easy-to-use, and powerful tool</span> that empowers educators to focus on what matters most: teaching. We are committed to strictly adhering to the standards set by the <span className="font-semibold">National Examinations Board (NEB)</span> to ensure accuracy and compliance.
                            </p>
                        </div>
                         <div className="mt-12 flex justify-center space-x-4">
                            <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                            <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                            <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Payment Modal */}
            <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Subscribe to Plan">
                <div className="text-center p-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Payment Options</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                        Scan the QR code below or contact us directly to activate your subscription.
                    </p>
                    
                    <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-8">
                        {/* eSewa QR */}
                        <div className="flex flex-col items-center">
                            <div className="bg-white p-2 rounded-xl shadow-lg border-4 border-gray-100 dark:border-gray-700 mb-2 transition-transform hover:scale-105">
                                <img 
                                    src="https://lh3.googleusercontent.com/pw/AP1GczN-QvEezBXPlzu34SYk5E4H2i0SV0BUUl3JQXnabr8lXT8rdBnT6qZCoeaOdR4A__85GBaPYpHAMblQwrGI6QcxdC0HUkYyKxMgVGDDnsdTlaQUfF4=w1920-h1080" 
                                    alt="eSewa QR Code" 
                                    className="w-48 h-48 object-contain"
                                />
                            </div>
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-semibold">
                                eSewa Accepted
                            </span>
                        </div>

                        {/* NMB Bank QR */}
                        <div className="flex flex-col items-center">
                            <div className="bg-white p-2 rounded-xl shadow-lg border-4 border-gray-100 dark:border-gray-700 mb-2 transition-transform hover:scale-105">
                                <img 
                                    src="https://lh3.googleusercontent.com/pw/AP1GczP9Oh5bIDRugKd-ADA0Qw2mrO028OueR9ZHMc4o-0xjVBE8SksTvbQbbHXVCxcmDFLBMdVOVMNPZZ_EkM3RgIUF6NZyG26tidBj8tXBjRiw5FVNVWE=w1920-h1080" 
                                    alt="NMB Bank QR Code" 
                                    className="w-48 h-48 object-contain"
                                />
                            </div>
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-semibold">
                                NMB Bank Accepted
                            </span>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-100 dark:border-gray-600">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Contact for Activation</p>
                        <p className="text-2xl font-extrabold text-primary-600 dark:text-primary-400 tracking-tight">9827792360</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">Call Owner (Winner)</p>
                    </div>
                    
                    <div className="mt-6">
                        <Button variant="secondary" onClick={() => setIsPaymentModalOpen(false)} className="w-full">
                            Close
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default HomePage;
