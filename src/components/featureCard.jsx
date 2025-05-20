
export default function FeatureCard({
  icon: Icon,
  iconColor,
  title = "Feature Title",
  description = "This is a sample description for the feature card. Replace with your actual feature description.",
}) {

  return (
    <div
      className="rounded-lg p-6 transition-all duration-300 bg-gray-transparent hover:shadow-[10px_10px_0px_0px_rgba(0,0,0)]"
    >
      <div className="flex flex-col space-y-4">
        <div className="p-3 rounded-full flex items-center justify-center">
          <Icon size={64} className={iconColor} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>

        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}