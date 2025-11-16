// src/components/Footer.jsx
import { Link } from 'react-router-dom';

/**
 * Komponent Footer - stopka aplikacji z linkami do ważnych stron.
 * 
 * Zawiera linki do:
 * - About - informacje o aplikacji
 * - Privacy - polityka prywatności
 * - Terms - warunki użytkowania
 */
export default function Footer() {
    return (
        <footer className="py-5 text-center border-t border-surfaceDarkGray">
            <ul className="flex flex-row flex-wrap gap-4 p-2 text-xs items-center justify-center text-borderGrayHover">
                <li>
                    <Link 
                        to="/about" 
                        className="hover:text-bluePrimary transition-colors duration-300"
                    >
                        About
                    </Link>
                </li>
                <li>
                    <Link 
                        to="/privacy" 
                        className="hover:text-bluePrimary transition-colors duration-300"
                    >
                        Privacy
                    </Link>
                </li>
                <li>
                    <Link 
                        to="/terms" 
                        className="hover:text-bluePrimary transition-colors duration-300"
                    >
                        Terms
                    </Link>
                </li>
            </ul>
            <p className="text-xs text-borderGrayHover mt-4">
                © {new Date().getFullYear()} PeakForm. All rights reserved.
            </p>
        </footer>
    );
}