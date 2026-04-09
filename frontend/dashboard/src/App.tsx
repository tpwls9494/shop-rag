import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";

function App() {
  const [sellerId, setSellerId] = useState<string | null>(localStorage.getItem("seller_id"));

  const login = (id: string, widgetId: string, shopName: string) => {
    localStorage.setItem("seller_id", id);
    localStorage.setItem("widget_id", widgetId);
    localStorage.setItem("shop_name", shopName);
    setSellerId(id);
  };

  const logout = () => {
    localStorage.clear();
    setSellerId(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={sellerId ? <Navigate to="/dashboard" replace /> : <RegisterPage onLogin={login} />} />
        <Route path="/dashboard" element={sellerId ? <DashboardPage onLogout={logout} /> : <Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
