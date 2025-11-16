// src/pages/AboutPage.jsx
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaDumbbell, FaAppleAlt, FaChartLine, FaUsers } from 'react-icons/fa';
import Footer from '../components/Footer';

/**
 * Strona "O nas" - informacje o aplikacji PeakForm.
 * 
 * Zawiera:
 * - Opis aplikacji i jej celów
 * - Główne funkcjonalności
 * - Misja i wizja
 */
export default function AboutPage() {
    return (
        <div className="bg-backgoudBlack min-h-screen flex flex-col">
            <main className="container mx-auto p-4 sm:p-8 flex-grow max-w-4xl">
                {/* Przycisk powrotu */}
                <Link 
                    to="/home" 
                    className="inline-block mb-8 text-bluePrimary"
                    aria-label="Go back"
                >
                    <FaArrowLeft className="text-4xl cursor-pointer transition-transform duration-300 hover:scale-110" />
                </Link>

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-whitePrimary mb-4">About PeakForm</h1>
                    <p className="text-xl text-borderGrayHover">
                        Your all-in-one fitness and nutrition companion
                    </p>
                </div>

                {/* Główna treść */}
                <div className="space-y-8">
                    {/* Sekcja: Co to jest PeakForm */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-whitePrimary mb-4">What is PeakForm?</h2>
                        <p className="text-borderGrayHover leading-relaxed">
                            PeakForm is a comprehensive fitness and nutrition platform designed to help you achieve your health and fitness goals. 
                            Whether you're looking to build muscle, lose weight, or maintain a healthy lifestyle, PeakForm provides the tools 
                            and insights you need to track your progress and stay motivated.
                        </p>
                    </section>

                    {/* Sekcja: Funkcjonalności */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-whitePrimary mb-6">Key Features</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 bg-bluePrimary/20 p-3 rounded-full">
                                    <FaDumbbell className="text-bluePrimary" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-whitePrimary mb-2">Training Plans</h3>
                                    <p className="text-borderGrayHover">
                                        Create and follow personalized workout plans tailored to your fitness goals.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 bg-bluePrimary/20 p-3 rounded-full">
                                    <FaAppleAlt className="text-bluePrimary" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-whitePrimary mb-2">Nutrition Tracking</h3>
                                    <p className="text-borderGrayHover">
                                        Monitor your daily nutrition intake and track macros to meet your dietary goals.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 bg-bluePrimary/20 p-3 rounded-full">
                                    <FaChartLine className="text-bluePrimary" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-whitePrimary mb-2">Progress Analytics</h3>
                                    <p className="text-borderGrayHover">
                                        Visualize your progress with detailed statistics and charts.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 bg-bluePrimary/20 p-3 rounded-full">
                                    <FaUsers className="text-bluePrimary" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-whitePrimary mb-2">Social Community</h3>
                                    <p className="text-borderGrayHover">
                                        Connect with other fitness enthusiasts and share your journey.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Sekcja: Misja */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-whitePrimary mb-4">Our Mission</h2>
                        <p className="text-borderGrayHover leading-relaxed">
                            At PeakForm, we believe that everyone deserves access to tools that help them live healthier, more active lives. 
                            Our mission is to make fitness and nutrition tracking simple, intuitive, and motivating. We're committed to 
                            providing you with the best possible experience as you work towards your fitness goals.
                        </p>
                    </section>

                    {/* Sekcja: Kontakt */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8 text-center">
                        <h2 className="text-3xl font-bold text-whitePrimary mb-4">Get in Touch</h2>
                        <p className="text-borderGrayHover mb-6">
                            Have questions or feedback? We'd love to hear from you!
                        </p>
                        <p className="text-bluePrimary">
                            Contact us at: <a href="mailto:support@peakform.com" className="hover:underline">support@peakform.com</a>
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}

