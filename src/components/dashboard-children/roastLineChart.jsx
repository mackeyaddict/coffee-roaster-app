import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Brush,
  ReferenceArea
} from 'recharts';
import { Card, Radio, Switch, Tag, Button, Alert, Empty, Spin, Space, Typography, Divider } from 'antd';
import { CoffeeOutlined, QuestionCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Coffee } from 'lucide-react';

const { Title, Text, Paragraph } = Typography;

// Custom tooltip for better data visualization
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Card size="small" className="border border-gray-200 shadow-lg" bodyStyle={{ padding: '12px' }}>
        <Text strong>{payload[0]?.payload.name}</Text>
        <div className="mt-1">
          <Text className="text-gray-700">
            Duration: <Text strong>{payload[0]?.payload.duration} minutes</Text>
          </Text>
        </div>
        <div>
          <Text className="text-gray-700">
            Drop Temp: <Text strong>{payload[0]?.payload.dropTemperature}°C</Text>
          </Text>
        </div>
        <div>
          <Text className="text-gray-700">
            Roast Level: <Text strong>{payload[0]?.payload.roastLevel}</Text>
          </Text>
        </div>
      </Card>
    );
  }
  return null;
};

export default function RoastLineChart({ roastProfiles, loading = false }) {
  const [chartType, setChartType] = useState('scatter');
  const [showLightRoasts, setShowLightRoasts] = useState(true);
  const [showMediumRoasts, setShowMediumRoasts] = useState(true);
  const [showDarkRoasts, setShowDarkRoasts] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  if (loading) {
    return (
      <Card className="w-full h-64 flex items-center justify-center">
        <Spin tip="Loading roast profiles..." />
      </Card>
    );
  }

  if (!roastProfiles || roastProfiles.length === 0) {
    return (
      <Card className="w-full">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No roast profiles available"
        />
      </Card>
    );
  }

  // Process data for the chart
  const chartData = roastProfiles.map((profile) => ({
    name: profile.name || 'Unnamed Profile',
    dropTemperature: profile.dropTemperature,
    duration: profile.duration,
    roastLevel: profile.roastLevel || 'Unknown',
  }));

  // Filter data based on roast level selections
  const filteredData = chartData.filter(data => {
    if (data.roastLevel === 'Light' && !showLightRoasts) return false;
    if (data.roastLevel === 'Medium' && !showMediumRoasts) return false;
    if (data.roastLevel === 'Dark' && !showDarkRoasts) return false;
    return true;
  });

  // Different colors for different roast levels
  const getPointColor = (entry) => {
    switch (entry.roastLevel) {
      case 'Light':
        return '#DAA520'; // Gold
      case 'Medium':
        return '#8B4513'; // Saddle Brown
      case 'Dark':
        return '#3A1700'; // Dark Brown
      default:
        return '#6B7280'; // Gray
    }
  };

  // Define typical roast profiles areas
  const lightRoastArea = { x1: 8, y1: 180, x2: 12, y2: 205 };
  const mediumRoastArea = { x1: 12, y1: 190, x2: 15, y2: 215 };
  const darkRoastArea = { x1: 14, y1: 210, x2: 18, y2: 235 };

  return (
    <Card
      className="w-full shadow-md"
      title={
        <div className="flex gap-2 items-center">
          <Coffee size={24} />
          <p className='text-base font-semibold'>Roast Profile Analysis</p>
        </div>
      }
      extra={
        <Button
          type="text"
          icon={<QuestionCircleOutlined />}
          onClick={() => setShowHelp(!showHelp)}
        >
          Help
        </Button>
      }
    >
      {showHelp && (
        <Alert
          message="How to use this chart"
          description={
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Grafik ini menunjukkan hubungan antara durasi roasting dan suhu akhir (drop temperature).</li>
              <li>Beralih antara tampilan scatter plot dan line chart menggunakan tombol di bawah.</li>
              <li>Filter berdasarkan tingkat roasting (Light, Medium, Dark) untuk mengidentifikasi pola.</li>
              <li>Area berbayang menunjukkan rentang umum untuk berbagai profil roasting.</li>
              <li>Arahkan kursor ke titik data untuk melihat informasi detail dari setiap proses roasting.</li>
            </ul>

          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          className="mb-4"
          closable
        />
      )}


      <div className="flex flex-wrap gap-2 mb-4">
        <Text strong className="mr-2">Filter:</Text>
        <Tag
          color={showLightRoasts ? "#faad14" : "default"}
          onClick={() => setShowLightRoasts(!showLightRoasts)}
          className="cursor-pointer"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1"></span> Light
        </Tag>
        <Tag
          color={showMediumRoasts ? "#d48806" : "default"}
          onClick={() => setShowMediumRoasts(!showMediumRoasts)}
          className="cursor-pointer"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-amber-800 mr-1"></span> Medium
        </Tag>
        <Tag
          color={showDarkRoasts ? "#262626" : "default"}
          onClick={() => setShowDarkRoasts(!showDarkRoasts)}
          className="cursor-pointer"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-black mr-1"></span> Dark
        </Tag>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              type="number"
              dataKey="duration"
              name="Duration"
              unit=" min"
              domain={['dataMin - 1', 'dataMax + 1']}
              label={{ value: 'Durasi (menit)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              type="number"
              dataKey="dropTemperature"
              name="Drop Temperature"
              unit="°C"
              domain={['dataMin - 10', 'dataMax + 10']}
              label={{ value: 'Drop Temperature (°C)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* Show reference areas for typical roast profiles */}
            {showLightRoasts && (
              <ReferenceArea x1={lightRoastArea.x1} x2={lightRoastArea.x2} y1={lightRoastArea.y1} y2={lightRoastArea.y2} stroke="none" fill="#DAA520" fillOpacity={0.15} />
            )}
            {showMediumRoasts && (
              <ReferenceArea x1={mediumRoastArea.x1} x2={mediumRoastArea.x2} y1={mediumRoastArea.y1} y2={mediumRoastArea.y2} stroke="none" fill="#8B4513" fillOpacity={0.15} />
            )}
            {showDarkRoasts && (
              <ReferenceArea x1={darkRoastArea.x1} x2={darkRoastArea.x2} y1={darkRoastArea.y1} y2={darkRoastArea.y2} stroke="none" fill="#3A1700" fillOpacity={0.15} />
            )}

            <Scatter
              name="Roast Profiles"
              data={filteredData}
              fill="#8884d8"
              shape={(props) => {
                const { cx, cy } = props;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={getPointColor(props.payload)}
                    strokeWidth={1}
                    stroke="#FFF"
                  />
                );
              }}
            />
            <Brush dataKey="duration" height={20} stroke="#DAA520" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <Divider className="my-4" />
      <Paragraph type="secondary" className="text-xs">
        Visualisasi ini membantu mengidentifikasi profil roasting yang optimal berdasarkan jenis biji kopi dan cita rasa yang diinginkan.
      </Paragraph>
    </Card>
  );
}