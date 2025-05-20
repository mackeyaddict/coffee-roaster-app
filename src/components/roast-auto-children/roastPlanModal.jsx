import { Form, Modal, InputNumber, Button, Divider } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { 
  closeModal, 
  setDryingTargetTemp, 
  setDryingTargetTime,
  setFirstCrackTargetTemp,
  setFirstCrackTargetTime,
  setDropTargetTemp,
  setDropTargetTime,
  togglePidControl
} from "../../redux/slice/roast.slice";
import { ref, set } from "firebase/database";
import { rtdb } from "../../../firebase";

export default function RoastPlanModal() {
  const { isModalOpen, modalType, dropTargetTemp, dropTargetTime } = useSelector((state) => state.roast);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const { 
        dryingTargetTemp, 
        dryingTargetTime, 
        firstCrackTargetTemp, 
        firstCrackTargetTime,
        dropTargetTemp: newDropTargetTemp,
        dropTargetTime: newDropTargetTime 
      } = values;
      
      // Validate that phases don't exceed drop targets
      if (dryingTargetTime + firstCrackTargetTime > newDropTargetTime) {
        form.setFields([
          {
            name: 'dryingTargetTime',
            errors: ['Total time exceeds drop target time']
          },
          {
            name: 'firstCrackTargetTime',
            errors: ['Total time exceeds drop target time']
          }
        ]);
        return;
      }
      
      if (firstCrackTargetTemp > newDropTargetTemp) {
        form.setFields([
          {
            name: 'firstCrackTargetTemp',
            errors: ['Temperature exceeds drop target temperature']
          }
        ]);
        return;
      }
      
      // Update Firebase RTDB
      await set(ref(rtdb, 'manualRoast/dryingTargetTemp'), dryingTargetTemp);
      await set(ref(rtdb, 'manualRoast/dryingTargetTime'), dryingTargetTime);
      await set(ref(rtdb, 'manualRoast/firstCrackTargetTemp'), firstCrackTargetTemp);
      await set(ref(rtdb, 'manualRoast/firstCrackTargetTime'), firstCrackTargetTime);
      await set(ref(rtdb, 'manualRoast/dropTargetTemp'), newDropTargetTemp);
      await set(ref(rtdb, 'manualRoast/dropTargetTime'), newDropTargetTime);
      await set(ref(rtdb, 'manualRoast/pidControl'), true);
      
      // Update Redux state
      dispatch(setDryingTargetTemp(dryingTargetTemp));
      dispatch(setDryingTargetTime(dryingTargetTime));
      dispatch(setFirstCrackTargetTemp(firstCrackTargetTemp));
      dispatch(setFirstCrackTargetTime(firstCrackTargetTime));
      dispatch(setDropTargetTemp(newDropTargetTemp));
      dispatch(setDropTargetTime(newDropTargetTime));
      dispatch(togglePidControl(true)); // Enable PID control
      dispatch(closeModal());
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  return (
    <Modal
      title="Set Roast Plan"
      open={isModalOpen && modalType === 'roastPlan'}
      onOk={handleOk}
      onClose={false}
      width={600}
      footer={[
        <Button key="submit" type="primary" onClick={handleOk} className="bg-blue-600">
          Start Roasting With Plan
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        name="roastPlanForm"
        initialValues={{ 
          dryingTargetTemp: 150,
          dryingTargetTime: 240,
          firstCrackTargetTemp: 180,
          firstCrackTargetTime: 180,
          dropTargetTemp: 200,
          dropTargetTime: 600
        }}
      >
        <Divider orientation="left">Drying Phase</Divider>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="dryingTargetTemp"
            label="Target Temperature (°C)"
            rules={[
              { required: true, message: 'Please input target temperature!' },
              { type: 'number', min: 100, max: 200, message: 'Temperature must be between 100°C and 200°C' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="dryingTargetTime"
            label="Target Time (seconds)"
            rules={[
              { required: true, message: 'Please input target time!' },
              { type: 'number', min: 60, message: 'Time must be at least 60 seconds' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <Divider orientation="left">First Crack Phase</Divider>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="firstCrackTargetTemp"
            label="Target Temperature (°C)"
            rules={[
              { required: true, message: 'Please input target temperature!' },
              { type: 'number', min: 150, max: 220, message: 'Temperature must be between 150°C and 220°C' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="firstCrackTargetTime"
            label="Target Time (seconds)"
            rules={[
              { required: true, message: 'Please input target time!' },
              { type: 'number', min: 60, message: 'Time must be at least 60 seconds' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <Divider orientation="left">Drop Target</Divider>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="dropTargetTemp"
            label="Drop Temperature (°C)"
            rules={[
              { required: true, message: 'Please input drop temperature!' },
              { type: 'number', min: 170, max: 240, message: 'Temperature must be between 170°C and 240°C' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="dropTargetTime"
            label="Drop Time (seconds)"
            rules={[
              { required: true, message: 'Please input drop time!' },
              { type: 'number', min: 300, message: 'Time must be at least 300 seconds' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <p className="text-orange-500 text-sm">
          Note: Total drying and first crack time should be less than drop time, and temperatures should be in increasing order.
        </p>
      </Form>
    </Modal>
  );
}