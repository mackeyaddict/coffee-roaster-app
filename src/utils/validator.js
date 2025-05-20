// Validate temperature ranges for each phase
const validateTemperature = (temp, phase) => {
  switch (phase) {
    case 'preheat':
      return temp >= 50 && temp <= 220;
    case 'drying':
      return temp >= 100 && temp <= 200;
    case 'first_crack':
      return temp >= 150 && temp <= 250;
    case 'development':
      return temp >= 180 && temp <= 250;
    default:
      return temp >= 50 && temp <= 250;
  }
};

// Validate time ranges for each phase
const validateTime = (time, phase) => {
  switch (phase) {
    case 'drying':
      return time >= 60 && time <= 600; // 1-10 minutes
    case 'first_crack':
      return time >= 60 && time <= 300; // 1-5 minutes
    case 'development':
      return time >= 60 && time <= 600; // 1-10 minutes
    default:
      return time >= 0 && time <= 1200; // 0-20 minutes
  }
};

// Validate that temperature is increasing through the phases
const validateIncreasingTemperature = (dryingTemp, firstCrackTemp, dropTemp) => {
  return dryingTemp < firstCrackTemp && firstCrackTemp < dropTemp;
};

// Validate that the total roasting time makes sense
const validateTotalRoastTime = (dryingTime, firstCrackTime, dropTime) => {
  // Ensure drop time is greater than the sum of drying and first crack times
  // Plus some minimum development time (e.g., 60 seconds)
  const minDevelopmentTime = 60;
  return dryingTime + firstCrackTime + minDevelopmentTime <= dropTime;
};

// Calculate development time ratio
const calculateDevelopmentRatio = (firstCrackTime, dropTime) => {
  if (!firstCrackTime || !dropTime || firstCrackTime >= dropTime) {
    return 0;
  }
  
  const developmentTime = dropTime - firstCrackTime;
  return (developmentTime / dropTime) * 100;
};

// Validate that the development time ratio is within recommended range (typically 20-25%)
const validateDevelopmentRatio = (firstCrackTime, dropTime) => {
  const ratio = calculateDevelopmentRatio(firstCrackTime, dropTime);
  return ratio >= 15 && ratio <= 30;
};

// Format time in MM:SS format
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Format temperature with units
const formatTemp = (temp) => {
  return `${temp}°C`;
};

export {
  validateTemperature,
  validateTime,
  validateIncreasingTemperature,
  validateTotalRoastTime,
  calculateDevelopmentRatio,
  validateDevelopmentRatio,
  formatTime,
  formatTemp
};