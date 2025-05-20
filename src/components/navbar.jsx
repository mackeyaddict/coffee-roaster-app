import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, LogIn, Menu, X, User, Home, LayoutDashboard, Coffee } from 'lucide-react';
import { Button, Image, Avatar, Drawer } from 'antd';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { logout } from '../redux/slice/auth.slice';
import { PAGE_URL } from '../utils/constant';
import Logo from '../assets/images/black-company-logo.webp'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogin = () => {
    navigate(PAGE_URL.LOGIN);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
      navigate(PAGE_URL.HOME);
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-white max-w-7xl mx-4 md:mx-auto my-4 rounded-3xl px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="flex justify-between h-20 relative">
          <div className="absolute md:top-0 left-0 md:right-0 flex justify-center items-center h-full pointer-events-none">
            <Link to={PAGE_URL.HOME} className="flex-shrink-0 flex items-center pointer-events-auto">
              <Image
                src={Logo}
                width={64}
                height={64}
                alt="Logo"
                preview={false}
              />
            </Link>
          </div>
          <div className="flex items-center w-full">
            {/* Desktop menu */}
            <div className="w-full hidden md:flex justify-start">
              <Link to={PAGE_URL.HOME} className="px-3 py-2 text-black hover:!bg-gradient-to-r hover:!from-[#555555] hover:!to-[#111111] hover:text-white transition-colors ease-out duration-500 rounded-xl">
                Home
              </Link>
              {isAuthenticated && (
                <Link to={PAGE_URL.DASHBOARD} className="px-3 py-2 text-black hover:!bg-gradient-to-r hover:!from-[#555555] hover:!to-[#111111] hover:text-white transition-colors ease-out duration-500 rounded-xl">
                  Dashboard
                </Link>
              )}
              <Link to={PAGE_URL.ABOUT} className="px-3 py-2 text-black hover:!bg-gradient-to-r hover:!from-[#555555] hover:!to-[#111111] hover:text-white transition-colors ease-out duration-500 rounded-xl">
                About
              </Link>
            </div>
          </div>

          {/* Auth buttons - Desktop */}
          <div className="hidden md:flex md:items-center md:ml-6 w-full md:justify-end">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-black flex items-center gap-2">
                  <User size={16} />
                  {user?.fullName || user?.email}
                </div>
                <Button
                  type="primary"
                  onClick={handleLogout}
                  className='dark-gradient hover-dark-gradient'
                  icon={<LogOut size={16} />}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                type="primary"
                className='dark-gradient hover-dark-gradient'
                onClick={handleLogin}
                icon={<LogIn size={16} />}
              >
                Login
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <Drawer
        title={
          <div className="flex justify-center">
            <Image
              src={Logo}
              width={48}
              height={48}
              alt="Logo"
              preview={false}
            />
          </div>
        }
        placement="right"
        closable={true}
        closeIcon={<X size={24} />}
        onClose={() => setIsMenuOpen(false)}
        open={isMenuOpen}
        width="100%"
        className="md:hidden"
      >
        <div className="px-4 py-3">
          {isAuthenticated && (
            <div className="flex items-center gap-4 mb-4 bg-gray-50 p-3 rounded-xl">
              <Avatar
                icon={<User />}
                className="bg-gray-200 text-gray-700"
                size="large"
              />
              <div>
                <div className="font-medium">{user?.fullName || 'User'}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Link
              to={PAGE_URL.HOME}
              className="flex items-center gap-3 px-4 py-3 !text-black rounded-xl transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home size={20} />
              <span>Home</span>
            </Link>

            {isAuthenticated && (
              <Link
                to={PAGE_URL.DASHBOARD}
                className="flex items-center gap-3 px-4 py-3 !text-black rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
            )}

            <Link
              to="/about"
              className="flex items-center gap-3 px-4 py-3 !text-black rounded-xl transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Coffee size={20} />
              <span>About</span>
            </Link>
          </div>
        </div>

        <div className="p-4 mt-2 border-t border-gray-100">
          {isAuthenticated ? (
            <Button
              type="primary"
              block
              onClick={handleLogout}
              icon={<LogOut size={16} className="mr-1" />}
              className="dark-gradient border-0 rounded-xl h-12 flex items-center justify-center"
            >
              Logout
            </Button>
          ) : (
            <Button
              type="primary"
              block
              onClick={handleLogin}
              icon={<LogIn size={16} className="mr-1" />}
              className="dark-gradient border-0 rounded-xl h-12 flex items-center justify-center"
            >
              Login
            </Button>
          )}
        </div>
      </Drawer>
    </nav>
  );
}