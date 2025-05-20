import { Card } from "antd";
import { Thermometer } from "lucide-react";
import { formatElapsedTime } from "../../utils/timeTranslate";

export default function StatusCard({ temperature, maxSafetyTemp, targetTemperature, elapsedTime, isRoasting }) {
  return (
    <Card
      title={
        <div className="flex items-center">
          <Thermometer className="mr-2" size={18} />
          <span>Status Roasting</span>
        </div>
      }
      className="shadow-md"
    >
      <div className={`text-4xl font-bold text-center ${temperature >= maxSafetyTemp ? 'text-red-600' :
        temperature >= targetTemperature ? 'text-orange-500' :
          'text-blue-500'
        }`}>
        {temperature}°C
      </div>
      <div className="text-lg font-semibold text-center text-gray-600 mt-2">
        Target: {targetTemperature}°C
      </div>
      <div className="text-2xl font-bold text-center text-gray-600 mt-2">
        {formatElapsedTime(elapsedTime)}
      </div>
      <p className="text-gray-500 text-center mt-1">
        {isRoasting ? 'Roasting sedang berjalan' : 'Siap dimulai'}
      </p>
    </Card>
  )
}