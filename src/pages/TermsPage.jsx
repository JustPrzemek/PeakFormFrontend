// src/pages/TermsPage.jsx
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Footer from '../components/Footer';

/**
 * Strona Warunków Użytkowania (Terms of Service).
 * 
 * Zawiera:
 * - Regulamin użytkowania aplikacji
 * - Prawa i obowiązki użytkowników
 * - Ograniczenia odpowiedzialności
 * - Zasady korzystania z serwisu
 */
export default function TermsPage() {
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
                    <h1 className="text-5xl font-bold text-whitePrimary mb-4">Terms of Service</h1>
                    <p className="text-borderGrayHover">
                        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Główna treść */}
                <div className="space-y-8">
                    {/* Wprowadzenie */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <p className="text-borderGrayHover leading-relaxed">
                            Welcome to PeakForm. By accessing or using our service, you agree to be bound by these Terms of Service. 
                            If you disagree with any part of these terms, you may not access the service.
                        </p>
                    </section>

                    {/* Akceptacja warunków */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-whitePrimary mb-4">Acceptance of Terms</h2>
                        <p className="text-borderGrayHover leading-relaxed">
                            By creating an account or using PeakForm, you acknowledge that you have read, understood, and agree to 
                            be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, 
                            please do not use our service.
                        </p>
                    </section>

                    {/* Użytkowanie serwisu */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-whitePrimary mb-4">Use of Service</h2>
                        <div className="space-y-4 text-borderGrayHover">
                            <div>
                                <h3 className="text-xl font-semibold text-whitePrimary mb-2">Eligibility</h3>
                                <p className="leading-relaxed">
                                    You must be at least 13 years old to use PeakForm. By using our service, you represent and warrant 
                                    that you meet this age requirement.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-whitePrimary mb-2">Account Responsibility</h3>
                                <p className="leading-relaxed">
                                    You are responsible for maintaining the confidentiality of your account credentials and for all 
                                    activities that occur under your account. You agree to notify us immediately of any unauthorized 
                                    use of your account.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Zasady użytkowania */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-whitePrimary mb-4">User Conduct</h2>
                        <p className="text-borderGrayHover leading-relaxed mb-4">
                            You agree not to:
                        </p>
                        <ul className="space-y-3 text-borderGrayHover list-disc list-inside leading-relaxed">
                            <li>Use the service for any illegal purpose or in violation of any laws</li>
                            <li>Harass, abuse, or harm other users</li>
                            <li>Impersonate any person or entity</li>
                            <li>Upload or transmit viruses or malicious code</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Interfere with or disrupt the service or servers</li>
                            <li>Use automated systems to access the service without permission</li>
                        </ul>
                    </section>

                    {/* Własność intelektualna */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-whitePrimary mb-4">Intellectual Property</h2>
                        <p className="text-borderGrayHover leading-relaxed">
                            All content, features, and functionality of PeakForm, including but not limited to text, graphics, logos, 
                            and software, are the exclusive property of PeakForm and are protected by copyright, trademark, and other 
                            intellectual property laws. You may not reproduce, distribute, or create derivative works without our 
                            express written permission.
                        </p>
                    </section>

                    {/* Zawartość użytkownika */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-whitePrimary mb-4">User Content</h2>
                        <p className="text-borderGrayHover leading-relaxed">
                            You retain ownership of any content you post or upload to PeakForm. By posting content, you grant us a 
                            worldwide, non-exclusive, royalty-free license to use, reproduce, and display your content in connection 
                            with the service. You are solely responsible for the content you post and represent that you have all 
                            necessary rights to do so.
                        </p>
                    </section>

                    {/* Ograniczenie odpowiedzialności */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-whitePrimary mb-4">Limitation of Liability</h2>
                        <p className="text-borderGrayHover leading-relaxed">
                            PeakForm is provided "as is" without warranties of any kind. We do not guarantee that the service will 
                            be uninterrupted, secure, or error-free. We are not liable for any indirect, incidental, or consequential 
                            damages arising from your use of the service. Our total liability shall not exceed the amount you paid 
                            for the service in the past 12 months.
                        </p>
                    </section>

                    {/* Porady medyczne */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-whitePrimary mb-4">Medical Disclaimer</h2>
                        <p className="text-borderGrayHover leading-relaxed">
                            PeakForm provides fitness and nutrition information for educational purposes only. This information is not 
                            intended as medical advice, diagnosis, or treatment. Always consult with a qualified healthcare professional 
                            before starting any fitness or nutrition program, especially if you have any medical conditions or concerns.
                        </p>
                    </section>

                    {/* Zmiany w warunkach */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-whitePrimary mb-4">Changes to Terms</h2>
                        <p className="text-borderGrayHover leading-relaxed">
                            We reserve the right to modify these Terms of Service at any time. We will notify users of any material 
                            changes by posting the updated terms on this page and updating the "Last updated" date. Your continued 
                            use of the service after such changes constitutes acceptance of the new terms.
                        </p>
                    </section>

                    {/* Zakończenie konta */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-whitePrimary mb-4">Termination</h2>
                        <p className="text-borderGrayHover leading-relaxed">
                            We reserve the right to suspend or terminate your account at any time, with or without cause or notice, 
                            for any reason, including violation of these Terms of Service. You may also terminate your account at 
                            any time by contacting us or using the account deletion feature in your settings.
                        </p>
                    </section>

                    {/* Kontakt */}
                    <section className="bg-surfaceDarkGray rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-whitePrimary mb-4">Contact Information</h2>
                        <p className="text-borderGrayHover leading-relaxed">
                            If you have questions about these Terms of Service, please contact us at:{' '}
                            <a href="mailto:legal@peakform.com" className="text-bluePrimary hover:underline">
                                legal@peakform.com
                            </a>
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}

