import React, { useState, useEffect } from 'react';
import { Coffee, BarChart, LineChart, Flame } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../firebase';
import { MetricCard } from '../../components/dashboard-children/metricCard';
import { calculateMetrics } from '../../utils/calculateMetrics';
import WeatherCard from '../../components/dashboard-children/weatherCard';
import Chatbot from '../../components/dashboard-children/chatbot';
import RoastLineChart from '../../components/dashboard-children/roastLineChart';

export default function Dashboard() {
  const [roastProfiles, setRoastProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchRoastProfiles = async () => {
      try {
        setLoading(true);
        const roastProfilesRef = collection(db, "roastProfile");
        const q = query(roastProfilesRef, orderBy("timestamp", "desc"), limit(20));
        const querySnapshot = await getDocs(q);

        const profiles = [];
        querySnapshot.forEach((doc) => {
          profiles.push({ id: doc.id, ...doc.data() });
        });

        setRoastProfiles(profiles);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching roast profiles:", err);
        setError("Failed to load roast profiles");
        setLoading(false);
      }
    };

    fetchRoastProfiles();
  }, []);

  const metrics = calculateMetrics(roastProfiles);

  return (
    <div className="p-6 min-h-screen flex flex-col gap-12">
      <div className='flex md:flex-row flex-col justify-between items-center'>
        <h2 className="text-5xl font-bold mb-6">Selamat Datang, Barista!</h2>
        <WeatherCard />
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Roast Profile"
          value={loading ? "" : metrics.profileSum}
          icon={BarChart}
          loading={loading}
        />

        <MetricCard
          title="Level Roasting Terbanyak"
          value={loading ? "" : metrics.mostRoastLevel}
          icon={Coffee}
          iconColor="text-amber-700"
          loading={loading}
        />

        <MetricCard
          title="Roast Profile Terbaru"
          value={loading ? "" : metrics.recentProfile}
          icon={LineChart}
          loading={loading}
        />

        <MetricCard
          title="Drop Temperature Tertinggi"
          value={loading ? "" : metrics.maxTemp}
          icon={Flame}
          iconColor="text-red-500"
          loading={loading}
        />
      </div>

      <RoastLineChart roastProfiles={roastProfiles} loading={loading} />

      <Chatbot />
    </div>
  );
};