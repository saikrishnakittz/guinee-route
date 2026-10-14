import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import FieldAgent from "./pages/FieldAgent";
import Dashboard from "./components/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/field-agent" element={<FieldAgent />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
