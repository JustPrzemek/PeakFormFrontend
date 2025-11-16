// src/components/ProfileStatisticPanel.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { FaDumbbell, FaClock, FaWeightHanging, FaListOl, FaRunning } from 'react-icons/fa';

// Import serwisu API
import { getKpiSummary } from '../../services/statisticsService';

// Import komponentu
import KpiCard from '../statistics/KpiCard'; // Upewnij się, że ścieżka jest poprawna

// Funkcje pomocnicze skopiowane ze StatisticsPage
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

export default function ProfileStatisticPanel() {
    const navigate = useNavigate();
    const [kpiData, setKpiData] = useState(null);
    const [loadingKpi, setLoadingKpi] = useState(true);

    // Domyślny stan: ostatnie 30 dni
    const [startDate] = useState(subDays(new Date(), 30));
    const [endDate] = useState(new Date());

    useEffect(() => {
        const fetchData = async () => {
            const apiStartDate = startOfDay(startDate);
            const apiEndDate = endOfDay(endDate);

            setLoadingKpi(true);
            getKpiSummary(apiStartDate, apiEndDate)
                .then(setKpiData)
                .catch(err => toast.error(`Panel KPI: ${err}`))
                .finally(() => setLoadingKpi(false));
        };

        fetchData();
    }, [startDate, endDate]);

    const handleNavigate = () => {
        navigate('/training/statistic');
    };

    return (
        // Cały panel jest klikalny i ma styl podobny do ProfileTabs
        <div 
            onClick={handleNavigate}
            className="flex flex-col bg-surfaceDarkGray rounded-2xl p-6 gap-4 cursor-pointer transition-colors hover:bg-borderGrayHover/30"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && handleNavigate()}
        >
            <h3 className="text-lg font-semibold text-whitePrimary mb-2">Moja Aktywność (30 dni)</h3>
            
            {/* Używamy mniejszej siatki (2 kolumny) dla kompaktowego wyglądu.
              Karta "Serie" jest mniej ważna, więc ją pomijamy dla oszczędności miejsca.
            */}
            <div className="flex flex-col gap-3">
                <KpiCard 
                    title="Treningi" 
                    value={kpiData?.totalWorkouts || '0'} 
                    icon={<FaDumbbell size={18} />} 
                    loading={loadingKpi} 
                    isCompact // Możesz dodać prop 'isCompact' do KpiCard, aby zmniejszyć padding/font
                />
                <KpiCard 
                    title="Czas" 
                    value={formatDuration(kpiData?.totalDurationSeconds)} 
                    icon={<FaClock size={18} />} 
                    loading={loadingKpi}
                    isCompact
                />
                <KpiCard 
                    title="Objętość" 
                    value={formatVolume(kpiData?.totalVolume)} 
                    unit="t"
                    icon={<FaWeightHanging size={18} />} 
                    loading={loadingKpi} 
                    isCompact
                />
                <KpiCard 
                    title="Dystans" 
                    value={formatDistance(kpiData?.totalDistanceKm)} 
                    unit="km"
                    icon={<FaRunning size={18} />} 
                    loading={loadingKpi} 
                    isCompact
                />
            </div>
            <p className="text-center text-sm text-borderGrayHover mt-2">
                Kliknij, aby zobaczyć pełne statystyki
            </p>
        </div>
    );
}