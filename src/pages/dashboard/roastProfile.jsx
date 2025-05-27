import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Form, Input, InputNumber, Spin, Popconfirm, message, Select, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { useDebounce } from 'use-debounce';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, getDoc } from 'firebase/firestore';
import { currentTimestamp, db } from '../../../firebase';
import { formatFirebaseTimestamp } from '../../utils/timeTranslate';
import DetailModal from '../../components/roast-profile-children/detailModal';
import CreateAndEditModal from '../../components/roast-profile-children/createAndEditModal';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function RoastProfile() {
  const [roastProfiles, setRoastProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  // Search and Filter states
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText] = useDebounce(searchText, 300);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    roastLevel: '',
    durationRange: [null, null],
    temperatureRange: [null, null],
    dateRange: [null, null]
  });

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

  // Filter and search logic
  const filteredProfiles = useMemo(() => {
    let filtered = roastProfiles;

    // Search filter - using debounced search text
    if (debouncedSearchText) {
      filtered = filtered.filter(profile =>
        profile.name?.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
        profile.description?.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
        profile.roastLevel?.toLowerCase().includes(debouncedSearchText.toLowerCase())
      );
    }

    // Roast level filter
    if (filters.roastLevel) {
      filtered = filtered.filter(profile =>
        profile.roastLevel === filters.roastLevel
      );
    }

    // Duration range filter
    if (filters.durationRange[0] !== null && filters.durationRange[1] !== null) {
      filtered = filtered.filter(profile =>
        profile.duration >= filters.durationRange[0] &&
        profile.duration <= filters.durationRange[1]
      );
    }

    // Temperature range filter
    if (filters.temperatureRange[0] !== null && filters.temperatureRange[1] !== null) {
      filtered = filtered.filter(profile =>
        profile.dropTemperature >= filters.temperatureRange[0] &&
        profile.dropTemperature <= filters.temperatureRange[1]
      );
    }

    // Date range filter
    if (filters.dateRange[0] && filters.dateRange[1]) {
      filtered = filtered.filter(profile => {
        if (!profile.timestamp) return false;
        const profileDate = dayjs(profile.timestamp.toDate());
        return profileDate.isAfter(filters.dateRange[0]) && profileDate.isBefore(filters.dateRange[1]);
      });
    }

    return filtered;
  }, [roastProfiles, debouncedSearchText, filters]);

  // Get unique roast levels for filter dropdown
  const roastLevels = useMemo(() => {
    const levels = [...new Set(roastProfiles.map(profile => profile.roastLevel).filter(Boolean))];
    return levels.sort();
  }, [roastProfiles]);

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchText('');
    setFilters({
      roastLevel: '',
      durationRange: [null, null],
      temperatureRange: [null, null],
      dateRange: [null, null]
    });
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchText ||
      filters.roastLevel ||
      (filters.durationRange[0] !== null || filters.durationRange[1] !== null) ||
      (filters.temperatureRange[0] !== null || filters.temperatureRange[1] !== null) ||
      (filters.dateRange[0] || filters.dateRange[1]);
  }, [searchText, filters]);

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
      title: 'Level Roasting',
      dataIndex: 'roastLevel',
      key: 'roastLevel',
      render: (text) => (
        <span className="px-2 py-1 bg-gray-100 rounded-md text-sm">
          {text}
        </span>
      ),
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
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Profil Roasting</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddNew}
          className="bg-blue-500 hover:bg-blue-600 shrink-0"
        >
          Tambah Profil
        </Button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
          <div className="md:col-span-2">
            <Search
              placeholder="Cari nama profil, deskripsi, atau level roasting..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              value={searchText}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button
              icon={<FilterOutlined />}
              onClick={() => setFilterVisible(!filterVisible)}
              type={hasActiveFilters ? "primary" : "default"}
              className="flex-1 sm:flex-none"
            >
              Filter {hasActiveFilters && `(${Object.values(filters).filter(f => f && f !== '' && (Array.isArray(f) ? f.some(v => v !== null) : true)).length})`}
            </Button>

            {hasActiveFilters && (
              <Button
                icon={<ClearOutlined />}
                onClick={clearFilters}
                type="text"
                className="text-gray-600 hover:text-gray-800"
              >
                <span className='hidden md:block'>Hapus Filter dan Pencarian</span>
              </Button>
            )}
          </div>

          <div className="text-sm text-gray-600 text-right">
            <span className="font-medium">{filteredProfiles.length}</span> dari <span className="font-medium">{roastProfiles.length}</span> profil
          </div>
        </div>

        {/* Advanced Filters */}
        {filterVisible && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level Roasting
                </label>
                <Select
                  placeholder="Pilih level roasting"
                  allowClear
                  className="w-full"
                  value={filters.roastLevel}
                  onChange={(value) => handleFilterChange('roastLevel', value)}
                >
                  {roastLevels.map(level => (
                    <Option key={level} value={level}>{level}</Option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durasi (menit)
                </label>
                <div className="flex gap-2">
                  <InputNumber
                    placeholder="Min"
                    className="flex-1"
                    value={filters.durationRange[0]}
                    onChange={(value) => handleFilterChange('durationRange', [value, filters.durationRange[1]])}
                  />
                  <InputNumber
                    placeholder="Max"
                    className="flex-1"
                    value={filters.durationRange[1]}
                    onChange={(value) => handleFilterChange('durationRange', [filters.durationRange[0], value])}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Drop Temperature (°C)
                </label>
                <div className="flex gap-2">
                  <InputNumber
                    placeholder="Min"
                    className="flex-1"
                    value={filters.temperatureRange[0]}
                    onChange={(value) => handleFilterChange('temperatureRange', [value, filters.temperatureRange[1]])}
                  />
                  <InputNumber
                    placeholder="Max"
                    className="flex-1"
                    value={filters.temperatureRange[1]}
                    onChange={(value) => handleFilterChange('temperatureRange', [filters.temperatureRange[0], value])}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Dibuat
                </label>
                <RangePicker
                  className="w-full"
                  value={filters.dateRange}
                  onChange={(dates) => handleFilterChange('dateRange', dates)}
                  format="DD/MM/YYYY"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredProfiles}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} profil`,
            className: "px-6 py-4"
          }}
          className="w-full"
          scroll={{ x: 'max-content' }}
        />
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