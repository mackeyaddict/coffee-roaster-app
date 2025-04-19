import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, LogIn, Menu, X, User } from 'lucide-react';
import { Button } from 'antd';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { logout } from '../redux/slice/auth.slice';
import { PAGE_URL } from '../utils/constant';

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
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={PAGE_URL.HOME} className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">AppName</span>
            </Link>
            
            {/* Desktop menu */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link to={PAGE_URL.HOME} className="px-3 py-2 text-gray-700 hover:text-blue-600">
                Home
              </Link>
              {isAuthenticated && (
                <Link to={PAGE_URL.DASHBOARD} className="px-3 py-2 text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          
          {/* Auth buttons - Desktop */}
          <div className="hidden md:flex md:items-center md:ml-6">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-700">
                  <User size={16} className="inline mr-1" />
                  {user.fullName || user.email}
                </div>
                <Button 
                  type="default"
                  onClick={handleLogout}
                  icon={<LogOut size={16} />}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button 
                type="primary"
                className="bg-blue-600"
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
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to={PAGE_URL.HOME} 
              className="block px-3 py-2 text-gray-700 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link 
                to={PAGE_URL.DASHBOARD} 
                className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="px-4 space-y-3">
                <div className="text-sm font-medium text-gray-700">
                  <User size={16} className="inline mr-1" />
                  {user.fullName || user.email}
                </div>
                <Button 
                  type="default"
                  block
                  onClick={handleLogout}
                  icon={<LogOut size={16} />}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="px-4 py-2">
                <Button 
                  type="primary"
                  block
                  className="bg-blue-600"
                  onClick={handleLogin}
                  icon={<LogIn size={16} />}
                >
                  Login
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}