import React, { useState } from "react";
import { Form, Input, Modal, InputNumber, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, setPreHeatTargetTemp, setStatus, setPhase, toggleHeater, toggleMotor } from "../../redux/slice/roast.slice";
import { ref, set } from "firebase/database";
import { rtdb } from "../../../firebase";

export default function PreHeatModal() {
  const { isModalOpen, modalType } = useSelector((state) => state.roast);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const { preHeatTarget } = values;
      
      // Update Firebase RTDB
      await set(ref(rtdb, 'manualRoast/preHeatTargetTemp'), preHeatTarget);
      
      // Update Redux state
      dispatch(setPreHeatTargetTemp(preHeatTarget));
      
      await set(ref(rtdb, 'manualRoast/status'), 'preheating');
      await set(ref(rtdb, 'manualRoast/phase'), 'preheating');
      await set(ref(rtdb, 'manualRoast/heater'), true);
      await set(ref(rtdb, 'manualRoast/motor'), true);
      dispatch(setStatus('preheating'));
      dispatch(setPhase('preheating'));
      dispatch(toggleHeater(true));
      dispatch(toggleMotor(true));
      
      dispatch(closeModal());
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    dispatch(closeModal());
  };

  return (
    <Modal
      title="Set Pre Heat Target"
      open={isModalOpen && modalType === 'preHeat'}
      onOk={handleOk}
      onCancel={handleCancel}
      closable={false}
      maskClosable={false}
      keyboard={false}
      footer={[
        <Button key="back" onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleOk} 
          loading={loading}
          className="bg-blue-600"
        >
          Set Target
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        name="preHeatForm"
        initialValues={{ preHeatTarget: 150 }}
      >
        <Form.Item
          name="preHeatTarget"
          label="Target Pre Heat Temperature (°C)"
          rules={[
            { required: true, message: 'Please input target pre heat temperature!' },
            { type: 'number', min: 100, max: 200, message: 'Temperature must be between 100°C and 200°C' }
          ]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <p className="text-gray-500 text-sm">
          This will be the initial temperature for drying phase.
        </p>
      </Form>
    </Modal>
  );
}