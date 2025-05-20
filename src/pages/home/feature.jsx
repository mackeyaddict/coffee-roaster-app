import { ChartSpline, Timer, ToggleRight,  } from 'lucide-react';
import FeatureCard from '../../components/featureCard';
export default function Feature() {
  const features = [
    {
      icon: ChartSpline,
      title: "Temperature Monitor",
      description: "Track and visualize precise temperature curves throughout the roasting process for consistent results every time.",
      iconColor: "text-red-500"
    },
    {
      icon: Timer,
      title: "Timer",
      description: "Set precise timing intervals for each roast phase with customizable alerts to achieve your perfect roast profile.",
      iconColor: "text-green-500"
    },
    {
      icon: ToggleRight,
      title: "Full Control",
      description: "Adjust heat, airflow, and drum speed in real-time with intuitive controls designed for professional roasters.",
      iconColor: "text-blue-500"
    }
  ];

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Features</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover how our solution can transform your workflow with these powerful features
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