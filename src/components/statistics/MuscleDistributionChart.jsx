// src/components/statistics/MuscleDistributionChart.jsx
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import ChartContainer from './ChartContainer';

// Definicja kolorów dla wykresu
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export default function MuscleDistributionChart({ data, loading }) {
    // Recharts potrzebuje, aby dane miały klucz 'value'
    const chartData = data.map(item => ({ name: item.label, value: item.value }));

    return (
        <ChartContainer title="Rozkład Grup Mięśniowych (serie)" loading={loading}>
            <PieChart>
                <Tooltip 
                    contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '5px' }} 
                    labelStyle={{ color: '#fff' }} 
                />
                <Legend />
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
            </PieChart>
        </ChartContainer>
    );
}