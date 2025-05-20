import { Card, Tag } from "antd";
import { ClipboardList } from "lucide-react";
import { useSelector } from "react-redux";

export default function RoastingStateCard() {
  const { 
    status, 
    phase, 
    preHeatTargetTemp,
    pidControl,
    dropTargetTemp,
    dropTargetTime
  } = useSelector((state) => state.roast);

  const isIdle = status === 'idle';

  // Map phase to display text
  const phaseDisplayMap = {
    idle: 'Idle',
    preheating: 'Pre Heat',
    drying: 'Drying Phase',
    firstCrack: 'First Crack Phase',
    development: 'Development Phase',
    finished: 'Finished'
  };

  const getTagColor = (phase) => {
    const colorMap = {
      idle: 'default',
      preheating: 'blue',
      drying: 'green',
      firstCrack: 'orange',
      development: 'red',
      finished: 'purple'
    };
    return colorMap[phase] || 'blue';
  };

  return (
    <Card
      title={
        <div className="flex items-center">
          <ClipboardList className="mr-2" size={18} />
          <span>Parameter Roasting</span>
        </div>
      }
      className="shadow-md"
    >
      {isIdle ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-xl font-semibold text-center">Mulai Roasting Untuk Melihat Parameter</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-base font-semibold">Status Roasting :</p>
            <Tag color={getTagColor(phase)}>{phaseDisplayMap[phase] || phase}</Tag>
          </div>
          {phase === 'preheating' && (
            <div className="flex justify-between items-center">
              <p className="text-base font-semibold">Target Pre Heat :</p>
              <Tag color="blue">{preHeatTargetTemp}°C</Tag>
            </div>
          )}
          <div className="flex justify-between items-center">
            <p className="text-base font-semibold">PID Kontrol :</p>
            <Tag color={pidControl ? "green" : "red"}>{pidControl ? "ON" : "OFF"}</Tag>
          </div>
          {dropTargetTemp > 0 && (
            <div className="flex justify-between items-center">
              <p className="text-base font-semibold">Target Extract :</p>
              <Tag color="blue">{dropTargetTemp}°C</Tag>
            </div>
          )}
          {dropTargetTime > 0 && (
            <div className="flex justify-between items-center">
              <p className="text-base font-semibold">Target Waktu :</p>
              <Tag color="blue">{dropTargetTime} detik</Tag>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}