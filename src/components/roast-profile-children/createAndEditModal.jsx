import { Form, Input, InputNumber, Modal, Select, Divider } from "antd";
const { TextArea } = Input;

export default function CreateAndEditModal({
  isEditing,
  formModalVisible,
  setFormModalVisible,
  handleFormSubmit,
  form,
}) {
  return (
    <Modal
      title={isEditing ? "Ubah Profil Roasting" : "Buat Profil Roasting"}
      open={formModalVisible}
      onCancel={() => {
        setFormModalVisible(false);
      }}
      onOk={handleFormSubmit}
      width={800}
      style={{ top: 20 }}
      bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        name="roastProfileForm"
      >
        <h2 className="mb-4 text-xl font-semibold">Informasi Dasar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item
            name="name"
            label="Nama Profil"
            rules={[{ required: true, message: "Masukan nama profil roasting terlebih dahulu" }]}
          >
            <Input placeholder="Cth: Ethiopia Yirgacheffe Natural G1" />
          </Form.Item>

          <Form.Item
            name="roastLevel"
            label="Tingkat Sangrai"
            rules={[{ required: true, message: "Pilih tingkat sangrai" }]}
          >
            <Select placeholder="Pilih tingkat sangrai" options={[
              { value: "Light", label: "Light" },
              { value: "Medium-Light", label: "Medium-Light" },
              { value: "Medium", label: "Medium" },
              { value: "Medium-Dark", label: "Medium-Dark" },
              { value: "Dark", label: "Dark" },
              { value: "Very Dark", label: "Very Dark" },
            ]} />
          </Form.Item>
        </div>

        <Form.Item
          name="description"
          label="Deskripsi"
          rules={[{ required: false, message: "Masukan deskripsi profil" }]} // Optional
        >
          <TextArea rows={3} placeholder="Cth: Bright, floral light roast with citrus notes" />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item
            name="duration"
            label="Durasi Total (menit)"
            rules={[{ required: true, message: "Masukan durasi roasting terlebih dahulu" }]}
          >
            <InputNumber min={0} placeholder="Cth: 11" className="!w-full" addonAfter="menit" />
          </Form.Item>

          <Form.Item
            name="dropTemperature"
            label="Drop Temperature (°C)"
            rules={[{ required: true, message: "Masukan drop temperature" }]}
          >
            <InputNumber min={0} placeholder="Cth: 210" className="!w-full" addonAfter="°C" />
          </Form.Item>
        </div>

        <Divider />

        {/* Roast Phase Section */}
        <h2 className="mb-4 text-xl font-semibold">Detail Fase Roasting</h2>

        {/* Drying Phase */}
        <div className="p-4 border rounded-md mb-4">
          <h2 className="!mb-3 text-base font-semibold">Fase Pengeringan (Drying Phase)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4">
            <Form.Item
              name={["roastPhase", "dryingPhase", "startTime"]}
              label="Waktu Mulai"
              initialValue={0}
              rules={[{ required: true, message: "Waktu mulai wajib diisi" }]}
            >
              <InputNumber min={0} className="!w-full" addonBefore="Menit ke-" placeholder="Cth: 0" />
            </Form.Item>
            <Form.Item
              name={["roastPhase", "dryingPhase", "startTemp"]}
              label="Suhu Mulai"
              initialValue={120}
              rules={[{ required: true, message: "Suhu mulai wajib diisi" }]}
            >
              <InputNumber min={0} className="!w-full" addonAfter="°C" placeholder="Cth: 120" />
            </Form.Item>
            <Form.Item
              name={["roastPhase", "dryingPhase", "endTime"]}
              label="Waktu Selesai"
              rules={[{ required: true, message: "Waktu selesai wajib diisi" }]}
            >
              <InputNumber min={0} className="!w-full" addonBefore="Menit ke-" placeholder="Cth: 5" />
            </Form.Item>
            <Form.Item
              name={["roastPhase", "dryingPhase", "endTemp"]}
              label="Suhu Selesai"
              rules={[{ required: true, message: "Suhu selesai wajib diisi" }]}
            >
              <InputNumber min={0} className="!w-full" addonAfter="°C" placeholder="Cth: 160" />
            </Form.Item>
          </div>
          <Form.Item name={["roastPhase", "dryingPhase", "notes"]} label="Catatan Fase Pengeringan">
            <TextArea rows={2} placeholder="Catatan untuk fase pengeringan (opsional)" />
          </Form.Item>
        </div>
        {/* First Crack */}
        <div className="p-4 border rounded-md mb-4">
          <h2 className="!mb-3 text-base font-semibold">First Crack</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
              name={["roastPhase", "firstCrack", "time"]}
              label="Waktu First Crack"
              rules={[{ required: true, message: "Waktu first crack wajib diisi" }]}
            >
              <InputNumber min={0} className="!w-full" addonBefore="Menit ke-" placeholder="Cth: 5" />
            </Form.Item>
            <Form.Item
              name={["roastPhase", "firstCrack", "temp"]}
              label="Suhu First Crack"
              rules={[{ required: true, message: "Suhu first crack wajib diisi" }]}
            >
              <InputNumber min={0} className="!w-full" addonAfter="°C" placeholder="Cth: 160" />
            </Form.Item>
          </div>
          <Form.Item name={["roastPhase", "firstCrack", "notes"]} label="Catatan First Crack">
            <TextArea rows={2} placeholder="Catatan untuk first crack (opsional)" />
          </Form.Item>
        </div>

        {/* Development Phase */}
        <div className="p-4 border rounded-md mb-4">
          <h2 className="!mb-3 text-base font-semibold">Fase Pengembangan (Development Phase)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4">
            <Form.Item
              name={["roastPhase", "developmentPhase", "startTime"]}
              label="Waktu Mulai"
              rules={[{ required: true, message: "Waktu mulai wajib diisi" }]}
            >
              <InputNumber min={0} className="!w-full" addonBefore="Menit ke-" placeholder="Cth: 9" />
            </Form.Item>
            <Form.Item
              name={["roastPhase", "developmentPhase", "startTemp"]}
              label="Suhu Mulai"
              rules={[{ required: true, message: "Suhu mulai wajib diisi" }]}
            >
              <InputNumber min={0} className="!w-full" addonAfter="°C" placeholder="Cth: 190" />
            </Form.Item>
            <Form.Item
              name={["roastPhase", "developmentPhase", "endTime"]}
              label="Waktu Selesai"
              rules={[{ required: true, message: "Waktu selesai wajib diisi" }]}
            >
              <InputNumber min={0} className="!w-full" addonBefore="Menit ke-" placeholder="Cth: 11" />
            </Form.Item>
            <Form.Item
              name={["roastPhase", "developmentPhase", "endTemp"]}
              label="Suhu Selesai"
              rules={[{ required: true, message: "Suhu selesai wajib diisi" }]}
            >
              <InputNumber min={0} className="!w-full" addonAfter="°C" placeholder="Cth: 210" />
            </Form.Item>
          </div>
          <Form.Item name={["roastPhase", "developmentPhase", "notes"]} label="Catatan Fase Pengembangan">
            <TextArea rows={2} placeholder="Catatan untuk fase pengembangan (opsional)" />
          </Form.Item>
        </div>

        {/* Second Crack (Optional Fields) */}
        <div className="p-4 border rounded-md">
          <h2 className="!mb-3 text-base font-semibold">Second Crack (Opsional)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item name={["roastPhase", "secondCrack", "time"]} label="Waktu Second Crack">
              <InputNumber min={0} className="!w-full" addonBefore="Menit ke-" placeholder="Jika ada" />
            </Form.Item>
            <Form.Item name={["roastPhase", "secondCrack", "temp"]} label="Suhu Second Crack">
              <InputNumber min={0} className="!w-full" addonAfter="°C" placeholder="Jika ada" />
            </Form.Item>
          </div>
          <Form.Item name={["roastPhase", "secondCrack", "notes"]} label="Catatan Second Crack">
            <TextArea rows={2} placeholder="Catatan untuk second crack (opsional)" />
          </Form.Item>
        </div>

      </Form>
    </Modal>
  );
}