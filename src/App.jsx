import { Navigate, Route, Routes, useLocation } from "react-router";
import { PAGE_URL } from "./utils/constant";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import Login from "./pages/login";
import PrivateRoute from "./routes/privateRoute";
import Navbar from "./components/navbar";
import RoastProfile from "./pages/dashboard/roastProfile";
import Roast from "./pages/dashboard/roast";
import About from "./pages/about";
import { useSelector } from "react-redux";
import Footer from "./components/footer";

function App() {
  const location = useLocation();
  const showNavbarAndFooter = [PAGE_URL.HOME, PAGE_URL.LOGIN, PAGE_URL.ABOUT].includes(location.pathname);
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <>
      {showNavbarAndFooter && <Navbar />}
      <Routes>
        <Route path={PAGE_URL.HOME} element={<Home />} />
        <Route path={PAGE_URL.LOGIN} element={isAuthenticated ? <Navigate to={PAGE_URL.HOME} replace/> : <Login/>} />
        <Route path={PAGE_URL.ABOUT} element={<About />} />

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path={PAGE_URL.DASHBOARD} element={<Dashboard />} />
          <Route path={PAGE_URL.ROASTPROFILE} element={<RoastProfile />} />
          <Route path={PAGE_URL.ROAST} element={<Roast />} />
        </Route>

        <Route path="*" element={<Navigate to={PAGE_URL.HOME} replace />} />
      </Routes>
      {showNavbarAndFooter && <Footer />}
    </>
  );
}

export default App;