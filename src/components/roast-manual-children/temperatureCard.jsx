import { Card } from "antd";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function TemperatureCard({ tempHistory, maxSafetyTemp }) {
  return (
    <Card title="Riwayat Temperatur" className="shadow-md mb-6">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={tempHistory}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="elapsed"
              label={{ value: 'Waktu (detik)', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis
              label={{ value: 'Temperatur (°C)', angle: -90, position: 'insideLeft' }}
              domain={['dataMin - 5', 'dataMax + 20']}
            />
            <Tooltip formatter={(value, name) => {
              if (name === 'temp') return [`${value}°C`, 'Temperatur'];
              if (name === 'target') return [`${value}°C`, 'Target'];
              return [value, name];
            }} />
            <Legend />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="#ff7300"
              name="Temperatur"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#8884d8"
              name="Target"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
            />
            {maxSafetyTemp && (
              <Line
                type="monotone"
                dataKey={() => maxSafetyTemp}
                stroke="#ff0000"
                name="Batas Aman"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}