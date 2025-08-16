
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MoviesPage from './pages/MoviesPage';
import MovieDetailPage from './pages/MovieDetailPage';
import './App.css';


function App() {

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-900 text-white p-4 flex gap-4">
          <Link to="/" className="font-bold">Star Wars Movies</Link>
        </nav>
        <main className="p-4">
          <Routes>
            <Route path="/" element={<MoviesPage />} />
            <Route path="/movie/:id" element={<MovieDetailPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
