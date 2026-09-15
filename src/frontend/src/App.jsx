import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import AssetsPage from './pages/AssetsPage.jsx'
import AssetDetailPage from './pages/AssetDetailPage.jsx'
import WeatherPage from './pages/WeatherPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <Routes>
            <Route path="/"              element={<DashboardPage />} />
            <Route path="/assets"        element={<AssetsPage />} />
            <Route path="/assets/:id"    element={<AssetDetailPage />} />
            <Route path="/weather"       element={<WeatherPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
