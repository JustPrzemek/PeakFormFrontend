// src/components/statistics/CardioDistanceChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ChartContainer from './ChartContainer';

export default function CardioDistanceChart({ data, loading }) {
    return (
        <ChartContainer title="Cardio Distance" loading={loading}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="date" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '5px' }} 
                    labelStyle={{ color: '#fff' }} 
                    formatter={(value) => [`${value.toFixed(1)} km`, "Distance"]}
                />
                <Legend />
                <Line type="monotone" dataKey="value" name="Distance (km)" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
        </ChartContainer>
    );
}