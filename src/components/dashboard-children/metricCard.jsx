export const MetricCard = ({
  title = "Metric Title",
  value = "",
  icon: Icon = null,
  iconColor = "text-amber-600",
  loading = false,
  className = "",
}) => {
  return (
    <div className={`bg-white border border-gray-300 rounded-3xl p-6 flex flex-col items-center justify-center h-40 ${className}`}>
      {Icon && <Icon className={`${iconColor} w-6 h-6 mb-2`} />}
      <h3 className="text-lg font-medium text-center text-gray-800 mb-1">{title}</h3>
      {loading ? (
        <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
      ) : (
        value && <div className="text-xl font-bold text-gray-900">{value}</div>
      )}
    </div>
  );
};