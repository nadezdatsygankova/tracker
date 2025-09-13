// TemperatureChart.jsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function TemperatureChart({ data }) {
  const chartData = data
    .filter((entry) => entry.temperature)
    .map((entry) => ({
      date: entry.date.slice(5), // формат MM-DD
      temperature: parseFloat(entry.temperature),
    }));

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[35.5, 37.5]} tickCount={5} unit="°C" />
          <Tooltip formatter={(value) => `${value}°C`} />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
