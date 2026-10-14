import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import FieldAgent from "./pages/FieldAgent";
import Dashboard from "./components/Dashboard";
import { useEffect } from "react";

function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (pathname !== "/") return;

    if (!hash || hash === "#live-operations" || hash === "#overview") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const id = decodeURIComponent(hash.slice(1));

    // Wait for the dashboard DOM to render.
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/field-agent" element={<FieldAgent />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
