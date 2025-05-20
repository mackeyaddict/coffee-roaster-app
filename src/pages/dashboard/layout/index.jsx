import React, { useState, useEffect } from 'react';
import { ConfigProvider, Layout, Menu, Drawer, Image } from 'antd';
import { Link, useLocation } from 'react-router';
import {
  Home,
  User,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Menu as MenuIcon,
  Flame,
  ListChecks
} from 'lucide-react';
import { PAGE_URL } from '../../../utils/constant';
import Logo from '../../../assets/images/white-company-logo.webp'
import Waves from '../../../assets/waves.svg'

const { Header, Sider, Content } = Layout;

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const location = useLocation();

  // Monitor window size for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setDrawerVisible(false);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const menuItems = [
    {
      key: PAGE_URL.DASHBOARD,
      icon: <LayoutDashboard size={16} className="text-white" />,
      label: <Link to={PAGE_URL.DASHBOARD} onClick={() => isMobile && setDrawerVisible(false)}>Dashboard</Link>,
    },
    {
      key: PAGE_URL.ROASTPROFILE,
      icon: <ListChecks size={16} className="text-white" />,
      label: <Link to={PAGE_URL.ROASTPROFILE} onClick={() => isMobile && setDrawerVisible(false)}>Roast Profile</Link>,
    },
    {
      key: PAGE_URL.ROAST,
      icon: <Flame size={16} className="text-white" />,
      label: <Link to={PAGE_URL.ROAST} onClick={() => isMobile && setDrawerVisible(false)}>Roast</Link>,
    },
    {
      key: PAGE_URL.HOME,
      icon: <Home size={16} className="text-white" />,
      label: <Link to={PAGE_URL.HOME} onClick={() => isMobile && setDrawerVisible(false)}>Home</Link>,
    },
  ];

  // Common menu configuration
  const menuConfig = {
    theme: "light",
    mode: "inline",
    selectedKeys: [location.pathname],
    items: menuItems,
  };

  // Sidebar component for desktop
  const sidebarContent = (
    <div className='sticky top-0 z-10 min-h-screen overflow-hidden'>
      <div className="flex justify-center items-center px-4 py-12">
        <img src={Logo} alt="Logo" className="w-[100px]" />
      </div>

      <div className="absolute -rotate-45 -bottom-28 right-0 w-full">
        <Image
          src={Waves}
          preview={false}
          className="w-full object-cover min-w-[600px]"
        />
      </div>

      {/* Menu Items */}
      <Menu {...menuConfig} />
    </div>
  );

  return (
    <Layout className="min-h-screen">
      <ConfigProvider
        theme={{
          components: {
            Menu: {
              itemMarginBlock: 16,
              itemMarginInline: 16,
              fontSize: 14,
              colorIcon: "#FFFFFF",
              colorText: "#FFFFFF",
              itemBg: "transparent",
              itemSelectedBg: "#fff",
              itemSelectedColor: "#111111",
              subMenuItemBg: "transparent",
              subMenuItemSelectedBg: "#FFFFFF",
              subMenuItemSelectedColor: "#111111",
              itemHoverColor: "#111111",
              itemHoverBg: "#fff",
              popupBg: "transparent",
              activeBarBorderWidth: 0,
              subMenuOpenBg: "#FFFFFF",
              itemActiveBg: "#fff",
              itemActiveColor: "#111111",
              activeBarWidth: "0px",
              itemBorderRadius: "20px",
            },
            Drawer: {
              contentBackground: "#000000",
            }
          },
        }}
      >
        {/* Desktop Sidebar - Hidden on mobile */}
        {!isMobile && (
          <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            className='!bg-gradient-to-b !from-[#000000] !via-[#333333] !to-[#888888] !border-0'
            width={250}
          >
            {sidebarContent}
          </Sider>
        )}

        {/* Mobile Drawer - Only visible on mobile */}
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible && isMobile}
          width={250}
          bodyStyle={{ padding: 0, backgroundColor: "#000000" }}
        >
          {sidebarContent}
        </Drawer>

        <Layout>
          <Header
            className="px-4 flex bg-gray-100 items-center justify-between shadow-sm h-16 sticky top-0 z-10 !bg-gradient-to-r !from-[#000000] !via-[#333333] !to-[#888888] !border-0"
            style={{ backgroundColor: "#000000" }}
          >
            {isMobile ? (
              <button
                onClick={() => setDrawerVisible(true)}
                className="border border-gray-600 rounded-md p-2 hover:bg-gray-800 transition-colors"
              >
                <MenuIcon size={18} className="text-white" />
              </button>
            ) : (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="bg-white text-black rounded-md p-2 hover:bg-gray-200 cursor-pointer transition-colors"
              >
                {collapsed ? (
                  <ChevronRight size={18} />
                ) : (
                  <ChevronLeft size={18} />
                )}
              </button>
            )}

            {/* Page Title */}
            <h1 className="text-lg font-medium text-white">Dashboard</h1>

            {/* User Profile */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              {!isMobile && <span className="text-sm font-medium text-white">Admin User</span>}
            </div>
          </Header>

          <Content className="p-4 md:m-6 bg-white rounded-lg shadow-sm">
            {children}
          </Content>
        </Layout>
      </ConfigProvider>
    </Layout>
  );
}