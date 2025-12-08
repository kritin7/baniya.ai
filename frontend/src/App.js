import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import CCHelperPage from "@/pages/CCHelperPage";
import QCommercePage from "@/pages/QCommercePage";
import SalesNavigatorPage from "@/pages/SalesNavigatorPage";
import Navigation from "@/components/Navigation";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App min-h-screen bg-background">
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cc-helper" element={<CCHelperPage />} />
          <Route path="/qcommerce" element={<QCommercePage />} />
          <Route path="/sales-navigator" element={<SalesNavigatorPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;