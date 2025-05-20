import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Spin, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, getDoc } from 'firebase/firestore';
import { currentTimestamp, db } from '../../../firebase';
import { formatFirebaseTimestamp } from '../../utils/timeTranslate';
import DetailModal from '../../components/roast-profile-children/detailModal';
import CreateAndEditModal from '../../components/roast-profile-children/createAndEditModal';

export default function RoastProfile() {
  const [roastProfiles, setRoastProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  // Fetch roast profiles from Firestore
  const fetchRoastProfiles = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'roastProfile'));
      const profiles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRoastProfiles(profiles);
    } catch (error) {
      console.error('Error fetching roast profiles:', error);
      message.error('Failed to fetch roast profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoastProfiles();
  }, []);

  // Handle view profile details
  const handleViewDetails = (profile) => {
    setCurrentProfile(profile);
    setDetailModalVisible(true);
  };

  // Handle delete profile
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'roastProfile', id));
      message.success('Roast profile deleted successfully');
      fetchRoastProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      message.error('Failed to delete roast profile');
    }
  };

  // Handle edit profile
  const handleEdit = (profile) => {
    setCurrentProfile(profile);
    form.setFieldsValue({
      // Basic information
      name: profile.name,
      roastLevel: profile.roastLevel,
      description: profile.description,
      duration: profile.duration,
      dropTemperature: profile.dropTemperature,

      // Roast phases - using array notation to match your form structure
      roastPhase: {
        // Drying Phase
        dryingPhase: {
          startTime: profile.roastPhase.dryingPhase.startTime,
          startTemp: profile.roastPhase.dryingPhase.startTemp,
          endTime: profile.roastPhase.dryingPhase.endTime,
          endTemp: profile.roastPhase.dryingPhase.endTemp,
          notes: profile.roastPhase.dryingPhase.notes,
        },

        // First Crack
        firstCrack: {
          time: profile.roastPhase.firstCrack.time,
          temp: profile.roastPhase.firstCrack.temp,
          notes: profile.roastPhase.firstCrack.notes,
        },

        // Development Phase
        developmentPhase: {
          startTime: profile.roastPhase.developmentPhase.startTime,
          startTemp: profile.roastPhase.developmentPhase.startTemp,
          endTime: profile.roastPhase.developmentPhase.endTime,
          endTemp: profile.roastPhase.developmentPhase.endTemp,
          notes: profile.roastPhase.developmentPhase.notes,
        },

        // Second Crack
        secondCrack: {
          time: profile.roastPhase.secondCrack.time,
          temp: profile.roastPhase.secondCrack.temp,
          notes: profile.roastPhase.secondCrack.notes,
        }
      }
    });

    setIsEditing(true);
    setFormModalVisible(true);
  };
  // Handle add new profile
  const handleAddNew = () => {
    setCurrentProfile(null);
    form.resetFields();
    setIsEditing(false);
    setFormModalVisible(true);
  };

  // Handle form submit
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Add timestamp
      const profileData = {
        ...values,
        timestamp: currentTimestamp,
      };

      if (isEditing && currentProfile) {
        // Update existing profile
        await updateDoc(doc(db, 'roastProfile', currentProfile.id), profileData);
        message.success('Profil roasting berhasil diubah');
      } else {
        // Create new profile
        await addDoc(collection(db, 'roastProfile'), profileData);
        message.success('Profil roasting berhasil dibuat');
      }

      setFormModalVisible(false);
      fetchRoastProfiles();
    } catch (error) {
      console.error('Error saving roast profile:', error);
      message.error('Gagal menyimpan profil roasting');
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Nama Profile',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Durasi (menit)',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Drop Temperature (°C)',
      dataIndex: 'dropTemperature',
      key: 'dropTemperature',
    },
    {
      title: 'Tanggal & Waktu',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => {
        return formatFirebaseTimestamp(text, 'DD MMMM YYYY, HH:mm');
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Hapus Roasting Profile"
            description="Apakah Anda yakin ingin menghapus profil roasting ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Profil Roasting</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddNew}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Tambah Profil
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <Table
            columns={columns}
            dataSource={roastProfiles}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="w-full"
            scroll={{ x: 'max-content' }}
          />
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal
        detailModalVisible={detailModalVisible}
        setDetailModalVisible={setDetailModalVisible}
        currentProfile={currentProfile}
      />

      {/* Create/Edit Modal */}
      <CreateAndEditModal
        isEditing={isEditing}
        formModalVisible={formModalVisible}
        setFormModalVisible={setFormModalVisible}
        handleFormSubmit={handleFormSubmit}
        form={form}
      />
    </div>
  );
}