import { ApolloProvider } from '@apollo/client';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import client from './lib/apollo';
import { SlugMapProvider } from './lib/slugMap';
import CharacterPage from './pages/CharacterPage';
import MovieDetailPage from './pages/MovieDetailPage';
import MoviesPage from './pages/MoviesPage';
import './App.css';

const PROJECT_TITLE = import.meta.env.VITE_PROJECT_TITLE || 'Star Wars Movies';

function App() {
  return (
    <ApolloProvider client={client}>
      <SlugMapProvider>
        <Router>
          <div className="min-h-screen bg-black text-white">
            <nav className="bg-black text-yellow-400 p-4 flex gap-4 border-b border-yellow-900">
              <Link to="/" className="font-bold text-2xl tracking-widest">{PROJECT_TITLE}</Link>
            </nav>
            <main className="p-4">
              <Routes>
                <Route path="/" element={<MoviesPage />} />
                <Route path="/movies/:slug" element={<MovieDetailPage />} />
                <Route path="/characters/:id" element={<CharacterPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </SlugMapProvider>
    </ApolloProvider>
  );
}

export default App
