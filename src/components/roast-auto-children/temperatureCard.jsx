import { Card, Tooltip } from "antd";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useSelector } from "react-redux";

export default function TemperatureCard() {
  const { tempHistory, dropTargetTemp } = useSelector(state => state.roast);
  
  return (
    <div>
      <Card title="Temperature History" className="shadow-md mb-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={tempHistory}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="elapsed"
                label={{ value: 'Time (seconds)', position: 'insideBottomRight', offset: -5 }}
              />
              <YAxis
                label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                domain={['dataMin - 5', 'dataMax + 20']}
              />
              <Tooltip formatter={(value, name) => {
                if (name === 'temp') return [`${value}°C`, 'Temperature'];
                if (name === 'target') return [`${value}°C`, 'Target'];
                return [value, name];
              }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#ff7300"
                name="Temperature"
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
              {dropTargetTemp > 0 && (
                <Line
                  type="monotone"
                  dataKey={() => dropTargetTemp}
                  stroke="#82ca9d"
                  name="Drop Target"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title="Temperature History" className="shadow-md mb-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={tempHistory}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="elapsed"
                label={{ value: 'Time (seconds)', position: 'insideBottomRight', offset: -5 }}
              />
              <YAxis
                label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                domain={['dataMin - 5', 'dataMax + 20']}
              />
              <Tooltip formatter={(value, name) => {
                if (name === 'temp') return [`${value}°C`, 'Temperature'];
                if (name === 'target') return [`${value}°C`, 'Target'];
                return [value, name];
              }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#ff7300"
                name="Temperature"
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
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>

  );
}