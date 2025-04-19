import { Navigate, Route, Routes } from "react-router";
import { PAGE_URL } from "./utils/constant";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import Login from "./pages/login";
import PrivateRoute from "./routes/privateRoute";
import Navbar from "./components/navbar";

function App() {
  return (
    <>
      <Navbar/>
      <Routes>
        <Route path={PAGE_URL.HOME} element={<Home />} />
        <Route path={PAGE_URL.LOGIN} element={<Login />} />

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path={PAGE_URL.DASHBOARD} element={<Dashboard />} />
        </Route>

        <Route path="*" element={<Navigate to={PAGE_URL.HOME} replace />} />
      </Routes>
    </>
  );
}

export default App;