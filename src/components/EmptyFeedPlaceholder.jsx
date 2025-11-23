import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserPlus, FaDumbbell, FaChartLine } from 'react-icons/fa';

const EmptyFeedPlaceholder = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 my-4 shadow-lg text-center border border-gray-100 dark:border-gray-700">
            
            {/* Nagłówek powitalny */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Witaj w Peak Form! 👋
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Twój feed jest na razie pusty, ale to dopiero początek Twojej drogi. Oto jak możesz zacząć:
                </p>
            </div>

            {/* Sekcja 3 kroków - co robi aplikacja */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left md:text-center">
                
                {/* Krok 1: Społeczność */}
                <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3 text-blue-600 dark:text-blue-400">
                        <FaUserPlus size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Znajdź znajomych</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Obserwuj innych, aby widzieć ich treści.
                    </p>
                </div>

                {/* Krok 2: Treningi */}
                <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-3 text-green-600 dark:text-green-400">
                        <FaDumbbell size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Dodaj Trening</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Twórz plany treningowe.
                    </p>
                </div>

                {/* Krok 3: Postępy */}
                <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-3 text-purple-600 dark:text-purple-400">
                        <FaChartLine size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Śledź Progres</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Analizuj swoje wyniki i pobijaj rekordy.
                    </p>
                </div>
            </div>

            {/* Główny przycisk akcji (Call to Action) */}
            <div>
                <Link
                    to="/training" // Zmień na ścieżkę, gdzie wyszukujesz użytkowników
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-bluePrimary hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                    <FaDumbbell className="-ml-1 mr-2 h-5 w-5" />
                    Zarządzaj swoimi treningami tutaj
                </Link>
                
                <div className="mt-4">
                    <Link to="/nutrition" className="text-sm text-bluePrimary hover:underline dark:text-blue-400">
                        lub posiłkami tutaj.
                    </Link>
                </div>

                <div className="mt-4 text-sm text-bluePrimary dark:text-blue-400">
                    Dodawaj posty i dziel się swoimi osiągnięciami ze społecznością! Wyszukaj znajomych na pasku powyżej.
                </div>
                
            </div>
        </div>
    );
};

export default EmptyFeedPlaceholder;