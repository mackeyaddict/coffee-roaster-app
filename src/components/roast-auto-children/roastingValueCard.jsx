import { Alert, Button, Card } from "antd";
import { Thermometer } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useRef, useEffect } from "react";
import { openModal } from "../../redux/slice/roast.slice";
import { ref, set } from "firebase/database";
import { rtdb } from "../../../firebase";
import { formatTime } from "../../utils/validator";

export default function RoastingValueCard() {
  const dispatch = useDispatch();
  
  // Get all state values at the top level
  const { 
    temperature, 
    elapsedTime, 
    phase, 
    status,
    preHeatTargetTemp,
    dryingTargetTemp 
  } = useSelector((state) => state.roast);
  
  // Use refs to track previous values and alert states
  const preHeatAlertShown = useRef(false);
  const dryingAlertShown = useRef(false);
  const prevPhase = useRef(phase);
  
  // Handle phase and temperature changes
  useEffect(() => {
    // Reset alert refs when phase changes
    if (prevPhase.current !== phase) {
      preHeatAlertShown.current = false;
      dryingAlertShown.current = false;
      prevPhase.current = phase;
    }
    
    // Update alert refs based on temperature and phase
    if (phase === 'preheating' && temperature >= preHeatTargetTemp) {
      preHeatAlertShown.current = true;
    }
    
    if (phase === 'drying' && temperature >= dryingTargetTemp) {
      dryingAlertShown.current = true;
    }
  }, [phase, temperature, preHeatTargetTemp, dryingTargetTemp]);
  
  const isIdle = status === 'idle';
  const isPreHeat = phase === 'preheating';
  const isDrying = phase === 'drying';
  const isFirstCrack = phase === 'firstCrack';

  const handleFirstCrackDetected = async () => {
    try {
      await set(ref(rtdb, 'manualRoast/firstCrackDetected'), true);
      dispatch(openModal('firstCrackDetected'));
    } catch (error) {
      console.error("Error marking first crack detected:", error);
    }
  };

  // Determine if alerts should be shown
  const showPreHeatAlert = isPreHeat && temperature >= preHeatTargetTemp;
  const showDryingAlert = isDrying && temperature >= dryingTargetTemp;

  return (
    <Card
      title={
        <div className="flex items-center">
          <Thermometer className="mr-2" size={18} />
          <span>Roasting Value</span>
        </div>
      }
      className="shadow-md"
    >
      <div className="space-y-4">
        {/* Current Temp */}
        <div className="text-4xl font-bold text-center">
          {temperature}°C
        </div>
        {/* Time */}
        <div className="text-2xl font-bold text-center text-gray-600 mt-2">
          {formatTime(elapsedTime)}
        </div>
        {/* First Crack Mark */}
        {isFirstCrack && (
          <div className="flex justify-center">
            <Button 
              type="primary" 
              className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black"
              onClick={handleFirstCrackDetected}
            >
              First Crack Terdengar
            </Button>
          </div>
        )}

        {showPreHeatAlert && (
          <Alert
            message="Proses Pre Heat Tercapai!"
            type="success"
            showIcon
            className="mt-3"
          />
        )}
        
        {showDryingAlert && (
          <Alert
            message="Target Drying Phase Tercapai!"
            type="success"
            showIcon
            className="mt-3"
          />
        )}
      </div>
    </Card>
  );
}