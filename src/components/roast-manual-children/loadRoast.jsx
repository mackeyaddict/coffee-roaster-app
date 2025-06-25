import React, { useState, useEffect } from 'react';
import { Modal, Select, Card, Button, Typography, Spin, notification, Row, Col, Divider } from 'antd';
import { Coffee, Clock, Thermometer, FileText, Calendar } from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../../firebase';

const { Option } = Select;
const { Title, Text } = Typography;

export default function LoadRoastModal({ 
  visible, 
  onCancel, 
  onLoadProfile,
  form 
}) {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchRoastProfiles();
    }
  }, [visible]);

  const fetchRoastProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const q = query(
        collection(db, "roastProfile"),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      const profilesData = [];
      
      querySnapshot.forEach((doc) => {
        profilesData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setProfiles(profilesData);
    } catch (error) {
      console.error("Error fetching roast profiles:", error);
      notification.error({
        message: 'Gagal Memuat Profil',
        description: 'Tidak dapat memuat daftar profil roasting.',
        duration: 5,
      });
    } finally {
      setLoadingProfiles(false);
    }
  };

  const handleProfileSelect = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    setSelectedProfile(profile);
    setSelectedProfileId(profileId);
  };

  const handleLoadProfile = () => {
    if (!selectedProfile) {
      notification.warning({
        message: 'Pilih Profil',
        description: 'Silakan pilih profil yang ingin dimuat.',
        duration: 3,
      });
      return;
    }

    setLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      onLoadProfile(selectedProfile);
      setLoading(false);
      
      notification.success({
        message: 'Profil Berhasil Dimuat',
        description: `Profil "${selectedProfile.name}" telah dimuat ke form.`,
        duration: 5,
      });
      
      // Reset modal state
      setSelectedProfile(null);
      setSelectedProfileId(null);
      onCancel();
    }, 500);
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Tanggal tidak tersedia';
    
    // Handle Firestore timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Coffee className="text-blue-500" size={20} />
          <span>Muat Profil Roasting</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Batal
        </Button>,
        <Button 
          key="load" 
          type="primary" 
          onClick={handleLoadProfile}
          loading={loading}
          disabled={!selectedProfile}
        >
          Muat Profil
        </Button>,
      ]}
    >
      <div className="space-y-4">
        <div>
          <Text strong>Pilih Profil Roasting:</Text>
          <Select
            placeholder="Pilih profil yang ingin dimuat"
            className="w-full mt-2"
            value={selectedProfileId}
            onChange={handleProfileSelect}
            loading={loadingProfiles}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {profiles.map(profile => (
              <Option key={profile.id} value={profile.id}>
                {profile.name} - {formatDate(profile.timestamp)}
              </Option>
            ))}
          </Select>
        </div>

        {loadingProfiles && (
          <div className="text-center py-8">
            <Spin size="large" />
            <div className="mt-2">
              <Text type="secondary">Memuat daftar profil...</Text>
            </div>
          </div>
        )}

        {!loadingProfiles && profiles.length === 0 && (
          <div className="text-center py-8">
            <Coffee size={48} className="mx-auto text-gray-300 mb-2" />
            <Text type="secondary">Belum ada profil roasting yang tersimpan</Text>
          </div>
        )}

        {selectedProfile && (
          <Card className="mt-4" bordered>
            <Title level={4} className="mb-4">
              {selectedProfile.name}
            </Title>
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer size={16} className="text-red-500" />
                  <Text strong>Target Suhu:</Text>
                  <Text>{selectedProfile.targetTemperature}°C</Text>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer size={16} className="text-orange-500" />
                  <Text strong>Suhu Drop:</Text>
                  <Text>{selectedProfile.dropTemperature}°C</Text>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-500" />
                  <Text strong>Durasi:</Text>
                  <Text>{formatDuration(selectedProfile.duration)}</Text>
                </div>
              </Col>
              
              <Col span={12}>
                <div className="flex items-center gap-2 mb-2">
                  <Coffee size={16} className="text-brown-500" />
                  <Text strong>Level Roast:</Text>
                  <Text>{selectedProfile.roastLevel || 'Tidak disebutkan'}</Text>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <Text strong>Tanggal:</Text>
                  <Text>{formatDate(selectedProfile.timestamp)}</Text>
                </div>
              </Col>
            </Row>

            {selectedProfile.description && (
              <>
                <Divider />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-gray-500" />
                    <Text strong>Deskripsi:</Text>
                  </div>
                  <Text type="secondary">{selectedProfile.description}</Text>
                </div>
              </>
            )}

            {selectedProfile.roastPhase && (
              <>
                <Divider />
                <div>
                  <Text strong className="block mb-2">Fase Roasting:</Text>
                  <div className="space-y-2 text-sm">
                    {selectedProfile.roastPhase.dryingPhase && (
                      <div>
                        <Text strong>Fase Pengeringan: </Text>
                        <Text type="secondary">
                          {selectedProfile.roastPhase.dryingPhase.startTime && 
                           selectedProfile.roastPhase.dryingPhase.endTime
                            ? `${selectedProfile.roastPhase.dryingPhase.startTime} - ${selectedProfile.roastPhase.dryingPhase.endTime} menit`
                            : 'Waktu tidak dicatat'}
                        </Text>
                      </div>
                    )}
                    {selectedProfile.roastPhase.firstCrack && selectedProfile.roastPhase.firstCrack.time && (
                      <div>
                        <Text strong>First Crack: </Text>
                        <Text type="secondary">
                          Menit ke-{selectedProfile.roastPhase.firstCrack.time}
                          {selectedProfile.roastPhase.firstCrack.temp && ` (${selectedProfile.roastPhase.firstCrack.temp}°C)`}
                        </Text>
                      </div>
                    )}
                    {selectedProfile.roastPhase.secondCrack && selectedProfile.roastPhase.secondCrack.time && (
                      <div>
                        <Text strong>Second Crack: </Text>
                        <Text type="secondary">
                          Menit ke-{selectedProfile.roastPhase.secondCrack.time}
                          {selectedProfile.roastPhase.secondCrack.temp && ` (${selectedProfile.roastPhase.secondCrack.temp}°C)`}
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </Card>
        )}
      </div>
    </Modal>
  );
}