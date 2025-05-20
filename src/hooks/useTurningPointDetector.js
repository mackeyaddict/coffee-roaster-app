import { useState, useEffect, useRef } from "react";
import {
  openModal,
  setTurningPoint,
} from "../redux/slice/roast.slice";
import { useDispatch } from "react-redux";
import { ref, set } from "firebase/database";
import { rtdb } from "../../firebase";

export const useDetectTurningPoint = (temperature, phase, isActive) => {
  const dispatch = useDispatch();
  const [minTemp, setMinTemp] = useState(null);
  const [isTempDropping, setIsTempDropping] = useState(false);
  const [isDelayComplete, setIsDelayComplete] = useState(false);
  const [turningPointDetected, setTurningPointDetected] = useState(false);
  const startTimeRef = useRef(null);
  
  // Reset states when phase changes or detection becomes inactive
  useEffect(() => {
    if (phase !== 'drying' || !isActive) {
      setMinTemp(null);
      setIsTempDropping(false);
      setIsDelayComplete(false);
      setTurningPointDetected(false);
      startTimeRef.current = null;
    } else if (phase === 'drying' && isActive && startTimeRef.current === null) {
      // Start the timer when we enter drying phase and detection is active
      startTimeRef.current = Date.now();
    }
  }, [phase, isActive]);
  
  // Handle delay for starting detection
  useEffect(() => {
    if (!isActive || phase !== 'drying' || isDelayComplete || !startTimeRef.current) {
      return;
    }
    
    const DELAY_SECONDS = 5; // 5 second delay before starting detection
    const timeSinceStart = Date.now() - startTimeRef.current;
    
    if (timeSinceStart >= DELAY_SECONDS * 1000) {
      console.log("Starting turning point detection after delay");
      setIsDelayComplete(true);
      setMinTemp(temperature); // Initialize min temp when detection starts
    }
  }, [isActive, phase, isDelayComplete, temperature]);
  
  // Turning point detection logic
  useEffect(() => {
    // Only run detection during drying phase after delay is complete
    if (!isActive || phase !== 'drying' || !isDelayComplete || turningPointDetected) {
      return;
    }
    
    if (minTemp === null) {
      setMinTemp(temperature);
      return;
    }
    
    if (temperature < minTemp) {
      // Still dropping, update minimum
      setMinTemp(temperature);
      setIsTempDropping(true);
      console.log("New minimum temperature:", temperature);
    } else if (isTempDropping && temperature > minTemp + 1) {
      // Temperature has risen from lowest point (use +1 for safety margin)
      console.log("Turning point detected at:", minTemp);
      
      // Set turning point detected to prevent further detection
      setTurningPointDetected(true);
      
      // Update Redux state
      dispatch(setTurningPoint(minTemp));
      
      // Update Firebase RTDB
      set(ref(rtdb, 'manualRoast/turningPoint'), minTemp)
        .catch(error => console.error("Error saving turning point:", error));
      
      // Open turning point modal
      dispatch(openModal('turningPointDetected'));
    }
  }, [temperature, phase, isActive, minTemp, isTempDropping, isDelayComplete, turningPointDetected, dispatch]);
  
  return null;
}