import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";

function App() {
  const sellerId = localStorage.getItem("seller_id");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={sellerId ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        <Route path="/dashboard" element={sellerId ? <DashboardPage /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
