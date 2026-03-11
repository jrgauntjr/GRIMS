import TodoList from '../components/TodoList'

function Home() {
  return (
    <div className="home-content">
      <h1>Welcome to GRIMS</h1>
      <p id="description">Inventory management for retro game stores and repair shops, with just a litte more.</p>
      <p id="glance"><strong>At a glance</strong></p>
      <TodoList readOnly />
    </div>
  )
}

export default Home
