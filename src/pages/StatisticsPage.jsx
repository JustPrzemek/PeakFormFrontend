// src/pages/StatisticsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { FaArrowLeft, FaDumbbell, FaClock, FaWeightHanging, FaListOl, FaRunning } from 'react-icons/fa';

// Import serwisu API
import {
    getKpiSummary,
    getWorkoutFrequency,
    getTotalVolume,
    getCardioDistance,
    getMuscleGroupDistribution
} from '../services/statisticsService';

// Import komponentów
import KpiCard from '../components/statistics/KpiCard';
import WorkoutFrequencyChart from '../components/statistics/WorkoutFrequencyChart';
import TotalVolumeChart from '../components/statistics/TotalVolumeChart';
import CardioDistanceChart from '../components/statistics/CardioDistanceChart';
import MuscleDistributionChart from '../components/statistics/MuscleDistributionChart';
// Import komponentu do progresji (na razie go nie implementujemy, ale jest miejsce)
// import ProgressionChart from '../components/statistics/ProgressionChart';

export default function StatisticsPage() {
    const navigate = useNavigate();

    // Domyślny stan: ostatnie 30 dni
    const [startDate, setStartDate] = useState(subDays(new Date(), 30));
    const [endDate, setEndDate] = useState(new Date());

    // Stany na dane
    const [kpiData, setKpiData] = useState(null);
    const [frequencyData, setFrequencyData] = useState([]);
    const [volumeData, setVolumeData] = useState([]);
    const [cardioData, setCardioData] = useState([]);
    const [muscleData, setMuscleData] = useState([]);

    // Stany ładowania
    const [loadingKpi, setLoadingKpi] = useState(true);
    const [loadingCharts, setLoadingCharts] = useState(true);

    // Efekt do pobierania danych, gdy zmieni się zakres dat
    useEffect(() => {
        const fetchData = async () => {
            // Ustawiamy dokładne godziny dla zapytań
            const apiStartDate = startOfDay(startDate);
            const apiEndDate = endOfDay(endDate);

            setLoadingKpi(true);
            setLoadingCharts(true);

            // Pobieranie KPI
            getKpiSummary(apiStartDate, apiEndDate)
                .then(setKpiData)
                .catch(err => toast.error(`KPI: ${err}`))
                .finally(() => setLoadingKpi(false));

            // Pobieranie danych do wykresów równolegle
            Promise.all([
                getWorkoutFrequency(apiStartDate, apiEndDate),
                getTotalVolume(apiStartDate, apiEndDate),
                getCardioDistance(apiStartDate, apiEndDate),
                getMuscleGroupDistribution(apiStartDate, apiEndDate)
            ]).then(([freq, vol, cardio, muscle]) => {
                setFrequencyData(freq);
                setVolumeData(vol);
                setCardioData(cardio);
                setMuscleData(muscle);
            }).catch(err => {
                toast.error(`Wykresy: ${err}`);
                // Zerowanie danych w razie błędu
                setFrequencyData([]);
                setVolumeData([]);
                setCardioData([]);
                setMuscleData([]);
            }).finally(() => {
                setLoadingCharts(false);
            });
        };

        if (startDate && endDate) {
            fetchData();
        }
    }, [startDate, endDate]);

    // Funkcje pomocnicze do formatowania KPI
    const formatDuration = (seconds) => {
        if (!seconds) return '0h 0m';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const formatVolume = (volume) => {
        if (!volume) return '0';
        return (volume / 1000).toFixed(1); // w tonach
    };

    const formatDistance = (distance) => {
        if (!distance) return '0';
        return distance.toFixed(1); // w km
    };

    return (
        <div className="min-h-screen bg-backgoudBlack text-whitePrimary p-4 sm:p-8">
            <div className="w-full max-w-7xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-block mb-8 text-bluePrimary"
                    aria-label="go back"
                >
                    <FaArrowLeft className="text-4xl cursor-pointer transition-transform duration-300 hover:scale-110" />
                </button>

                <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
                    <h1 className="text-4xl font-bold text-center sm:text-left mb-4 sm:mb-0">
                        Statistics
                    </h1>
                    {/* Selektor daty */}
                    <div className="z-10">
                        <DatePicker
                            selectsRange={true}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => {
                                const [start, end] = update;
                                setStartDate(start);
                                setEndDate(end);
                            }}
                            dateFormat="dd.MM.yyyy"
                            className="bg-neutral-800 text-whitePrimary p-3 rounded-lg text-center w-64 border border-borderGrayHover focus:outline-none focus:border-bluePrimary"
                            calendarClassName="bg-neutral-800"
                            dayClassName={() => "text-whitePrimary hover:bg-neutral-700"}
                            popperPlacement="bottom-end"
                        />
                    </div>
                </div>

                {/* Section KPI */}
                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4 text-whitePrimary">Summary of the period</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                        <KpiCard 
                            title="Treningi" 
                            value={kpiData?.totalWorkouts || '0'} 
                            icon={<FaDumbbell size={20} />} 
                            loading={loadingKpi} 
                        />
                        <KpiCard 
                            title="Duration" 
                            value={formatDuration(kpiData?.totalDurationSeconds)} 
                            icon={<FaClock size={20} />} 
                            loading={loadingKpi}
                        />
                        <KpiCard 
                            title="Volume" 
                            value={formatVolume(kpiData?.totalVolume)} 
                            unit="t"
                            icon={<FaWeightHanging size={20} />} 
                            loading={loadingKpi} 
                        />
                        <KpiCard 
                            title="Sets" 
                            value={kpiData?.totalSets || '0'} 
                            icon={<FaListOl size={20} />} 
                            loading={loadingKpi} 
                        />
                        <KpiCard 
                            title="Cardio Distance" 
                            value={formatDistance(kpiData?.totalDistanceKm)} 
                            unit="km"
                            icon={<FaRunning size={20} />} 
                            loading={loadingKpi} 
                        />
                    </div>
                </section>

                {/* Section Charts */}
                <section>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <WorkoutFrequencyChart data={frequencyData} loading={loadingCharts} />
                        <TotalVolumeChart data={volumeData} loading={loadingCharts} />
                        <CardioDistanceChart data={cardioData} loading={loadingCharts} />
                        <MuscleDistributionChart data={muscleData} loading={loadingCharts} />

                        {/* Miejsce na wykres progresji - wymaga selektora ćwiczeń */}
                        {/* <ProgressionChart dateRange={[startDate, endDate]} /> */}
                    </div>
                </section>
            </div>
        </div>
    );
}