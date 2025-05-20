import { Form, Modal, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, setPhase } from "../../redux/slice/roast.slice";
import { ref, set } from "firebase/database";
import { rtdb } from "../../../firebase";

export default function BeansInsertedModal() {
  const { isModalOpen, modalType } = useSelector((state) => state.roast);
  const dispatch = useDispatch();

  const visible = isModalOpen && modalType === 'beansInserted';

  const handleConfirmInserted = async () => {
    try {
      await set(ref(rtdb, 'manualRoast/beansInserted'), true);
      await set(ref(rtdb, 'manualRoast/phase'), 'drying');

      dispatch(setPhase('drying'));

      dispatch(closeModal());

    } catch (error) {
      console.error("Error confirming beans inserted:", error);
    }
  };

  return (
    <Modal
      title="Beans Insertion"
      open={visible}
      onCancel={false}
      closeIcon={false}
      maskClosable={false}
      footer={[
        <Button key="submit" type="primary" onClick={handleConfirmInserted} className="dark-gradient hover-dark-gradient">
          Yes, Beans Inserted
        </Button>,
      ]}
    >
      <p>Pre Heat Target Temperature has been reached!</p>
      <p>Have you inserted the coffee beans?</p>
    </Modal>
  );
}