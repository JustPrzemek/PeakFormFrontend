// src/pages/PrivacyPage.jsx
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Footer from '../components/Footer';

/**
 * Strona Polityki Prywatności.
 * 
 * Zawiera informacje o:
 * - Jak zbieramy dane użytkowników
 * - Jak używamy danych
 * - Jak chronimy dane
 * - Prawa użytkowników
 */
export default function PrivacyPage() {
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
                    <h1 className="text-5xl font-bold text-whitePrimary mb-4">Privacy Policy</h1>
                    <p className="text-borderGrayHover">
                        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Główna treść */}
                <div className="space-y-8">
                    {/* Wprowadzenie */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <p className="text-borderGrayHover leading-relaxed">
                            At PeakForm, we take your privacy seriously. This Privacy Policy explains how we collect, 
                            use, disclose, and safeguard your information when you use our application.
                        </p>
                    </section>

                    {/* Informacje, które zbieramy */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-whitePrimary mb-4">Information We Collect</h2>
                        <div className="space-y-4 text-borderGrayHover">
                            <div>
                                <h3 className="text-xl font-semibold text-whitePrimary mb-2">Personal Information</h3>
                                <p className="leading-relaxed">
                                    When you create an account, we collect information such as your email address, username, 
                                    and profile information. We may also collect optional information like your age, gender, 
                                    and fitness goals to personalize your experience.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-whitePrimary mb-2">Fitness and Nutrition Data</h3>
                                <p className="leading-relaxed">
                                    We collect data about your workouts, training plans, nutrition logs, and progress metrics. 
                                    This data is stored securely and used to provide you with personalized insights and recommendations.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-whitePrimary mb-2">Usage Information</h3>
                                <p className="leading-relaxed">
                                    We automatically collect information about how you interact with our application, including 
                                    device information, IP address, and usage patterns to improve our services.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Jak używamy informacji */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-whitePrimary mb-4">How We Use Your Information</h2>
                        <ul className="space-y-3 text-borderGrayHover list-disc list-inside leading-relaxed">
                            <li>To provide and maintain our services</li>
                            <li>To personalize your experience and provide relevant content</li>
                            <li>To analyze usage patterns and improve our application</li>
                            <li>To communicate with you about your account and our services</li>
                            <li>To ensure the security and integrity of our platform</li>
                        </ul>
                    </section>

                    {/* Udostępnianie informacji */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-whitePrimary mb-4">Information Sharing</h2>
                        <p className="text-borderGrayHover leading-relaxed mb-4">
                            We do not sell your personal information. We may share your information only in the following circumstances:
                        </p>
                        <ul className="space-y-3 text-borderGrayHover list-disc list-inside leading-relaxed">
                            <li>With your explicit consent</li>
                            <li>To comply with legal obligations</li>
                            <li>To protect our rights and prevent fraud</li>
                            <li>With service providers who assist us in operating our platform (under strict confidentiality agreements)</li>
                        </ul>
                    </section>

                    {/* Bezpieczeństwo danych */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-whitePrimary mb-4">Data Security</h2>
                        <p className="text-borderGrayHover leading-relaxed">
                            We implement industry-standard security measures to protect your information, including encryption, 
                            secure servers, and regular security audits. However, no method of transmission over the internet 
                            is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    {/* Twoje prawa */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-whitePrimary mb-4">Your Rights</h2>
                        <p className="text-borderGrayHover leading-relaxed mb-4">
                            You have the right to:
                        </p>
                        <ul className="space-y-3 text-borderGrayHover list-disc list-inside leading-relaxed">
                            <li>Access and review your personal information</li>
                            <li>Update or correct your information</li>
                            <li>Delete your account and associated data</li>
                            <li>Opt-out of certain data collection practices</li>
                            <li>Request a copy of your data</li>
                        </ul>
                    </section>

                    {/* Cookies */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-whitePrimary mb-4">Cookies and Tracking</h2>
                        <p className="text-borderGrayHover leading-relaxed">
                            We use cookies and similar tracking technologies to enhance your experience, analyze usage, 
                            and assist with our marketing efforts. You can control cookie preferences through your browser settings.
                        </p>
                    </section>

                    {/* Kontakt */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-whitePrimary mb-4">Contact Us</h2>
                        <p className="text-borderGrayHover leading-relaxed">
                            If you have questions about this Privacy Policy or our data practices, please contact us at:{' '}
                            <a href="mailto:privacy@peakform.com" className="text-bluePrimary hover:underline">
                                privacy@peakform.com
                            </a>
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}

