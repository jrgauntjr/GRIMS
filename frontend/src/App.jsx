import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import logo from './assets/GRIMS_logo.png'
import Home from './pages/Home'
import Todos from './pages/Todos'
import Jobs from './pages/Jobs'
import Reports from './pages/Reports'
import Inventory from './pages/Inventory'

function App() {
  return (
    <BrowserRouter>
      <main id="root-inner">
        <Link to="/">
          <img src={logo} alt="GRIMS" className="logo" />
        </Link>
        <div className="button-column">
          <Link to="/" className="stacked-btn">
            Home
          </Link>
          <Link to="/inventory" className="stacked-btn">
            Inventory
          </Link>
          <Link to="/todos" className="stacked-btn">
            To-do
          </Link>
          <Link to="/jobs" className="stacked-btn">
            Jobs
          </Link>
          <Link to="/reports" className="stacked-btn">
            Reports
          </Link>
        </div>
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/todos" element={<Todos />} />
            <Route path="/jobs" element={<Jobs />} />
          </Routes>
        </div>
        <div className="footer">
          <h2>GRIMS 2026 Joseph Gaunt</h2>
        </div>
      </main>
    </BrowserRouter>
  )
}

export default App
