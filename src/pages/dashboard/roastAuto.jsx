import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Result, notification } from "antd";
import { ref, onValue, set } from "firebase/database";
import { rtdb } from "../../../firebase";
import {
  setTemperature,
  incrementElapsedTime,
  openModal,
  setPhase,
  togglePidControl,
  toggleHeater,
  toggleMotor,
} from "../../redux/slice/roast.slice";
import { useDetectTurningPoint } from "../../hooks/useTurningPointDetector";

// Import components
import RoastingControlCard from "../../components/roast-auto-children/roastingControlCard";
import RoastingStateCard from "../../components/roast-auto-children/roastingStateCard";
import RoastingValueCard from "../../components/roast-auto-children/roastingValueCard";
import TemperatureCard from "../../components/roast-auto-children/temperatureCard";
import PreHeatModal from "../../components/roast-auto-children/preHeatModal";
import BeansInsertedModal from "../../components/roast-auto-children/beansInsertedModal";
import RoastPlanModal from "../../components/roast-auto-children/roastPlanModal";
import FinishRoastingModal from "../../components/roast-auto-children/finishRoastingModal";
import TurningPointDetectedModal from "../../components/roast-auto-children/turningPointDetectedModal";

export default function RoastingAuto({ isReady }) {
  const dispatch = useDispatch();
  const {
    status,
    phase,
    temperature,
    elapsedTime,
    preHeatTargetTemp,
    dryingTargetTemp,
    dryingTargetTime,
    firstCrackTargetTemp,
    firstCrackTargetTime,
    dropTargetTemp,
    dropTargetTime,
    turningPoint,
    isModalOpen,
    modalType,
  } = useSelector((state) => state.roast);

  // State to track if turning point was detected
  const [turningPointDetected, setTurningPointDetected] = useState(false);

  // Track turning point detection
  useEffect(() => {
    if (turningPoint && !turningPointDetected) {
      setTurningPointDetected(true);
    }
  }, [turningPoint, turningPointDetected]);

  // Initialize timer
  useEffect(() => {
    let timer;
    if (status !== 'idle') {
      timer = setInterval(() => {
        dispatch(incrementElapsedTime());
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [status, dispatch]);

  // Listen to temperature changes from Firebase
  useEffect(() => {
    const tempRef = ref(rtdb, 'manualRoast/temperature');
    const unsubscribe = onValue(tempRef, (snapshot) => {
      const temp = snapshot.val();
      if (temp !== null) {
        dispatch(setTemperature(temp));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    const heaterRef = ref(rtdb, 'manualRoast/heater');
    const unsubscribe = onValue(heaterRef, (snapshot) => {
      const heaterState = snapshot.val();
      if (heaterState !== null) {
        dispatch(toggleHeater(heaterState));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Listen to motor state changes from Firebase
  useEffect(() => {
    const motorRef = ref(rtdb, 'manualRoast/motor');
    const unsubscribe = onValue(motorRef, (snapshot) => {
      const motorState = snapshot.val();
      if (motorState !== null) {
        dispatch(toggleMotor(motorState));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Use refs to track notification states and modal states
  const preHeatNotificationSent = useRef(false);
  const dryingNotificationSent = useRef(false);
  const firstCrackNotificationSent = useRef(false);
  const developmentNotificationSent = useRef(false);
  const modalOpenedDuringPhase = useRef({
    preheating: false,
    drying: false,
    firstCrack: false,
    development: false
  });

  // Track if turning point modal was shown and closed
  const turnPointModalShown = useRef(false);
  const turnPointModalClosed = useRef(false);

  // Track if beans inserted modal was opened
  const beansInsertedModalOpened = useRef(false);

  // Track roast plan modal
  const roastPlanModalShown = useRef(false);

  // Monitor for turning point modal closed event
  useEffect(() => {
    // Check if turning point modal was shown and is now closed
    if (turningPointDetected && turnPointModalShown.current &&
      !isModalOpen && !turnPointModalClosed.current) {

      console.log("Turning point modal was closed");
      turnPointModalClosed.current = true;

      // Add delay before showing roast plan modal
      setTimeout(() => {
        if (!roastPlanModalShown.current) {
          console.log("Opening roast plan modal after turning point");
          roastPlanModalShown.current = true;
          dispatch(openModal('roastPlan'));
        }
      }, 800);
    }
  }, [turningPointDetected, isModalOpen, modalType, dispatch]);

  // Track when turning point modal is shown
  useEffect(() => {
    if (isModalOpen && modalType === 'turningPointDetected' && !turnPointModalShown.current) {
      console.log("Turning point modal is now shown");
      turnPointModalShown.current = true;
    }
  }, [isModalOpen, modalType]);

  // Phase transition handler with refs and modal check
  useEffect(() => {
    // Pre-heat phase handler
    if (phase === 'preheating' &&
      temperature >= preHeatTargetTemp &&
      !preHeatNotificationSent.current &&
      !modalOpenedDuringPhase.current.preheating &&
      !beansInsertedModalOpened.current) {

      // First show notification
      notification.success({
        message: "Pre-Heat Target Reached",
        description: "The roaster has reached the pre-heat target temperature.",
        placement: "topRight",
      });

      // Set flags
      preHeatNotificationSent.current = true;
      modalOpenedDuringPhase.current.preheating = true;
      beansInsertedModalOpened.current = true;

      // Add a delay to ensure notification is visible before modal
      setTimeout(() => {
        console.log("Opening beans inserted modal");
        dispatch(openModal('beansInserted'));
      }, 500);
    }

    // Only proceed with other phase handlers if no modal is open
    if (isModalOpen) {
      return;
    }

    // Drying phase handler
    if (phase === 'drying' &&
      elapsedTime >= dryingTargetTime &&
      !dryingNotificationSent.current &&
      !modalOpenedDuringPhase.current.drying) {
      dryingNotificationSent.current = true;
      modalOpenedDuringPhase.current.drying = true;

      // Add a delay
      setTimeout(() => {
        notification.success({
          message: "Drying Phase Complete",
          description: "Moving to First Crack phase.",
          placement: "topRight",
        });

        dispatch(setPhase('firstCrack'));

        // Update Firebase RTDB
        set(ref(rtdb, 'manualRoast/phase'), 'firstCrack')
          .catch(error => console.error("Error updating phase:", error));

        // Set PID control target for First Crack phase
        set(ref(rtdb, 'manualRoast/targetTemp'), firstCrackTargetTemp)
          .catch(error => console.error("Error setting target temperature:", error));
      }, 500);
    }

    // First crack phase handler
    if (phase === 'firstCrack' &&
      elapsedTime >= (dryingTargetTime + firstCrackTargetTime) &&
      !firstCrackNotificationSent.current &&
      !modalOpenedDuringPhase.current.firstCrack) {
      firstCrackNotificationSent.current = true;
      modalOpenedDuringPhase.current.firstCrack = true;

      // Add a delay
      setTimeout(() => {
        notification.success({
          message: "First Crack Phase Complete",
          description: "Moving to Development phase.",
          placement: "topRight",
        });

        dispatch(setPhase('development'));

        // Update Firebase RTDB
        set(ref(rtdb, 'manualRoast/phase'), 'development')
          .catch(error => console.error("Error updating phase:", error));

        // Disable PID control for development phase
        dispatch(togglePidControl(false));
        set(ref(rtdb, 'manualRoast/pidControl'), false)
          .catch(error => console.error("Error disabling PID control:", error));
      }, 500);
    }

    // Development phase handler
    if (phase === 'development' &&
      (temperature >= dropTargetTemp || elapsedTime >= dropTargetTime) &&
      !developmentNotificationSent.current &&
      !modalOpenedDuringPhase.current.development) {
      developmentNotificationSent.current = true;
      modalOpenedDuringPhase.current.development = true;

      // Add a delay
      setTimeout(() => {
        notification.warning({
          message: "Drop Target Reached",
          description: "The roast has reached the target drop temperature or time. Consider finishing the roast.",
          placement: "topRight",
          duration: 0,
        });
      }, 500);
    }
  }, [
    phase,
    temperature,
    elapsedTime,
    preHeatTargetTemp,
    dryingTargetTime,
    firstCrackTargetTemp,
    firstCrackTargetTime,
    dropTargetTemp,
    dropTargetTime,
    dispatch,
    isModalOpen
  ]);

  // Reset refs when phase changes
  const prevPhase = useRef(phase);
  useEffect(() => {
    if (prevPhase.current !== phase) {
      if (phase === 'preheating') {
        preHeatNotificationSent.current = false;
        modalOpenedDuringPhase.current.preheating = false;
        beansInsertedModalOpened.current = false;
      }
      if (phase === 'drying') {
        dryingNotificationSent.current = false;
        modalOpenedDuringPhase.current.drying = false;
      }
      if (phase === 'firstCrack') {
        firstCrackNotificationSent.current = false;
        modalOpenedDuringPhase.current.firstCrack = false;
      }
      if (phase === 'development') {
        developmentNotificationSent.current = false;
        modalOpenedDuringPhase.current.development = false;
      }

      prevPhase.current = phase;
    }
  }, [phase]);

  // Use turning point detector
  const isDetectingTurningPoint = phase === 'drying' && !turningPoint;
  useDetectTurningPoint(temperature, phase, isDetectingTurningPoint);

  return (
    <div className="p-6 min-h-screen">
      {!isReady ? (
        <div className="flex justify-center items-center w-full h-full">
          <Result status={404} title="Coming Soon" subTitle="Fitur belum tersedia." />
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold mb-6">Coffee Roasting Control</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <RoastingControlCard />
            <RoastingStateCard />
            <RoastingValueCard />
          </div>

          <div className="mt-4">
            <TemperatureCard />
          </div>

          {/* Modals */}
          <PreHeatModal />
          <BeansInsertedModal />
          <RoastPlanModal />
          <TurningPointDetectedModal />
          <FinishRoastingModal />
        </div>
      )}
    </div>
  );
}