import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { LogIn, UserPlus } from 'lucide-react';
import { Form, Input, Button, Alert, Card, Image } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined} from '@ant-design/icons';
import { login } from '../../redux/slice/auth.slice';
import { auth } from '../../../firebase';
import { PAGE_URL } from '../../utils/constant';
import Logo from '../../assets/images/black-company-logo.webp'

export default function Login() {
  const [form] = Form.useForm();
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    form.resetFields();
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
          {isSignUp ? 'Create your account' : 'Hello Barista!'}
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
                  { required: true, message: 'Please input your full name!' },
                  { min: 2, message: 'Name must be at least 2 characters' }
                ]}
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="Full Name"
                  size="large"
                />
              </Form.Item>
            )}

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email address' }
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
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters' }
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
                <a className="text-blue-600 hover:text-blue-500" href="#">
                  Forgot password?
                </a>
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
                {isSignUp ? 'Sign up' : 'Sign in'}
              </Button>
            </Form.Item>
          </Form>
          <div className="mt-4 text-center">
            <span className="text-gray-500">
              {isSignUp ? 'Already have an account?' : 'Need an account?'}
              <Button
                type="link"
                onClick={toggleAuthMode}
                className="p-0 ml-1 text-blue-600 hover:text-blue-500"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </Button>
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}