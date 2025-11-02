// src/components/statistics/TotalVolumeChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ChartContainer from './ChartContainer';

export default function TotalVolumeChart({ data, loading }) {
    return (
        <ChartContainer title="Całkowita Objętość" loading={loading}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="date" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '5px' }} 
                    labelStyle={{ color: '#fff' }} 
                    formatter={(value) => [`${value.toFixed(0)} kg`, "Objętość"]}
                />
                <Legend />
                <Line type="monotone" dataKey="value" name="Objętość (kg)" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
        </ChartContainer>
    );
}