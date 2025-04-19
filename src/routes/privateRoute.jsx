
import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";
import { PAGE_URL } from "../utils/constant";

const PrivateRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to={PAGE_URL.LOGIN} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;