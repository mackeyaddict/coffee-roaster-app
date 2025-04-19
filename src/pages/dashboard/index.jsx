import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import {
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Card, Spin, Statistic, Alert } from "antd";
import { rtdb } from "../../../firebase";

export default function Dashboard() {
  const [temperatureData, setTemperatureData] = useState([]);
  const [currentTemp, setCurrentTemp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reference to the temperature data in the Realtime Database
    const temperatureRef = ref(rtdb, '/');
    
    // Listen for changes to the temperature data
    const unsubscribe = onValue(temperatureRef, (snapshot) => {
      try {
        const data = snapshot.val();
        console.log("Fetched data:", data); // For debugging
        
        if (data) {
          // Handle the temperature value shown in the screenshot
          if (typeof data.temperature === 'number') {
            setCurrentTemp(data.temperature);
            
            // Add the current reading to our time series with a timestamp
            const newReading = {
              time: new Date().toLocaleTimeString(),
              temperature: data.temperature
            };
            
            setTemperatureData(prev => {
              // Keep a reasonable number of data points (e.g., last 20)
              const updatedData = [...prev, newReading].slice(-20);
              return updatedData;
            });
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching temperature data:", err);
        setError("Failed to load temperature data");
        setLoading(false);
      }
    }, (error) => {
      console.error("Database error:", error);
      setError("Database connection error");
      setLoading(false);
    });

    // Clean up the listener when component unmounts
    return () => {
      // Note: For Firebase Realtime Database, you typically don't need to call unsubscribe()
      // The onValue function returns a function to unsubscribe
      unsubscribe();
    };
  }, []);

  // Generate initial data with the current temperature if we have it
  useEffect(() => {
    if (currentTemp !== null && temperatureData.length === 0) {
      // Create some initial data points based on the current temperature
      const initialData = Array.from({ length: 5 }, (_, i) => ({
        time: new Date(Date.now() - (i * 5 * 60000)).toLocaleTimeString(),
        temperature: currentTemp + (Math.random() * 2 - 1) // Random variation of ±1°C
      })).reverse();
      
      setTemperatureData(initialData);
    }
  }, [currentTemp]);

  // Fallback data in case we have no temperature readings yet
  const dataToDisplay = temperatureData.length > 0 ? temperatureData : [
    { time: "12:00 PM", temperature: 18.5 },
    { time: "1:00 PM", temperature: 19.2 },
    { time: "2:00 PM", temperature: 20.1 },
    { time: "3:00 PM", temperature: 21.0 },
    { time: "4:00 PM", temperature: 20.5 },
    { time: "5:00 PM", temperature: 19.8 }
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header Section */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Temperature Dashboard</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <Alert 
            message="Error" 
            description={error}
            type="error" 
            showIcon 
            className="mb-6"
          />
        )}

        {/* Current Temperature Card */}
        <div className="mb-6">
          <Card className="shadow-md">
            {loading ? (
              <div className="flex justify-center py-8">
                <Spin size="large" />
              </div>
            ) : (
              <div className="flex flex-col items-center p-4">
                <h2 className="text-lg text-gray-500 mb-2">Current Temperature</h2>
                <Statistic 
                  value={currentTemp !== null ? currentTemp : "--"} 
                  suffix="°C"
                  valueStyle={{ fontSize: '3rem', color: '#1890ff' }} 
                />
              </div>
            )}
          </Card>
        </div>

        {/* Temperature Chart Card */}
        <Card title="Temperature History" className="shadow-md mb-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spin size="large" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={dataToDisplay} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1890ff" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']} 
                  label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }} 
                />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#1890ff" 
                  fillOpacity={1} 
                  fill="url(#temperatureGradient)" 
                  name="Temperature" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-md">
            <Statistic 
              title="Min Temperature" 
              value={dataToDisplay.length ? Math.min(...dataToDisplay.map(item => item.temperature)).toFixed(1) : "--"} 
              suffix="°C"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
          <Card className="shadow-md">
            <Statistic 
              title="Max Temperature" 
              value={dataToDisplay.length ? Math.max(...dataToDisplay.map(item => item.temperature)).toFixed(1) : "--"} 
              suffix="°C"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
          <Card className="shadow-md">
            <Statistic 
              title="Avg Temperature" 
              value={dataToDisplay.length ? 
                (dataToDisplay.reduce((sum, item) => sum + item.temperature, 0) / dataToDisplay.length).toFixed(1) 
                : "--"} 
              suffix="°C"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </div>
      </main>
    </div>
  );
}