export const calculateMetrics = (profiles) => {
  if (!profiles || profiles.length === 0) return {};
  
  // Get most recent profile
  const mostRecent = profiles[0];
  
  // Find most common roast level
  const roastLevels = profiles.map(p => p.roastLevel);
  const levelCounts = roastLevels.reduce((acc, level) => {
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});
  const mostCommonLevel = Object.entries(levelCounts)
    .sort((a, b) => b[1] - a[1])[0][0];
  
  // Calculate max drop temperature
  const maxDropTemp = Math.max(...profiles
    .map(p => parseInt(p.dropTemperature || "0")));
  
  // Calculate roast profile total
  const profileSum = profiles.length;
  
  return {
    profileSum,
    mostRoastLevel: mostCommonLevel,
    recentProfile: mostRecent.name || "Unknown",
    maxTemp: `${maxDropTemp}°C`
  };
};