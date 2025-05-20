import { Button, Card, Switch } from "antd";
import { Clock, Fan, Flame } from "lucide-react";

export default function ControlCard({
  heaterStatus,
  isRoasting,
  handleToggleHeater,
  heaterControlDisabled,
  motorStatus,
  handleToggleMotor,
  handleStopRoastRequest,
  showStartModal
}) {
  return (
    <Card
      title={
        <div className="flex items-center">
          <Clock className="mr-2" size={18} />
          <span>Roasting Kontrol</span>
        </div>
      }
      className="shadow-md"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-medium flex items-center">
            <Flame size={16} className="mr-2 text-red-500" />
            Pemanas:
          </span>
          <div className="flex items-center">
            <div className={`px-3 py-1 rounded-full mr-2 ${heaterStatus ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {heaterStatus ? "ON" : "OFF"}
            </div>
            {isRoasting && (
              <Switch
                checked={heaterStatus}
                onChange={handleToggleHeater}
                disabled={heaterControlDisabled}
                size="small"
              />
            )}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium flex items-center">
            <Fan size={16} className="mr-2 text-blue-500" />
            Pemutar:
          </span>
          <div className="flex items-center">
            <div className={`px-3 py-1 rounded-full mr-2 ${motorStatus ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {motorStatus ? "ON" : "OFF"}
            </div>
            {isRoasting && (
              <Switch
                checked={motorStatus}
                onChange={handleToggleMotor}
                size="small"
              />
            )}
          </div>
        </div>
        <Button
          onClick={isRoasting ? handleStopRoastRequest : showStartModal}
          type="primary"
          icon={<Clock size={16} className="mr-2" />}
          className={`${isRoasting ? "dark-gradient hover-dark-gradient" : "dark-gradient-secondary hover-dark-gradient-secondary"} w-full`}
        >
          {isRoasting ? "Hentikan Roasting" : "Mulai Roasting"}
        </Button>
      </div>
    </Card>
  )
}