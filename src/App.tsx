
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import client from './lib/apollo';
import MoviesPage from './pages/MoviesPage';
import MovieDetailPage from './pages/MovieDetailPage';
import './App.css';

const PROJECT_TITLE = import.meta.env.VITE_PROJECT_TITLE || 'Star Wars Movies';

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <div className="min-h-screen bg-black text-white">
          <nav className="bg-black text-yellow-400 p-4 flex gap-4 border-b border-yellow-900">
            <Link to="/" className="font-bold text-2xl tracking-widest">{PROJECT_TITLE}</Link>
          </nav>
          <main className="p-4">
            <Routes>
              <Route path="/" element={<MoviesPage />} />
              <Route path="/movie/:id" element={<MovieDetailPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App
