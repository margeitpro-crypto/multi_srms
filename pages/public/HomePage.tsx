
import React from 'react';
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

const PricingCard: React.FC<{ plan: string; price: React.ReactNode; students: string; features: string[], isPopular?: boolean, buttonText?: string, delay: string }> = ({ plan, price, students, features, isPopular = false, buttonText = "Choose Plan", delay }) => (
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
        >
            {buttonText}
        </Button>
    </div>
);

const AcknowledgmentCard: React.FC<{ title: string; description: React.ReactNode; role?: string; person?: string; delay: string }> = ({ title, description, role, person, delay }) => (
    <div className={`bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-500 hover:-translate-y-1 h-full flex flex-col text-center items-center animate-slide-in-up ${delay}`}>
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-3xl mb-6 shadow-lg shadow-indigo-500/30 text-white">
            🏛️
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-grow px-2">
            {description}
        </div>
        {(person || role) && (
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 w-full">
                {role && <p className="text-xs text-indigo-500 dark:text-indigo-400 uppercase tracking-wider font-bold mb-1">{role}</p>}
                {person && <p className="text-lg font-bold text-gray-800 dark:text-white">{person}</p>}
            </div>
        )}
    </div>
);

const HomePage: React.FC = () => {
    const navigate = useNavigate();

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
                             School's Result <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 animate-gradient-x">
                                Management System
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
            <section id="features" className="py-32 bg-white dark:bg-gray-900 relative">
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
                        />
                        <PricingCard
                            plan="Pro"
                            price={<div><span className="text-2xl font-bold text-primary-200 mr-1">Rs.</span> <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-purple-600">5,000</span></div>}
                            students="Up to 2000 Students"
                            features={['All Core Features', 'Priority 24/7 Support', 'Real-time Backups', 'Admin Viewer Access', 'Advanced Analytics']}
                            isPopular={true}
                            buttonText="Get Started"
                            delay="delay-100"
                        />
                        <PricingCard
                            plan="Enterprise"
                            price={<span className="text-4xl font-extrabold">Contact Us</span>}
                            students="Unlimited Students"
                            features={['All Pro Features', 'Custom Integrations', 'Dedicated Account Manager', 'On-Premise Option', 'Custom Branding']}
                            delay="delay-200"
                        />
                    </div>
                </div>
            </section>

             {/* Special Acknowledgments Section */}
             <section className="py-32 bg-gradient-to-b from-white to-indigo-50 dark:from-gray-900 dark:to-gray-800 relative">
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
                            title="Beldandi Rural Municipality"
                            description={
                                <>
                                    Our primary and <strong className="text-indigo-600 dark:text-indigo-400">overarching partner</strong>. For their generous support and commitment to advancing education technology across the region.
                                </>
                            }
                            delay="delay-0"
                        />
                        <AcknowledgmentCard 
                            title="Saraswati Janata Secondary School"
                            description={
                                <>
                                    Located in <strong>Beldandi Rural Municipality - 4</strong>. Their enthusiastic collaboration and pilot testing were crucial for refining our system.
                                </>
                            }
                            role="Head Sir"
                            person="Dependra Budha"
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
                            delay="delay-200"
                        />
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-32 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto bg-gray-50 dark:bg-gray-800 rounded-[3rem] p-12 md:p-20 text-center shadow-inner">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
                            About ResultSys
                        </h2>
                        <div className="prose prose-lg mx-auto text-gray-600 dark:text-gray-300 leading-relaxed">
                            <p className="mb-8 text-xl">
                                ResultSys was built to simplify the complex and time-consuming process of result management for schools in Nepal. 
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
        </div>
    );
};

export default HomePage;
