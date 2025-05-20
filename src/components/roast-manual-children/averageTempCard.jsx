import { Card } from "antd";
import { ChartArea } from "lucide-react";

export default function AverageTempCard({ minTemp, avgTemp, maxTemp, isRoasting, targetTemperature, maxSafetyTemp, autoShutoffEnabled }) {
  return (
    <Card
      title={
        <div className="flex items-center">
          <ChartArea className="mr-2" size={18} />
          <span>Suhu Rata-Rata</span>
        </div>
      }
      className="shadow-md"
    >
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-500">Min</p>
          <p className="text-lg font-semibold text-blue-500">{minTemp}°C</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Avg</p>
          <p className="text-lg font-semibold text-purple-500">{avgTemp}°C</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Max</p>
          <p className="text-lg font-semibold text-red-500">{maxTemp}°C</p>
        </div>
      </div>

      {isRoasting && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-600">Setelan:</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">Target:</span>
            <span className="font-semibold">{targetTemperature}°C</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-500">Max Safety:</span>
            <span className="font-semibold">{maxSafetyTemp}°C</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-500">Matikan Otomatis:</span>
            <span className={`font-semibold ${autoShutoffEnabled ? 'text-green-500' : 'text-red-500'}`}>
              {autoShutoffEnabled ? 'Aktif' : 'Tidak Aktif'}
            </span>
          </div>
        </div>
      )}
    </Card>
  )
}