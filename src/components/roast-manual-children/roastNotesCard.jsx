import { useEffect } from 'react';
import { Card, Form, Input, InputNumber } from 'antd';
import { Coffee, Thermometer, Timer } from 'lucide-react';;

export default function RoastNotesCard({
  roastLog,
  handleRoastLogChange,
}) {
  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldsValue({
      name: roastLog.name,
      duration: roastLog.duration,
      roastLevel: roastLog.roastLevel,
      description: roastLog.description,
      dropTemperature: roastLog.dropTemperature,
      roastPhase: {
        dryingPhase: roastLog.roastPhase.dryingPhase,
        firstCrack: roastLog.roastPhase.firstCrack,
        developmentPhase: roastLog.roastPhase.developmentPhase,
        secondCrack: roastLog.roastPhase.secondCrack,
      }
    });
  }, [roastLog, form]);

  const onFormValuesChange = (changedValues, allValues) => {
    for (const key in changedValues) {
      if (Object.hasOwnProperty.call(changedValues, key)) {
        if (key === 'roastPhase') { // Handle nested roastPhase changes
          for (const phaseKey in changedValues.roastPhase) {
            if (Object.hasOwnProperty.call(changedValues.roastPhase, phaseKey)) {
              for (const fieldKey in changedValues.roastPhase[phaseKey]) {
                if (Object.hasOwnProperty.call(changedValues.roastPhase[phaseKey], fieldKey)) {
                  const path = `roastPhase.${phaseKey}.${fieldKey}`;
                  handleRoastLogChange(path, changedValues.roastPhase[phaseKey][fieldKey]);
                }
              }
            }
          }
        } else {
          handleRoastLogChange(key, changedValues[key]);
        }
      }
    }
  };
  return (
    <Card bordered={false} className="mt-6 shadow-lg rounded-lg">
      <div className="p-2">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Roast Log & Notes</h2>
        <Form
          form={form}
          layout="vertical"
          className="space-y-6"
          onValuesChange={onFormValuesChange}
          initialValues={roastLog}
        >
          <div className="grid grid-cols-1 gap-2">
            <Form.Item
              name="name"
              label="Nama"
            >
              <Input
                prefix={<Coffee size={16} className="mr-2 text-gray-400" />}
                placeholder="e.g., City, Full City, Vienna"
                className="w-full"
              />
            </Form.Item>
            <Form.Item
              name="description"
              label="Deskripsi"
            >
              <Input.TextArea
                rows={2}
                placeholder="Catatan keseluruhan roasting."
                className="w-full"
              />
            </Form.Item>
            <Form.Item
              name="dropTemperature"
              label="Drop Temperature"
            >
              <Input
                prefix={<Thermometer size={16} className="mr-2 text-gray-400" />}
                placeholder="150"
                className="w-full"
              />
            </Form.Item>
            <Form.Item
              name="duration"
              label="Durasi"
            >
              <Input
                prefix={<Timer size={16} className="mr-2 text-gray-400" />}
                placeholder="150"
                className="w-full"
              />
            </Form.Item>
          </div>

          <h3 className="text-lg font-medium text-gray-700 mt-4 border-b pb-2">Fase Roasting</h3>

          {/* Drying Phase */}
          <div className="p-4 border rounded-md mb-4">
            <h2 className="text-base font-semibold text-gray-700 mb-3">Fase Pengeringan (Drying Phase)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4">
              <Form.Item
                name={["roastPhase", "dryingPhase", "startTime"]}
                label="Waktu Mulai"
              >
                <Input className="!w-full" addonBefore="Menit ke-" placeholder="Cth: 0" />
              </Form.Item>
              <Form.Item
                name={["roastPhase", "dryingPhase", "startTemp"]}
                label="Suhu Mulai (°C)"
              >
                <InputNumber min={0} className="!w-full" placeholder="Cth: 120" addonAfter="°C"/>
              </Form.Item>
              <Form.Item
                name={["roastPhase", "dryingPhase", "endTime"]}
                label="Waktu Selesai"
              >
                <Input className="!w-full" placeholder="Cth: 5" addonBefore="Menit ke-" />
              </Form.Item>
              <Form.Item
                name={["roastPhase", "dryingPhase", "endTemp"]}
                label="Suhu Selesai (°C)"
              >
                <InputNumber min={0} className="!w-full" placeholder="Cth: 160" addonAfter="°C" />
              </Form.Item>
            </div>
            <Form.Item
              name={["roastPhase", "dryingPhase", "notes"]}
              label="Catatan Fase Pengeringan"
              className="mt-2"
            >
              <Input.TextArea rows={2} placeholder="Catatan untuk fase pengeringan (opsional)" />
            </Form.Item>
          </div>

          {/* First Crack */}
          <div className="p-4 border rounded-md mb-4">
            <h2 className="text-base font-semibold text-gray-700 mb-3">First Crack</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Form.Item
                name={["roastPhase", "firstCrack", "time"]}
                label="Waktu First Crack"
              >
                <Input className="!w-full" placeholder="Cth: 9" addonBefore="Menit ke-" />
              </Form.Item>
              <Form.Item
                name={["roastPhase", "firstCrack", "temp"]}
                label="Suhu First Crack (°C)"
              >
                <InputNumber min={0} className="!w-full" placeholder="Cth: 196" addonAfter="°C" />
              </Form.Item>
            </div>
            <Form.Item
              name={["roastPhase", "firstCrack", "notes"]}
              label="Catatan First Crack"
              className="mt-2"
            >
              <Input.TextArea rows={2} placeholder="Catatan untuk first crack (opsional)" />
            </Form.Item>
          </div>

          {/* Development Phase */}
          <div className="p-4 border rounded-md mb-4">
            <h2 className="text-base font-semibold text-gray-700 mb-3">Fase Pengembangan (Development Phase)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4">
              <Form.Item
                name={["roastPhase", "developmentPhase", "startTime"]}
                label="Waktu Mulai"
              >
                <Input className="!w-full" placeholder="Cth: 9" addonBefore="Menit ke-" />
              </Form.Item>
              <Form.Item
                name={["roastPhase", "developmentPhase", "startTemp"]}
                label="Suhu Mulai (°C)"
              >
                <InputNumber min={0} className="!w-full" placeholder="Cth: 198" addonAfter="°C" />
              </Form.Item>
              <Form.Item
                name={["roastPhase", "developmentPhase", "endTime"]}
                label="Waktu Selesai"
              >
                <Input className="!w-full" placeholder="Cth: 12" addonBefore="Menit ke-" />
              </Form.Item>
              <Form.Item
                name={["roastPhase", "developmentPhase", "endTemp"]}
                label="Suhu Selesai (°C)"
              >
                <InputNumber min={0} className="!w-full" placeholder="Cth: 210" addonAfter="°C" />
              </Form.Item>
            </div>
            <Form.Item
              name={["roastPhase", "developmentPhase", "notes"]}
              label="Catatan Fase Pengembangan"
              className="mt-2"
            >
              <Input.TextArea rows={2} placeholder="Catatan untuk fase pengembangan (opsional)" />
            </Form.Item>
          </div>

          {/* Second Crack (Optional Fields) */}
          <div className="p-4 border rounded-md">
            <h2 className="text-base font-semibold text-gray-700 mb-3">Second Crack (Opsional)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Form.Item name={["roastPhase", "secondCrack", "time"]} label="Waktu Second Crack">
                <Input className="!w-full" placeholder="Jika ada, cth: 12" addonBefore="Menit ke-" />
              </Form.Item>
              <Form.Item name={["roastPhase", "secondCrack", "temp"]} label="Suhu Second Crack (°C)">
                <InputNumber min={0} className="!w-full" placeholder="Jika ada, cth: 220" addonAfter="°C" />
              </Form.Item>
            </div>
            <Form.Item
              name={["roastPhase", "secondCrack", "notes"]}
              label="Catatan Second Crack"
              className="mt-2"
            >
              <Input.TextArea rows={2} placeholder="Catatan untuk second crack (opsional)" />
            </Form.Item>
          </div>
        </Form>
      </div>
    </Card>
  );
}