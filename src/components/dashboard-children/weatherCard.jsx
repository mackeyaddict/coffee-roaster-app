import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Loader2, Droplets } from 'lucide-react';
import { Result } from 'antd';

export default function WeatherCard({ city = 'Bekasi' }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        // Real implementation using WeatherAPI.com
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${import.meta.env.VITE_API_KEY_WEATHER}&q=${city}&aqi=no`);

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        setWeatherData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching weather data:", err);
        setError("Gagal memuat data cuaca");
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [city]);

  // Get weather icon based on condition code
  const getWeatherIcon = (code) => {
    if (!code) return <Cloud className="h-6 w-6 text-black" />;

    if ([1000].includes(code)) {
      return <Sun className="h-6 w-6 text-black" />;
    }
    // Cloudy / Partly cloudy / Overcast
    else if ([1003, 1006, 1009, 1030, 1135, 1147].includes(code)) {
      return <Cloud className="h-6 w-6 text-black" />;
    }
    // Rain / Drizzle / Mist
    else if ([1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246].includes(code)) {
      return <CloudRain className="h-6 w-6 text-black" />;
    }
    // Snow / Sleet / Ice
    else if ([1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264].includes(code)) {
      return <CloudSnow className="h-6 w-6 text-black" />;
    }
    // Thunder / Storm
    else if ([1087, 1273, 1276, 1279, 1282].includes(code)) {
      return <CloudLightning className="h-6 w-6 text-black" />;
    }
    else {
      return <Cloud className="h-6 w-6 text-black" />;
    }
  };

  return (
    <div className="rounded-3xl dark-gradient p-6 flex flex-col items-center justify-center w-full md:w-1/4 relative">
      <div className='absolute left-4 top-4'>
        <div className="rounded-full bg-white p-2">
          {loading ? (
            <Loader2 className="h-6 w-6 text-black animate-spin" />
          ) : (
            getWeatherIcon(weatherData?.current?.condition?.code)
          )}
        </div>
      </div>
      <div className="flex items-center justify-center w-full">
        <h3 className="text-lg font-medium text-white">Cuaca di {city}</h3>
      </div>

      {error ? (
        <Result status="warning" title={<p className='text-xl text-white'>Terjadi Kesalahan</p>} />
      ) : loading ? (
        <div className="mt-4 flex flex-col space-y-2">
          <div className="h-8 w-24 animate-pulse rounded bg-gray-200"></div>
          <div className="h-6 w-full animate-pulse rounded bg-gray-200"></div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2 justify-center items-center">
          <span className="text-3xl font-bold text-white">{weatherData?.current?.temp_c}°C</span>
          <span className="ml-2 text-sm text-gray-300">Terasa seperti {weatherData?.current?.feelslike_c}°C</span>
        </div>
      )}
    </div>
  );
}