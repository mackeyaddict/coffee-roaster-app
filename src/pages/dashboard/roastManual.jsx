import React, { useState, useEffect } from 'react';
import { Button, Form, notification } from 'antd';
import { AlertTriangle, Bell } from 'lucide-react';
import { ref, onValue, set } from 'firebase/database';
import { rtdb, db } from '../../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { SaveDataModal, StartRoastModal, StopConfirmModal } from '../../components/roast-manual-children/startRoastModal';
import StatusCard from '../../components/roast-manual-children/statusCard';
import ControlCard from '../../components/roast-manual-children/controlCard';
import TemperatureCard from '../../components/roast-manual-children/temperatureCard';
import AverageTempCard from '../../components/roast-manual-children/averageTempCard';
import RoastNotesCard from '../../components/roast-manual-children/roastNotesCard';

const initialRoastLogState = {
  description: "",
  roastPhase: {
    dryingPhase: { notes: "", startTime: "", startTemp: "", endTime: "", endTemp: "" },
    firstCrack: { notes: "", time: "", temp: "" },
    developmentPhase: { notes: "", startTime: "", startTemp: "", endTime: "", endTemp: "" },
    secondCrack: { notes: "", time: "", temp: "" }
  },
  roastLevel: "",
};


export default function RoastManual() {
  const [heaterStatus, setHeaterStatus] = useState(false);
  const [motorStatus, setMotorStatus] = useState(false);
  const [temperature, setTemperature] = useState(0);
  const [tempHistory, setTempHistory] = useState([]);
  const [maxTemp, setMaxTemp] = useState(0);
  const [minTemp, setMinTemp] = useState(0);
  const [avgTemp, setAvgTemp] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRoasting, setIsRoasting] = useState(false);

  const [targetTemperature, setTargetTemperature] = useState(0);
  const SYSTEM_MAX_TEMPERATURE = 300;
  const [maxSafetyTemp, setMaxSafetyTemp] = useState(250);
  const [isTargetReached, setIsTargetReached] = useState(false);
  const [isNearingSafetyLimit, setIsNearingSafetyLimit] = useState(false);
  const [autoShutoffEnabled, setAutoShutoffEnabled] = useState(true);
  const [heaterControlDisabled, setHeaterControlDisabled] = useState(false);
  
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerDuration, setTimerDuration] = useState(5);
  const [timerNotificationSent, setTimerNotificationSent] = useState(false);

  const [startModalVisible, setStartModalVisible] = useState(false);
  const [stopConfirmVisible, setStopConfirmVisible] = useState(false);
  const [saveDataVisible, setSaveDataVisible] = useState(false);
  const [startForm] = Form.useForm();
  const [saveForm] = Form.useForm();

  // New state for detailed roast log
  const [roastLog, setRoastLog] = useState(initialRoastLogState);
  const [finalDropTemperature, setFinalDropTemperature] = useState(0);

  useEffect(() => {
    const temperatureRef = ref(rtdb, 'manualRoast/temperature');
    const unsubscribe = onValue(temperatureRef, (snapshot) => {
      const tempValue = snapshot.val() || 0;
      setTemperature(tempValue);

      if (isRoasting) {
        if (!isTargetReached && tempValue >= targetTemperature) {
          setIsTargetReached(true);
          notification.open({
            message: 'Suhu Target Tercapai',
            description: `Suhu telah mencapai target Anda yaitu ${targetTemperature}°C.`,
            icon: <Bell style={{ color: '#108ee9' }} />,
            duration: 10,
          });
        }

        if (!isNearingSafetyLimit && tempValue >= maxSafetyTemp - 10) {
          setIsNearingSafetyLimit(true);
          notification.warning({
            message: 'Mendekati Suhu Maksimum',
            description: `Suhu mendekati batas keamanan. Hanya ${maxSafetyTemp - tempValue}°C sebelum pemanas mati otomatis.`,
            icon: <AlertTriangle style={{ color: '#ff4d4f' }} />,
            duration: 0,
          });
        }

        if (autoShutoffEnabled && tempValue >= maxSafetyTemp - 10) { // Adjusted condition slightly
          setHeaterStatus(false);
          setHeaterControlDisabled(true);
          notification.error({
            message: 'Pemutus Otomatis Pemanas Diaktifkan',
            description: 'Pemanas telah dimatikan untuk keamanan. Kontrol pemanas akan diaktifkan kembali ketika suhu menurun.',
            icon: <AlertTriangle style={{ color: '#ff4d4f' }} />,
            duration: 10,
          });
        }
        
        if (heaterControlDisabled && tempValue < maxSafetyTemp - 20) { // Increased hysteresis
          setHeaterControlDisabled(false);
          setIsNearingSafetyLimit(false); // Reset this as well
          notification.success({
            message: 'Kontrol Pemanas Diaktifkan Kembali',
            description: 'Suhu telah turun ke level yang aman. Kontrol pemanas sekarang sudah aktif.',
            duration: 5,
          });
        }

        if (tempValue >= SYSTEM_MAX_TEMPERATURE) {
          setHeaterStatus(false);
          setHeaterControlDisabled(true);
          // Potentially trigger a full stop or more critical alert
          notification.error({
            message: 'PERHATIAN: Suhu Maksimum Sistem Terlampaui',
            description: 'Sistem telah mematikan pemanas. Harap biarkan sistem mendingin dan periksa.',
            icon: <AlertTriangle style={{ color: '#ff4d4f' }} />,
            duration: 0,
          });
        }
      }

      const now = new Date();
      setTempHistory(prev => {
        const newHistory = [...prev, {
          time: now.toLocaleTimeString(),
          temp: tempValue,
          elapsed: elapsedTime,
          target: targetTemperature
        }].slice(-30); // Keep last 30 entries

        if (newHistory.length > 0) {
          const temps = newHistory.map(item => item.temp);
          const max = Math.max(...temps);
          const min = Math.min(...temps);
          const avg = temps.reduce((sum, item) => sum + item, 0) / newHistory.length;
          setMaxTemp(max);
          setMinTemp(min);
          setAvgTemp(parseFloat(avg.toFixed(1)));
        }
        return newHistory;
      });
    });
    return () => unsubscribe();
  }, [elapsedTime, isRoasting, targetTemperature, isTargetReached, maxSafetyTemp, isNearingSafetyLimit, autoShutoffEnabled, heaterControlDisabled, SYSTEM_MAX_TEMPERATURE]); // Added SYSTEM_MAX_TEMPERATURE

  useEffect(() => {
    let interval;
    if (isRoasting) {
      interval = setInterval(() => {
        setElapsedTime(prev => {
          const newElapsedTime = prev + 1;
          if (timerEnabled && !timerNotificationSent && (newElapsedTime >= timerDuration * 60)) {
            notification.info({
              message: 'Timer Tercapai',
              description: `Durasi timer yang diatur (${timerDuration} menit) telah tercapai.`,
              icon: <Bell style={{ color: '#108ee9' }} />,
              duration: 10,
            });
            setTimerNotificationSent(true);
          }
          return newElapsedTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRoasting, timerEnabled, timerDuration, timerNotificationSent]);

  useEffect(() => {
    set(ref(rtdb, 'manualRoast/heater'), heaterStatus);
  }, [heaterStatus]);

  useEffect(() => {
    set(ref(rtdb, 'manualRoast/motor'), motorStatus);
  }, [motorStatus]);

  const resetRTDB = () => {
    set(ref(rtdb, 'manualRoast/heater'), false);
    set(ref(rtdb, 'manualRoast/motor'), false);
    set(ref(rtdb, 'manualRoast/status'), 'idle');
    set(ref(rtdb, 'manualRoast/temperature'), 0);
    set(ref(rtdb, 'manualRoast/targetTemp'), 0);
    set(ref(rtdb, 'manualRoast/maxSafetyTemp'), 0);
  };

  const showStartModal = () => {
    startForm.setFieldsValue({
      targetTemperature: targetTemperature || 180,
      maxSafetyTemp: maxSafetyTemp || 220,
      autoShutoff: autoShutoffEnabled,
      timerEnabled: timerEnabled,
      timerDuration: timerDuration || 5
    });
    setStartModalVisible(true);
  };

  const handleStartRoast = (values) => {
    setTargetTemperature(values.targetTemperature);
    setMaxSafetyTemp(values.maxSafetyTemp);
    setAutoShutoffEnabled(values.autoShutoff);
    setTimerEnabled(values.timerEnabled);
    setTimerDuration(values.timerDuration);
    setTimerNotificationSent(false);

    setIsRoasting(true);
    setElapsedTime(0);
    setIsTargetReached(false);
    setIsNearingSafetyLimit(false);
    setHeaterControlDisabled(false);
    setHeaterStatus(true);
    setMotorStatus(true);
    setRoastLog(initialRoastLogState); // Reset roast log
    setFinalDropTemperature(0);
    setTempHistory([]); // Clear history for new roast

    set(ref(rtdb, 'manualRoast/status'), 'roasting');
    set(ref(rtdb, 'manualRoast/targetTemp'), values.targetTemperature);
    set(ref(rtdb, 'manualRoast/maxSafetyTemp'), values.maxSafetyTemp);
    setStartModalVisible(false);
  };

  const handleToggleHeater = () => {
    if (!heaterControlDisabled) {
      setHeaterStatus(prev => !prev);
    } else {
      notification.warning({
        message: 'Kontrol Pemanas Dinon-aktifkan',
        description: 'Kontrol pemanas saat ini dinonaktifkan untuk keselamatan. Tunggu suhu menurun.',
        icon: <AlertTriangle style={{ color: '#ff4d4f' }} />,
        duration: 5,
      });
    }
  };

  const handleToggleMotor = () => {
    setMotorStatus(prev => !prev);
  };

  const handleStopRoastRequest = () => {
    if (isRoasting) {
      setStopConfirmVisible(true);
    }
  };
  
  const resetCoreStates = () => {
    setHeaterStatus(false);
    setMotorStatus(false);
    setIsRoasting(false);
    setElapsedTime(0);
    setIsTargetReached(false);
    setIsNearingSafetyLimit(false);
    setHeaterControlDisabled(false);
    setTimerNotificationSent(false);
    resetRTDB();
  }

  const handleStopRoast = () => {
    const capturedDropTemperature = temperature; // Capture current temperature as drop temperature
    setFinalDropTemperature(capturedDropTemperature);
    
    resetCoreStates(); // Turn off heater, motor, reset roasting flags
    setStopConfirmVisible(false);

    saveForm.setFieldsValue({
      roastName: "My Roast Profile", // Default name
      targetTemperature: targetTemperature,
      duration: elapsedTime, // This is total elapsed time for the roast
      dropTemperature: capturedDropTemperature,
      
      description: roastLog.description,
      roastLevel: roastLog.roastLevel,

      dryingPhaseNotes: roastLog.roastPhase.dryingPhase.notes,
      dryingPhaseStartTime: roastLog.roastPhase.dryingPhase.startTime,
      dryingPhaseStartTemp: roastLog.roastPhase.dryingPhase.startTemp,
      dryingPhaseEndTime: roastLog.roastPhase.dryingPhase.endTime,
      dryingPhaseEndTemp: roastLog.roastPhase.dryingPhase.endTemp,

      firstCrackNotes: roastLog.roastPhase.firstCrack.notes,
      firstCrackTime: roastLog.roastPhase.firstCrack.time,
      firstCrackTemp: roastLog.roastPhase.firstCrack.temp,

      developmentPhaseNotes: roastLog.roastPhase.developmentPhase.notes,
      developmentPhaseStartTime: roastLog.roastPhase.developmentPhase.startTime,
      developmentPhaseStartTemp: roastLog.roastPhase.developmentPhase.startTemp,
      developmentPhaseEndTime: roastLog.roastPhase.developmentPhase.endTime,
      developmentPhaseEndTemp: roastLog.roastPhase.developmentPhase.endTemp,

      secondCrackNotes: roastLog.roastPhase.secondCrack.notes,
      secondCrackTime: roastLog.roastPhase.secondCrack.time,
      secondCrackTemp: roastLog.roastPhase.secondCrack.temp,
    });
    setSaveDataVisible(true);
  };

  const resetPostSaveStates = () => {
    setTargetTemperature(180); // Default
    setMaxSafetyTemp(220);   // Default
    setAutoShutoffEnabled(true);
    setTimerEnabled(false);
    setTimerDuration(5);
    setMaxTemp(0);
    setMinTemp(0); // Or a high number like 999 if that's preferred for initial min
    setAvgTemp(0);
    setTempHistory([]);
    setRoastLog(initialRoastLogState);
    setFinalDropTemperature(0);
    saveForm.resetFields();
  };

  const handleSaveRoastData = async (values) => {
    try {
      const roastData = {
        // id: will be auto-generated by Firestore
        name: values.roastName,
        description: values.description || "", // Ensure empty string if not provided
        roastLevel: values.roastLevel || "",
        duration: elapsedTime, // Use state value at time of stop
        targetTemperature: targetTemperature, // Use state value
        dropTemperature: finalDropTemperature, // Use state value captured at stop
        timestamp: serverTimestamp(), // Use Firestore server timestamp
        roastPhase: {
          dryingPhase: {
            notes: values.dryingPhaseNotes || "",
            startTime: values.dryingPhaseStartTime || "",
            startTemp: values.dryingPhaseStartTemp || "",
            endTime: values.dryingPhaseEndTime || "",
            endTemp: values.dryingPhaseEndTemp || "",
          },
          firstCrack: {
            notes: values.firstCrackNotes || "",
            time: values.firstCrackTime || "",
            temp: values.firstCrackTemp || "",
          },
          developmentPhase: {
            notes: values.developmentPhaseNotes || "",
            startTime: values.developmentPhaseStartTime || "",
            startTemp: values.developmentPhaseStartTemp || "",
            endTime: values.developmentPhaseEndTime || "",
            endTemp: values.developmentPhaseEndTemp || "",
          },
          secondCrack: {
            notes: values.secondCrackNotes || "",
            time: values.secondCrackTime || "",
            temp: values.secondCrackTemp || "",
          }
        },
        // Add tempHistory if you want to save it too, can be large
        // tempHistory: tempHistory, 
      };

      await addDoc(collection(db, "roastProfile"), roastData);
      
      setSaveDataVisible(false);
      notification.success({
        message: 'Roast Profile Berhasil Disimpan',
        description: `"${values.roastName}" telah berhasil disimpan.`,
        duration: 5,
      });
      resetPostSaveStates();

    } catch (error) {
      console.error("Error saving roast data:", error);
      notification.error({
        message: 'Gagal Menyimpan',
        description: `Gagal menyimpan profil roasting: ${error.message}`,
        duration: 5,
      });
    }
  };

  const handleCancelSave = () => {
    setSaveDataVisible(false);
    resetPostSaveStates();
  };

  // Handler for roast log inputs
  const handleRoastLogChange = (path, value) => {
    setRoastLog(prevLog => {
      const newLog = { ...prevLog };
      let current = newLog;
      const keys = path.split('.');
      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          current[key] = value;
        } else {
          current[key] = { ...current[key] };
          current = current[key];
        }
      });
      return newLog;
    });
  };
  
  return (
    <div className='py-6'>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatusCard
          temperature={temperature}
          maxSafetyTemp={maxSafetyTemp}
          targetTemperature={targetTemperature}
          elapsedTime={elapsedTime}
          isRoasting={isRoasting}
        />
        <AverageTempCard
          minTemp={minTemp}
          avgTemp={avgTemp}
          maxTemp={maxTemp}
          isRoasting={isRoasting}
          targetTemperature={targetTemperature}
          maxSafetyTemp={maxSafetyTemp}
          autoShutoffEnabled={autoShutoffEnabled}
        />
        <ControlCard
          heaterStatus={heaterStatus}
          isRoasting={isRoasting}
          handleToggleHeater={handleToggleHeater}
          heaterControlDisabled={heaterControlDisabled}
          motorStatus={motorStatus}
          handleToggleMotor={handleToggleMotor}
          handleStopRoastRequest={handleStopRoastRequest}
          showStartModal={showStartModal}
        />
      </div>

      {/* Temperature Chart */}
      <TemperatureCard
        tempHistory={tempHistory}
        maxSafetyTemp={maxSafetyTemp} // Pass this for y-axis scaling or reference lines
      />

      {/* Roast Log Inputs - Visible during roasting */}
      {isRoasting && (
        <RoastNotesCard
          roastLog={roastLog}
          handleRoastLogChange={handleRoastLogChange}
        />
      )}

      {/* Modals */}
      <StartRoastModal
        visible={startModalVisible}
        onCancel={() => setStartModalVisible(false)}
        onFinish={handleStartRoast}
        form={startForm}
        targetTemperature={targetTemperature}
        maxSafetyTemp={maxSafetyTemp}
        SYSTEM_MAX_TEMPERATURE={SYSTEM_MAX_TEMPERATURE}
      />
      <StopConfirmModal
        visible={stopConfirmVisible}
        onOk={handleStopRoast}
        onCancel={() => setStopConfirmVisible(false)}
      />
      <SaveDataModal
        visible={saveDataVisible}
        onCancel={handleCancelSave}
        onFinish={handleSaveRoastData}
        form={saveForm}
        targetTemperatureDisplay={targetTemperature}
        elapsedTimeDisplay={elapsedTime}
        dropTemperatureDisplay={finalDropTemperature}
      />
    </div>
  );
}