import { Button, Modal } from "antd";
import { formatFirebaseTimestamp } from "../../utils/timeTranslate"; // Assuming this utility function is correctly implemented

export default function DetailModal({ detailModalVisible, setDetailModalVisible, currentProfile }) {
  return (
    <Modal
      title="Roast Profile Details"
      open={detailModalVisible}
      onCancel={() => setDetailModalVisible(false)}
      footer={[
        <Button key="close" onClick={() => setDetailModalVisible(false)}>
          Tutup
        </Button>,
      ]}
      width={800} 
    >
      {currentProfile && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">ID</h3>
            <p className="text-base">{currentProfile.id}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Nama</h3>
            <p className="text-base">{currentProfile.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Deskripsi</h3>
            <p className="text-base">{currentProfile.description}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Tingkat Sangrai</h3>
            <p className="text-base">{currentProfile.roastLevel}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Durasi Total</h3>
            <p className="text-base">{currentProfile.duration} menit</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Drop Temperature</h3>
            <p className="text-base">{currentProfile.dropTemperature}°C</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Tanggal & Waktu</h3>
            <p className="text-base">
              {currentProfile.timestamp ? formatFirebaseTimestamp(currentProfile.timestamp) : 'N/A'}
            </p>
          </div>

          {currentProfile.roastPhase && (
            <div className="space-y-4 mt-6 pt-4 border-t">
              <h2 className="text-lg font-semibold">Fase Roasting</h2>

              {/* Drying Phase */}
              {currentProfile.roastPhase.dryingPhase && (
                <div className="p-4 border rounded-md">
                  <h4 className="text-md font-medium text-gray-700">Fase Pengeringan (Drying Phase)</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Waktu Mulai</p>
                      <p className="text-sm">{currentProfile.roastPhase.dryingPhase.startTime} menit</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Suhu Mulai</p>
                      <p className="text-sm">{currentProfile.roastPhase.dryingPhase.startTemp}°C</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Waktu Selesai</p>
                      <p className="text-sm">{currentProfile.roastPhase.dryingPhase.endTime} menit</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Suhu Selesai</p>
                      <p className="text-sm">{currentProfile.roastPhase.dryingPhase.endTemp}°C</p>
                    </div>
                    {currentProfile.roastPhase.dryingPhase.notes && (
                      <div className="col-span-2">
                        <p className="text-xs font-medium text-gray-500">Catatan</p>
                        <p className="text-sm">{currentProfile.roastPhase.dryingPhase.notes || "-"}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* First Crack */}
              {currentProfile.roastPhase.firstCrack && (
                <div className="p-4 border rounded-md">
                  <h4 className="text-md font-medium text-gray-700">First Crack</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Waktu</p>
                      <p className="text-sm">{currentProfile.roastPhase.firstCrack.time !== "" ? `${currentProfile.roastPhase.firstCrack.time} menit` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Suhu</p>
                      <p className="text-sm">{currentProfile.roastPhase.firstCrack.temp !== "" ? `${currentProfile.roastPhase.firstCrack.temp}°C` : "-"}</p>
                    </div>
                    {currentProfile.roastPhase.firstCrack.notes && (
                      <div className="col-span-2">
                        <p className="text-xs font-medium text-gray-500">Catatan</p>
                        <p className="text-sm">{currentProfile.roastPhase.firstCrack.notes || "-"}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Development Phase */}
              {currentProfile.roastPhase.developmentPhase && (
                <div className="p-4 border rounded-md">
                  <h4 className="text-md font-medium text-gray-700">Fase Pengembangan (Development Phase)</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Waktu Mulai</p>
                      <p className="text-sm">{currentProfile.roastPhase.developmentPhase.startTime} menit</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Suhu Mulai</p>
                      <p className="text-sm">{currentProfile.roastPhase.developmentPhase.startTemp}°C</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Waktu Selesai</p>
                      <p className="text-sm">{currentProfile.roastPhase.developmentPhase.endTime} menit</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Suhu Selesai</p>
                      <p className="text-sm">{currentProfile.roastPhase.developmentPhase.endTemp}°C</p>
                    </div>
                    {currentProfile.roastPhase.developmentPhase.notes && (
                      <div className="col-span-2">
                        <p className="text-xs font-medium text-gray-500">Catatan</p>
                        <p className="text-sm">{currentProfile.roastPhase.developmentPhase.notes || "-"}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Second Crack */}
              {currentProfile.roastPhase.secondCrack && (
                <div className="p-4 border rounded-md">
                  <h4 className="text-md font-medium text-gray-700">Second Crack</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Waktu</p>
                      <p className="text-sm">{currentProfile.roastPhase.secondCrack.time !== "" ? `${currentProfile.roastPhase.secondCrack.time} menit` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Suhu</p>
                      <p className="text-sm">{currentProfile.roastPhase.secondCrack.temp !== "" ? `${currentProfile.roastPhase.secondCrack.temp}°C` : "-"}</p>
                    </div>
                    {currentProfile.roastPhase.secondCrack.notes && (
                      <div className="col-span-2">
                        <p className="text-xs font-medium text-gray-500">Catatan</p>
                        <p className="text-sm">{currentProfile.roastPhase.secondCrack.notes || "-"}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}