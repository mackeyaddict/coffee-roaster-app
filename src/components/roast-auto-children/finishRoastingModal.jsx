import { Modal, Button, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, resetRoast, setStatus } from "../../redux/slice/roast.slice";
import { ref, set } from "firebase/database";
import { rtdb } from "../../../firebase";

const { Title, Text } = Typography;

export default function FinishRoastingModal() {
  const { isModalOpen, modalType } = useSelector((state) => state.roast);
  const dispatch = useDispatch();
  
  const handleFinishRoasting = async () => {
    try {
      // Reset Firebase RTDB
      await set(ref(rtdb, 'manualRoast/status'), 'idle');
      await set(ref(rtdb, 'manualRoast/phase'), 'idle');
      await set(ref(rtdb, 'manualRoast/heater'), false);
      await set(ref(rtdb, 'manualRoast/motor'), false);
      await set(ref(rtdb, 'manualRoast/pidControl'), false);
      
      // Reset Redux state
      dispatch(setStatus('idle'));
      dispatch(resetRoast());
      dispatch(closeModal());
    } catch (error) {
      console.error("Error finishing roasting:", error);
    }
  };

  const handleContinue = () => {
    dispatch(closeModal());
  };

  return (
    <Modal
      title="Finish Roasting"
      open={isModalOpen && modalType === 'finishRoasting'}
      onCancel={handleContinue}
      footer={[
        <Button key="continue" onClick={handleContinue}>
          Continue Roasting
        </Button>,
        <Button 
          key="finish" 
          type="primary" 
          onClick={handleFinishRoasting}
          className="bg-red-600 hover:bg-red-700"
        >
          Finish Roasting
        </Button>,
      ]}
    >
      <div className="space-y-4">
        <Title level={4}>Are you sure you want to finish roasting?</Title>
        <Text>
          Finishing will stop the heater and motor, and reset all roasting parameters.
        </Text>
        <Text type="warning">
          This action cannot be undone.
        </Text>
      </div>
    </Modal>
  );
}