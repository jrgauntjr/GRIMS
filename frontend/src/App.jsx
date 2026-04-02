import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import logo from './assets/GRIMS_logo.png'
import homeDark from './assets/home_dark.png'
import inventoryDark from './assets/inventory_dark.png'
import todoDark from './assets/todo_dark.png'
import jobsDark from './assets/jobs_dark.png'
import reportDark from './assets/report_dark.png'
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
          <Link to="/" className="stacked-btn stacked-btn--with-icon">
            <img src={homeDark} alt="" className="stacked-btn-icon" width={20} height={20} />
            <span className="stacked-btn-label">Home</span>
            <span className="stacked-btn-spacer" aria-hidden="true" />
          </Link>
          <Link to="/inventory" className="stacked-btn stacked-btn--with-icon">
            <img src={inventoryDark} alt="" className="stacked-btn-icon" width={20} height={20} />
            <span className="stacked-btn-label">Inventory</span>
            <span className="stacked-btn-spacer" aria-hidden="true" />
          </Link>
          <Link to="/todos" className="stacked-btn stacked-btn--with-icon">
            <img src={todoDark} alt="" className="stacked-btn-icon" width={20} height={20} />
            <span className="stacked-btn-label">To-do</span>
            <span className="stacked-btn-spacer" aria-hidden="true" />
          </Link>
          <Link to="/jobs" className="stacked-btn stacked-btn--with-icon">
            <img src={jobsDark} alt="" className="stacked-btn-icon" width={20} height={20} />
            <span className="stacked-btn-label">Jobs</span>
            <span className="stacked-btn-spacer" aria-hidden="true" />
          </Link>
          <Link to="/reports" className="stacked-btn stacked-btn--with-icon">
            <img src={reportDark} alt="" className="stacked-btn-icon" width={20} height={20} />
            <span className="stacked-btn-label">Reports</span>
            <span className="stacked-btn-spacer" aria-hidden="true" />
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
          <h2>G.R.I.M.S 2026 Joseph Gaunt</h2>
        </div>
      </main>
    </BrowserRouter>
  )
}

export default App
