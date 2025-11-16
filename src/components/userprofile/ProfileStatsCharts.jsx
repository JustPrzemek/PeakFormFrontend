// src/components/ProfileStatsCharts.jsx

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { subDays, startOfDay, endOfDay } from 'date-fns';

// Import serwisu API
import {
    getWorkoutFrequency,
    getTotalVolume,
    getCardioDistance,
    getMuscleGroupDistribution
} from '../../services/statisticsService';

// Import komponentów
import WorkoutFrequencyChart from '../statistics/WorkoutFrequencyChart';
import TotalVolumeChart from '../statistics/TotalVolumeChart';
import CardioDistanceChart from '../statistics/CardioDistanceChart';
import MuscleDistributionChart from '../statistics/MuscleDistributionChart';

export default function ProfileStatsCharts() {
    // Domyślny stan: ostatnie 30 dni
    const [startDate] = useState(subDays(new Date(), 30));
    const [endDate] = useState(new Date());

    // Stany na dane
    const [frequencyData, setFrequencyData] = useState([]);
    const [volumeData, setVolumeData] = useState([]);
    const [cardioData, setCardioData] = useState([]);
    const [muscleData, setMuscleData] = useState([]);

    // Stany ładowania
    const [loadingCharts, setLoadingCharts] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const apiStartDate = startOfDay(startDate);
            const apiEndDate = endOfDay(endDate);
            
            setLoadingCharts(true);

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
                setFrequencyData([]);
                setVolumeData([]);
                setCardioData([]);
                setMuscleData([]);
            }).finally(() => {
                setLoadingCharts(false);
            });
        };

        fetchData();
    }, [startDate, endDate]);

    return (
        // Kontener układający wykresy w kolumnie z odstępami
        <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-whitePrimary">
                Podsumowanie aktywności (ostatnie 30 dni)
            </h2>
            <WorkoutFrequencyChart data={frequencyData} loading={loadingCharts} />
            <TotalVolumeChart data={volumeData} loading={loadingCharts} />
            <CardioDistanceChart data={cardioData} loading={loadingCharts} />
            <MuscleDistributionChart data={muscleData} loading={loadingCharts} />
        </div>
    );
}