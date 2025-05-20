
import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";
import { PAGE_URL } from "../utils/constant";
import DashboardLayout from "../pages/dashboard/layout";

const PrivateRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to={PAGE_URL.LOGIN} replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  ) 
};

export default PrivateRoute;