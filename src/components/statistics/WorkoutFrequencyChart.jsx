// src/components/statistics/WorkoutFrequencyChart.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ChartContainer from './ChartContainer';

export default function WorkoutFrequencyChart({ data, loading }) {
    return (
        <ChartContainer title="Częstotliwość Treningów" loading={loading}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="date" stroke="#aaa" />
                <YAxis allowDecimals={false} stroke="#aaa" />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '5px' }} 
                    labelStyle={{ color: '#fff' }} 
                />
                <Legend />
                <Bar dataKey="value" name="Liczba sesji" fill="#3b82f6" />
            </BarChart>
        </ChartContainer>
    );
}