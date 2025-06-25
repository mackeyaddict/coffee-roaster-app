import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Switch, Alert, Divider, Card } from 'antd';
import { Thermometer, Save, Clock, Timer, Coffee } from 'lucide-react';
import { formatElapsedTime } from '../../utils/timeTranslate';

export function StartRoastModal({
  visible,
  onCancel,
  onFinish,
  form,
  maxSafetyTemp,
  SYSTEM_MAX_TEMPERATURE
}) {
  const [isTimerEnabled, setIsTimerEnabled] = useState(form.getFieldValue('timerEnabled') || false);

  useEffect(() => {
    const unsubscribe = form.getFieldInstance('timerEnabled')?.addEventListener('change', (e) => {
      setIsTimerEnabled(e.target.checked);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [form]);

  return (
    <Modal
      title="Parameter Roasting"
      open={visible}
      onOk={() => form.submit()}
      onCancel={onCancel}
      okText="Mulai Roasting"
      cancelText="Batal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          targetTemperature: 180,
          maxSafetyTemp: 220,
          autoShutoff: true,
          timerEnabled: false,
          timerDuration: 5
        }}
      >
        <Divider orientation="left">Temperatur</Divider>

        <Form.Item
          name="targetTemperature"
          label="Target Temperatur (°C)"
          rules={[
            { required: true, message: 'Masukan target temperatur terlebih dahulu' },
            { type: 'number', min: 50, max: SYSTEM_MAX_TEMPERATURE - 20, message: `Temperatur harus diantara 50°C ${SYSTEM_MAX_TEMPERATURE - 20}°C` }
          ]}
          tooltip="Suhu yang diinginkan untuk pemanggangan ini. Anda akan diberitahu ketika suhu tersebut tercapai."
        >
          <InputNumber
            min={50}
            max={SYSTEM_MAX_TEMPERATURE - 20}
            prefix={<Thermometer size={16} className="mr-2" />}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="maxSafetyTemp"
          label="Suhu Maksimum Keamanan (°C)"
          rules={[
            { required: true, message: 'Masukan suhu maksimum keamanan terlebih dahulu' },
            { type: 'number', min: 100, max: SYSTEM_MAX_TEMPERATURE - 10, message: `Suhu harus diantara 100°C dan ${SYSTEM_MAX_TEMPERATURE - 10}°C` }
          ]}
          tooltip="Suhu maksimum yang aman untuk pemanggangan ini. Pemanas akan mati otomatis jika suhu mendekati nilai ini."
        >
          <InputNumber
            min={100}
            max={SYSTEM_MAX_TEMPERATURE - 10}
            prefix={<Thermometer size={16} className="mr-2" />}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="autoShutoff"
          label="Nyalakan Auto-Shutoff"
          valuePropName="checked"
          tooltip="Matikan pemanas secara otomatis saat 10°C di bawah suhu maksimum"
        >
          <Switch />
        </Form.Item>

        <Divider orientation="left">Timer</Divider>

        <Form.Item
          name="timerEnabled"
          label="Nyalakan Timer"
          valuePropName="checked"
          tooltip="Dapatkan pemberitahuan saat pemanggangan mencapai durasi tertentu"
        >
          <Switch onChange={(checked) => setIsTimerEnabled(checked)} />
        </Form.Item>

        <Form.Item
          name="timerDuration"
          label="Durasi Timer (menit)"
          rules={[
            { type: 'number', min: 1, max: 60, message: 'Durasi harus antara 1 dan 60 menit' }
          ]}
          tooltip="Atur waktu timer untuk mendapatkan pemberitahuan"
        >
          <InputNumber
            min={1}
            max={60}
            prefix={<Timer size={16} className="mr-2" />}
            style={{ width: '100%' }}
            disabled={!isTimerEnabled}
          />
        </Form.Item>

        <Alert
          message="Informasi Keamanan"
          description={`Pemanas akan mati secara otomatis pada ${maxSafetyTemp - 10}°C jika auto-shutoff dinyalakan. Sistem temperatur maksimal mutlak adalah ${SYSTEM_MAX_TEMPERATURE}°C.`}
          type="info"
          showIcon
        />
      </Form>
    </Modal>
  );
}
export function StopConfirmModal({ visible, onOk, onCancel }) {
  return (
    <Modal
      title="Konfirmasi Hentikan Roasting"
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText="Ya, Hentikan Roasting"
      cancelText="Lanjutkan Roasting"
    >
      <p>Apakah Anda yakin ingin menghentikan proses pemanggangan?</p>
      <p>Semua elemen pemanas dan motor akan dimatikan.</p>
    </Modal>
  );
}

export function SaveDataModal({
  visible,
  onCancel,
  onFinish,
  form,
}) {
  const convertToNumber = (value) => {
    if (value === "" || value === null || value === undefined) {
      return null;
    }
    const num = Number(value);
    return isNaN(num) ? null : num;
  };
  return (
    <Modal
      title={<span className="text-xl font-semibold text-gray-700">Simpan Detail Roast Profile</span>}
      open={visible}
      onOk={() => form.submit()}
      onCancel={onCancel}
      okText="Simpan Profile"
      cancelText="Jangan Simpan"
      width={800}
      destroyOnClose
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="space-y-5"
      >
        {/* Section 1: Roast Name and Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
          <Form.Item
            name="name"
            label={<span className="text-sm font-medium text-gray-600">Nama Roasting Profile</span>}
            rules={[{ required: true, message: 'Silakan masukkan nama profil' }]}
            className="mb-0"
          >
            <Input prefix={<Save size={16} className="mr-2 text-gray-400" />} placeholder="Nama profil roasting" />
          </Form.Item>
          <Form.Item
            name="roastLevel"
            label={<span className="text-sm font-medium text-gray-600">Roast Level</span>}
            className="mb-0"
          >
            <Input prefix={<Coffee size={16} className="mr-2 text-gray-400" />} placeholder="e.g., City, Full City" />
          </Form.Item>
        </div>

        {/* Section 2: Description */}
        <Form.Item
          name="description"
          label={<span className="text-sm font-medium text-gray-600">Deskripsi/Catatan Umum</span>}
          className="mb-0"
        >
          <Input.TextArea rows={2} placeholder="Catatan umum tentang roasting ini" maxLength={500} showCount />
        </Form.Item>

        <Form.Item
          name="dropTemperature"
          label={<span className="text-xs font-medium text-gray-500">Drop Temp (°C)</span>}
          className="mb-0"
        >
          <Input type='number' style={{ width: '100%' }} prefix={<Thermometer size={16} className="mr-2 text-gray-400" />} addonAfter="°C" />
        </Form.Item>

        <Form.Item
          name="duration"
          label={<span className="text-xs font-medium text-gray-500">Durasi</span>}
          className="mb-0"
        >
          <Input type='number' style={{ width: '100%' }} prefix={<Timer size={16} className="mr-2 text-gray-400" />} addonAfter="Menit" />
        </Form.Item>

        <h3 className="text-md font-semibold text-gray-700 pt-3 border-t mt-3">Detail Fase Roasting</h3>

        <div className='flex flex-col gap-4'>
          {/* Drying Phase Inputs */}
          <Card size="small" className="rounded shadow-sm">
            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Drying Phase</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
                <Form.Item name="dryingPhaseStartTime" label={<span className="text-xs">Start Time</span>} className="mb-0">
                  <Input type='number' placeholder="5" size="small" addonBefore="Menit" />
                </Form.Item>
                <Form.Item name="dryingPhaseStartTemp" label={<span className="text-xs">Start Temp (°C)</span>} className="mb-0">
                  <Input type='number' className="w-full" placeholder="150" size="small" addonAfter="°C" />
                </Form.Item>
                <Form.Item name="dryingPhaseEndTime" label={<span className="text-xs">End Time</span>} className="mb-0">
                  <Input type='number' placeholder="10" size="small" addonBefore="Menit" />
                </Form.Item>
                <Form.Item name="dryingPhaseEndTemp" label={<span className="text-xs">End Temp (°C)</span>} className="mb-0">
                  <Input type='number' className="w-full" placeholder="165" size="small" addonAfter="°C" />
                </Form.Item>
              </div>
              <Form.Item name="dryingPhaseNotes" label={<span className="text-xs">Notes</span>} className="mt-2 mb-0">
                <Input.TextArea rows={1} placeholder="Yellowing, aroma..." size="small" maxLength={100} showCount />
              </Form.Item>
            </div>
          </Card>

          {/* First Crack Inputs */}
          <Card size="small" className="rounded shadow-sm">
            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-600 mb-2">First Crack</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
                <Form.Item name="firstCrackTime" label={<span className="text-xs">Time</span>} className="mb-0">
                  <Input type='number' placeholder="10" size="small" addonBefore="Menit" />
                </Form.Item>
                <Form.Item name="firstCrackTemp" label={<span className="text-xs">Temp (°C)</span>} className="mb-0">
                  <Input type='number' className="w-full" placeholder="196" size="small" addonAfter="°C" />
                </Form.Item>
                <div className="sm:col-span-1">
                  <Form.Item name="firstCrackNotes" label={<span className="text-xs">Notes</span>} className="mb-0">
                    <Input.TextArea rows={1} placeholder="Mulai terdengar..." size="small" maxLength={100} showCount />
                  </Form.Item>
                </div>
              </div>
            </div>
          </Card>

          {/* Development Phase Inputs */}
          <Card size="small" className="rounded shadow-sm">
            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Development Phase</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
                <Form.Item name="developmentPhaseStartTime" label={<span className="text-xs">Start Time</span>} className="mb-0">
                  <Input type='number' placeholder="11" size="small" addonBefore="Menit" />
                </Form.Item>
                <Form.Item name="developmentPhaseStartTemp" label={<span className="text-xs">Start Temp (°C)</span>} className="mb-0">
                  <Input type='number' className="w-full" placeholder="198" size="small" addonAfter="°C" />
                </Form.Item>
                <Form.Item name="developmentPhaseEndTime" label={<span className="text-xs">End Time</span>} className="mb-0">
                  <Input placeholder="12" size="small" addonBefore="Menit" />
                </Form.Item>
                <Form.Item name="developmentPhaseEndTemp" label={<span className="text-xs">End Temp (°C)</span>} className="mb-0">
                  <Input type='number' className="w-full" placeholder="210" size="small" addonAfter="°C" />
                </Form.Item>
              </div>
              <Form.Item name="developmentPhaseNotes" label={<span className="text-xs">Notes</span>} className="mt-2 mb-0">
                <Input.TextArea rows={1} placeholder="Pengembangan aroma..." size="small" maxLength={100} showCount />
              </Form.Item>
            </div>
          </Card>

          {/* Second Crack Inputs */}
          <Card size="small" className="rounded shadow-sm">
            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Second Crack (jika ada)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
                <Form.Item name="secondCrackTime" label={<span className="text-xs">Time</span>} className="mb-0">
                  <Input type='number' placeholder="15" size="small" addonBefore="Menit" />
                </Form.Item>
                <Form.Item name="secondCrackTemp" label={<span className="text-xs">Temp (°C)</span>} className="mb-0">
                  <Input type='number' className="w-full" placeholder="220" size="small" addonAfter="°C" />
                </Form.Item>
                <div className="sm:col-span-1">
                  <Form.Item name="secondCrackNotes" label={<span className="text-xs">Notes</span>} className="mb-0">
                    <Input.TextArea rows={1} placeholder="Crack lebih halus..." size="small" maxLength={100} showCount />
                  </Form.Item>
                </div>
              </div>
            </div>
          </Card>
        </div>

      </Form>
    </Modal>
  );
}