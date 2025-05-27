import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { LogIn, UserPlus, Mail } from 'lucide-react';
import { Form, Input, Button, Alert, Card, Image, Modal, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined} from '@ant-design/icons';
import { login } from '../../redux/slice/auth.slice';
import { auth } from '../../../firebase';
import { PAGE_URL } from '../../utils/constant';
import Logo from '../../assets/images/black-company-logo.webp'

export default function Login() {
  const [form] = Form.useForm();
  const [resetForm] = Form.useForm();
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAuth = async (values) => {
    setError('');
    setLoading(true);

    try {
      let userCredential;

      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      }

      const { user } = userCredential;

      dispatch(login({
        uid: user.uid,
        email: user.email,
        fullName: values.fullName || user.displayName || '',
      }));

      navigate(PAGE_URL.DASHBOARD);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (values) => {
    setResetLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, values.email);
      message.success('Email reset password telah dikirim! Periksa inbox Anda.');
      setResetModalVisible(false);
      resetForm.resetFields();
    } catch (err) {
      let errorMessage = 'Terjadi kesalahan saat mengirim email reset password.';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Email tidak ditemukan dalam sistem.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Terlalu banyak permintaan. Coba lagi nanti.';
      }
      
      message.error(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    form.resetFields();
  };

  const openResetModal = () => {
    setResetModalVisible(true);
  };

  const closeResetModal = () => {
    setResetModalVisible(false);
    resetForm.resetFields();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex justify-center">
            <Image
            src={Logo}
            width={150}
            height={150}
            preview={false}
            />
        </div>
        <h1 className="text-xl mt-6 text-center">
          {isSignUp ? 'Buat Akun' : 'Halo, Homie!'}
        </h1>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          {error && (
            <Alert
              message="Authentication Error"
              description={error}
              type="error"
              showIcon
              className="mb-4"
            />
          )}

          <Form
            form={form}
            name="auth_form"
            layout="vertical"
            onFinish={handleAuth}
            initialValues={{ remember: true }}
            autoComplete="off"
          >
            {isSignUp && (
              <Form.Item
                name="fullName"
                rules={[
                  { required: true, message: 'Masukan nama panjang terlebih dahulu!' },
                  { min: 2, message: 'Nama harus memiliki setidaknya 2 karakter' }
                ]}
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="Nama Lengkap"
                  size="large"
                />
              </Form.Item>
            )}

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Masukan email terlebih dahulu!' },
                { type: 'email', message: 'Masukan email yang valid' }
              ]}
            >
              <Input
                prefix={<MailOutlined className="site-form-item-icon" />}
                placeholder="Email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Masukan password terlebih dahulu!' },
                { min: 6, message: 'Password harus memiliki setidaknya 6 karakter' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Password"
                size="large"
              />
            </Form.Item>

            {!isSignUp && (
              <Form.Item>
                <Button
                  type="link"
                  onClick={openResetModal}
                  className="p-0 text-blue-600 hover:text-blue-500"
                >
                  Lupa Password?
                </Button>
              </Form.Item>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="dark-gradient hover-dark-gradient"
                icon={isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
              >
                {isSignUp ? 'Daftar' : 'Login'}
              </Button>
            </Form.Item>
          </Form>
          <div className="mt-4 text-center">
            <span className="text-gray-500">
              {isSignUp ? 'Sudah punya akun?' : 'Perlu akun?'}
              <Button
                type="link"
                onClick={toggleAuthMode}
                className="p-0 ml-1 text-blue-600 hover:text-blue-500"
              >
                {isSignUp ? 'Login' : 'Daftar'}
              </Button>
            </span>
          </div>
        </Card>
      </div>

      {/* Reset Password Modal */}
      <Modal
        title="Reset Password"
        open={resetModalVisible}
        onCancel={closeResetModal}
        footer={null}
        centered
      >
        <div className="mb-4">
          <p className="text-gray-600">
            Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
          </p>
        </div>
        
        <Form
          form={resetForm}
          name="reset_password_form"
          layout="vertical"
          onFinish={handlePasswordReset}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Masukan email terlebih dahulu!' },
              { type: 'email', message: 'Masukan email yang valid' }
            ]}
          >
            <Input
              prefix={<MailOutlined className="site-form-item-icon" />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex gap-2">
              <Button
                onClick={closeResetModal}
                size="large"
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={resetLoading}
                size="large"
                className="flex-1"
                icon={<Mail size={16} />}
              >
                Kirim Email Reset
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}