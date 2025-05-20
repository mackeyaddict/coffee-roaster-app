import { ChartSpline, Timer, ToggleRight, } from 'lucide-react';
import FeatureCard from '../../components/featureCard';
export default function Feature() {
  const features = [
    {
      icon: ChartSpline,
      title: "Temperature Monitor",
      description: "Pantau dan visualisasikan kurva suhu secara presisi selama proses pemanggangan untuk memastikan hasil yang konsisten setiap saat.",
      iconColor: "text-red-500"
    },
    {
      icon: Timer,
      title: "Timer",
      description: "Atur interval waktu yang tepat untuk setiap fase pemanggangan dengan notifikasi yang dapat disesuaikan guna mencapai profil roasting yang sempurna.",
      iconColor: "text-green-500"
    },
    {
      icon: ToggleRight,
      title: "Full Control",
      description: "Sesuaikan panas dan rotator secara real-time melalui kontrol intuitif yang dirancang untuk roaster profesional.",
      iconColor: "text-blue-500"
    }
  ];

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Fitur-Fitur</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Temukan bagaimana solusi kami dapat menyempurnakan proses roasting kopi Anda dengan fitur-fitur canggih berikut ini.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 border border-gray-300 p-8 rounded-2xl">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              iconColor={feature.iconColor}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}