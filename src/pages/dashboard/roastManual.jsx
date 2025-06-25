import React, { useState, useEffect } from 'react';
import { Button, Form, notification } from 'antd';
import { AlertTriangle, Bell, Coffee } from 'lucide-react';
import { ref, onValue, set } from 'firebase/database';
import { rtdb, db } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { SaveDataModal, StartRoastModal, StopConfirmModal } from '../../components/roast-manual-children/startRoastModal';
import StatusCard from '../../components/roast-manual-children/statusCard';
import ControlCard from '../../components/roast-manual-children/controlCard';
import TemperatureCard from '../../components/roast-manual-children/temperatureCard';
import AverageTempCard from '../../components/roast-manual-children/averageTempCard';
import RoastNotesCard from '../../components/roast-manual-children/roastNotesCard';
import { useSound } from 'react-sounds';
import LoadRoastModal from '../../components/roast-manual-children/loadRoast';
import { secondsToMinutes } from '../../utils/timeTranslate';

const initialRoastLogState = {
  name: "",
  description: "",
  dropTemperature: "",
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

  const [roastLog, setRoastLog] = useState(initialRoastLogState);
  const [finalDropTemperature, setFinalDropTemperature] = useState(0);

  const [loadProfileVisible, setLoadProfileVisible] = useState(false);

  const soundConfig = {
    volume: 0.7,
    playbackRate: 1,
    interrupt: true,
    autoDestroy: true,
  };

  // Initialize sound hooks
  const { play: playSuccessSound } = useSound('ui/success_bling', soundConfig);
  const { play: playWarningSound } = useSound('notification/info', soundConfig);
  const { play: playErrorSound } = useSound('notification/info', soundConfig);
  const { play: playInfoSound } = useSound('notification/reminder', soundConfig);
  const { play: playAlertSound } = useSound('notification/info', soundConfig);

  const playNotificationSound = (type) => {
    try {
      switch (type) {
        case 'success':
          playSuccessSound();
          break;
        case 'warning':
          playWarningSound();
          break;
        case 'error':
          playErrorSound();
          break;
        case 'info':
          playInfoSound();
          break;
        case 'alert':
          playAlertSound();
          break;
        default:
          playInfoSound();
      }
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  };

  useEffect(() => {
    const temperatureRef = ref(rtdb, 'manualRoast/temperature');
    const unsubscribe = onValue(temperatureRef, (snapshot) => {
      const tempValue = snapshot.val() || 0;
      setTemperature(tempValue);

      if (isRoasting) {
        if (!isTargetReached && tempValue >= targetTemperature) {
          setIsTargetReached(true);
          playNotificationSound('info');
          notification.open({
            message: 'Suhu Target Tercapai',
            description: `Suhu telah mencapai target Anda yaitu ${targetTemperature}°C.`,
            icon: <Bell style={{ color: '#108ee9' }} />,
            duration: 10,
          });
        }

        if (!isNearingSafetyLimit && tempValue >= maxSafetyTemp - 10) {
          setIsNearingSafetyLimit(true);
          playNotificationSound('warning');
          notification.warning({
            message: 'Mendekati Suhu Maksimum',
            description: `Suhu mendekati batas keamanan. Hanya ${maxSafetyTemp - tempValue}°C sebelum pemanas mati otomatis.`,
            icon: <AlertTriangle style={{ color: '#ff4d4f' }} />,
            duration: 0,
          });
        }

        if (autoShutoffEnabled && tempValue >= maxSafetyTemp - 10) {
          setHeaterStatus(false);
          setHeaterControlDisabled(true);
          playNotificationSound('error');
          notification.error({
            message: 'Pemutus Otomatis Pemanas Diaktifkan',
            description: 'Pemanas telah dimatikan untuk keamanan. Kontrol pemanas akan diaktifkan kembali ketika suhu menurun.',
            icon: <AlertTriangle style={{ color: '#ff4d4f' }} />,
            duration: 10,
          });
        }

        if (heaterControlDisabled && tempValue < maxSafetyTemp - 20) {
          setHeaterControlDisabled(false);
          setIsNearingSafetyLimit(false);
          playNotificationSound('success');
          notification.success({
            message: 'Kontrol Pemanas Diaktifkan Kembali',
            description: 'Suhu telah turun ke level yang aman. Kontrol pemanas sekarang sudah aktif.',
            duration: 5,
          });
        }

        if (tempValue >= SYSTEM_MAX_TEMPERATURE) {
          setHeaterStatus(false);
          setHeaterControlDisabled(true);
          playNotificationSound('alert');
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
        }].slice(-30);

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
  }, [elapsedTime, isRoasting, targetTemperature, isTargetReached, maxSafetyTemp, isNearingSafetyLimit, autoShutoffEnabled, heaterControlDisabled, SYSTEM_MAX_TEMPERATURE]);

  useEffect(() => {
    let interval;
    if (isRoasting) {
      interval = setInterval(() => {
        setElapsedTime(prev => {
          const newElapsedTime = prev + 1;
          if (timerEnabled && !timerNotificationSent && (newElapsedTime >= timerDuration * 60)) {
            playNotificationSound('info');
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
    setRoastLog(initialRoastLogState);
    setFinalDropTemperature(0);
    setTempHistory([]);

    set(ref(rtdb, 'manualRoast/status'), 'roasting');
    set(ref(rtdb, 'manualRoast/targetTemp'), values.targetTemperature);
    set(ref(rtdb, 'manualRoast/maxSafetyTemp'), values.maxSafetyTemp);
    setStartModalVisible(false);
  };

  const handleToggleHeater = () => {
    if (!heaterControlDisabled) {
      setHeaterStatus(prev => !prev);
    } else {
      playNotificationSound('warning');
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
    const capturedDropTemperature = temperature;
    setFinalDropTemperature(capturedDropTemperature);

    resetCoreStates();
    setStopConfirmVisible(false);

    saveForm.setFieldsValue({
      name: roastLog.name,
      targetTemperature: targetTemperature,
      duration: secondsToMinutes(elapsedTime),
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
    setTargetTemperature(180);
    setMaxSafetyTemp(220);
    setAutoShutoffEnabled(true);
    setTimerEnabled(false);
    setTimerDuration(5);
    setMaxTemp(0);
    setMinTemp(0);
    setAvgTemp(0);
    setTempHistory([]);
    setRoastLog(initialRoastLogState);
    setFinalDropTemperature(0);
    saveForm.resetFields();
  };


  const handleLoadProfile = (profile) => {
    setRoastLog({
      name: profile.name || "",
      description: profile.description || "",
      dropTemperature: profile.dropTemperature || "",
      duration: profile.duration || "",
      roastLevel: profile.roastLevel || "",
      roastPhase: {
        dryingPhase: {
          notes: profile.roastPhase?.dryingPhase?.notes || "",
          startTime: profile.roastPhase?.dryingPhase?.startTime || "",
          startTemp: profile.roastPhase?.dryingPhase?.startTemp || "",
          endTime: profile.roastPhase?.dryingPhase?.endTime || "",
          endTemp: profile.roastPhase?.dryingPhase?.endTemp || "",
        },
        firstCrack: {
          notes: profile.roastPhase?.firstCrack?.notes || "",
          time: profile.roastPhase?.firstCrack?.time || "",
          temp: profile.roastPhase?.firstCrack?.temp || "",
        },
        developmentPhase: {
          notes: profile.roastPhase?.developmentPhase?.notes || "",
          startTime: profile.roastPhase?.developmentPhase?.startTime || "",
          startTemp: profile.roastPhase?.developmentPhase?.startTemp || "",
          endTime: profile.roastPhase?.developmentPhase?.endTime || "",
          endTemp: profile.roastPhase?.developmentPhase?.endTemp || "",
        },
        secondCrack: {
          notes: profile.roastPhase?.secondCrack?.notes || "",
          time: profile.roastPhase?.secondCrack?.time || "",
          temp: profile.roastPhase?.secondCrack?.temp || "",
        }
      }
    });
  };

  console.log("Waktu", secondsToMinutes(elapsedTime))
  const handleSaveRoastData = async (values) => {
    try {
      const toNumber = (value) => {
        if (value === null || value === undefined || value === "") return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
      };

      const roastData = {
        name: values.name || "",
        description: values.description || "",
        roastLevel: values.roastLevel || "",
        duration: toNumber(values.duration),
        targetTemperature: toNumber(targetTemperature),
        dropTemperature: toNumber(finalDropTemperature || values.dropTemperature),
        timestamp: serverTimestamp(),
        roastPhase: {
          dryingPhase: {
            notes: values.dryingPhaseNotes || "",
            startTime: toNumber(values.dryingPhaseStartTime),
            startTemp: toNumber(values.dryingPhaseStartTemp),
            endTime: toNumber(values.dryingPhaseEndTime),
            endTemp: toNumber(values.dryingPhaseEndTemp),
          },
          firstCrack: {
            notes: values.firstCrackNotes || "",
            time: toNumber(values.firstCrackTime),
            temp: toNumber(values.firstCrackTemp),
          },
          developmentPhase: {
            notes: values.developmentPhaseNotes || "",
            startTime: toNumber(values.developmentPhaseStartTime),
            startTemp: toNumber(values.developmentPhaseStartTemp),
            endTime: toNumber(values.developmentPhaseEndTime),
            endTemp: toNumber(values.developmentPhaseEndTemp),
          },
          secondCrack: {
            notes: values.secondCrackNotes || "",
            time: toNumber(values.secondCrackTime),
            temp: toNumber(values.secondCrackTemp),
          }
        },
      };

      await addDoc(collection(db, "roastProfile"), roastData);

      setSaveDataVisible(false);
      playNotificationSound('success');
      notification.success({
        message: 'Roast Profile Berhasil Disimpan',
        description: `"${values.name}" telah berhasil disimpan.`,
        duration: 5,
      });
      resetPostSaveStates();

    } catch (error) {
      console.error("Error saving roast data:", error);
      playNotificationSound('error');
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

      <TemperatureCard
        tempHistory={tempHistory}
        maxSafetyTemp={maxSafetyTemp}
      />


      {isRoasting && (
        <div className="my-4">
          <Button
            onClick={() => setLoadProfileVisible(true)}
            icon={<Coffee size={16} />}
            className="mb-2"
          >
            Muat Profil Roasting
          </Button>
        </div>
      )}


      {isRoasting && (
        <RoastNotesCard
          roastLog={roastLog}
          handleRoastLogChange={handleRoastLogChange}
        />
      )}

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

      <LoadRoastModal
        visible={loadProfileVisible}
        onCancel={() => setLoadProfileVisible(false)}
        onLoadProfile={handleLoadProfile}
      />
    </div>
  );
}