import { Modal, Button, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "../../redux/slice/roast.slice";

const { Title, Text } = Typography;

export default function TurningPointDetectedModal() {
  const { isModalOpen, modalType, turningPoint } = useSelector((state) => state.roast);
  const dispatch = useDispatch();
  
  const handleClose = () => {
    dispatch(closeModal());
  };

  return (
    <Modal
      title="Turning Point Detected"
      open={isModalOpen && modalType === 'turningPointDetected'}
      onCancel={handleClose}
      footer={[
        <Button 
          key="continue" 
          type="primary" 
          onClick={handleClose}
          className="bg-blue-600"
        >
          Continue Roasting
        </Button>,
      ]}
    >
      <div className="space-y-4">
        <Title level={4}>Turning Point Detected!</Title>
        <Text>
          The turning point has been detected at {turningPoint}°C. This is the lowest temperature
          point after bean insertion. The beans are now absorbing heat properly.
        </Text>
        <Text strong>
          The roaster is now in the drying phase. The system will continue monitoring
          the temperature until the drying phase target is reached.
        </Text>
      </div>
    </Modal>
  );
}