import TodoList from './components/TodoList'
import './App.css'
import logo from './assets/GRIMS_logo.png'

function App() {
  return (
    <main id="root-inner">
      <img src={logo} alt="GRIMS" className="logo" />
      <div className="button-column">
        <button className="stacked-btn">TEMPNAME</button>
        <button className="stacked-btn">TEMPNAME</button>
        <button className="stacked-btn">TEMPNAME</button>
        <button className="stacked-btn">TEMPNAME</button>
      </div>
      <TodoList />
    </main>
  )
}

export default App
