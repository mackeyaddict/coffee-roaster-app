import { Button, Card, Switch, notification, Modal } from "antd";
import { Clock, Fan, Flame, SlidersVertical, Square } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleHeater,
  toggleMotor,
  openModal,
  setTemperature,
  resetRoast
} from "../../redux/slice/roast.slice";
import { useState } from "react";
import { set, ref } from "firebase/database";
import { rtdb } from "../../../firebase";

export default function RoastingControlCard() {
  const dispatch = useDispatch();
  const { heater, motor, status } = useSelector((state) => state.roast);
  const [loading, setLoading] = useState(false);
  const [stopConfirmVisible, setStopConfirmVisible] = useState(false);
  const [stoppingLoading, setStoppingLoading] = useState(false);

  const handleHeaterChange = async (checked) => {
    try {
      dispatch(toggleHeater(checked));
      await set(ref(rtdb, 'manualRoast/heater'), checked);
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to toggle heater. Please try again.",
      });
      dispatch(toggleHeater(!checked));
    }
  };

  const handleMotorChange = async (checked) => {
    try {
      dispatch(toggleMotor(checked));
      await set(ref(rtdb, 'manualRoast/motor'), checked);
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to toggle motor. Please try again.",
      });
      dispatch(toggleMotor(!checked));
    }
  };

  const handleStartRoasting = async () => {
    if (status !== 'idle') {
      notification.info({
        message: "Roasting in progress",
        description: "Roasting process is already running."
      });
      return;
    }

    setLoading(true);
    try {
      await set(ref(rtdb, 'manualRoast/turningPoint'), 0);

      // Open modal for preHeat target input - do this before setting status
      dispatch(openModal('preHeat'));

      // Only change to preheating status after modal has been opened
      // These will be set after the user confirms the preheat target
      await set(ref(rtdb, 'manualRoast/status'), 'idle'); // Keep as idle until target is set
      await set(ref(rtdb, 'manualRoast/phase'), 'idle');
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to start roasting. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const showStopConfirm = () => {
    setStopConfirmVisible(true);
  };

  const handleStopCancel = () => {
    setStopConfirmVisible(false);
  };

  const handleStopConfirm = async () => {
    setStoppingLoading(true);
    try {
      // Reset all RTDB values
      await set(ref(rtdb, 'manualRoast/status'), 'idle');
      await set(ref(rtdb, 'manualRoast/phase'), 'idle');
      await set(ref(rtdb, 'manualRoast/heater'), false);
      await set(ref(rtdb, 'manualRoast/motor'), false);
      await set(ref(rtdb, 'manualRoast/pidControl'), false);
      await set(ref(rtdb, 'manualRoast/temperature'), 0);
      await set(ref(rtdb, 'manualRoast/turningPoint'), 0);
      await set(ref(rtdb, 'manualRoast/beansInserted'), false);
      await set(ref(rtdb, 'manualRoast/targetTemp'), 0);
      await set(ref(rtdb, 'manualRoast/preHeatTargetTemp'), 0);
      await set(ref(rtdb, 'manualRoast/dryingTargetTemp'), 0);
      await set(ref(rtdb, 'manualRoast/dryingTargetTime'), 0);
      await set(ref(rtdb, 'manualRoast/firstCrackTargetTemp'), 0);
      await set(ref(rtdb, 'manualRoast/firstCrackTargetTime'), 0);
      await set(ref(rtdb, 'manualRoast/dropTargetTemp'), 0);
      await set(ref(rtdb, 'manualRoast/dropTargetTime'), 0);

      // Reset Redux state
      dispatch(resetRoast());

      notification.success({
        message: "Roasting Stopped",
        description: "The roasting process has been stopped and all data has been reset.",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to stop roasting. Please try again.",
      });
    } finally {
      setStoppingLoading(false);
      setStopConfirmVisible(false);
    }
  };

  const isIdle = status === 'idle';

  return (
    <>
      <Card
        title={
          <div className="flex items-center">
            <SlidersVertical className="mr-2" size={18} />
            <span>Kontrol Roasting</span>
          </div>
        }
        className="shadow-md"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Flame size={24} className="mr-2 text-red-500" />
              <p className="text-base font-semibold">Heater :</p>
            </div>
            <div className="flex items-center">
              <Switch
                checkedChildren="ON"
                unCheckedChildren="OFF"
                checked={heater}
                onChange={handleHeaterChange}
                disabled={isIdle}
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Fan size={24} className="mr-2 text-blue-500" />
              <p className="text-base font-semibold">Motor :</p>
            </div>
            <div className="flex items-center">
              <Switch
                checkedChildren="ON"
                unCheckedChildren="OFF"
                checked={motor}
                onChange={handleMotorChange}
                disabled={isIdle}
              />
            </div>
          </div>

          {isIdle ? (
            <Button
              type="primary"
              block
              size="large"
              icon={<Clock size={16} />}
              className="mt-6 dark-gradient hover-dark-gradient"
              onClick={handleStartRoasting}
              loading={loading}
              disabled={loading}
            >
              Mulai Roasting
            </Button>
          ) : (
            <Button
              type="primary"
              block
              size="large"
              icon={<Square size={16} />}
              className="mt-6 danger-gradient hover-danger-gradient"
              onClick={showStopConfirm}
            >
              Hentikan Roasting
            </Button>
          )}
        </div>
      </Card>

      {/* Stop Confirmation Modal */}
      <Modal
        title="Konfirmasi Batal Roasting"
        open={stopConfirmVisible}
        onCancel={handleStopCancel}
        footer={[
          <Button key="cancel" onClick={handleStopCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleStopConfirm}
            loading={stoppingLoading}
            className="danger-gradient hover-danger-gradient"
          >
            Hentikan
          </Button>,
        ]}
      >
        <p>Apakah Anda yakin ingin menghentikan proses pemanggangan? Ini akan mengatur ulang semua data pemanggangan.</p>
      </Modal>
    </>
  );
}